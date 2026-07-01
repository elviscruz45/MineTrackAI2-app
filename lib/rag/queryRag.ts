import {
  parseQuestionIntent,
  getDelayedActivities,
  getHseEventsByDate,
  getEquipmentHistory,
  formatDelayedActivitiesForAnswer,
  formatHseEventsForAnswer,
  formatEquipmentHistoryForAnswer,
} from "@/lib/db/ragQueries";
import { matchKnowledge } from "@/lib/db/knowledgeEmbeddings";
import { generateRagAnswer } from "@/lib/rag/geminiChat";

export interface RagAnswer {
  answer: string;
  sources: string[];
  mode: "structured" | "vector" | "hybrid";
}

export async function queryRag(question: string): Promise<RagAnswer> {
  const intent = parseQuestionIntent(question);
  const structuredParts: string[] = [];
  const sources: string[] = [];

  if (intent.isDelayed) {
    const delayed = await getDelayedActivities(15);
    structuredParts.push(
      "## Actividades atrasadas\n" + formatDelayedActivitiesForAnswer(delayed)
    );
    sources.push("v_delayed_activities");
  }

  if (intent.isHse) {
    const hseDate = intent.isToday ? new Date() : undefined;
    const hse = await getHseEventsByDate(hseDate, 20);
    const label = intent.isToday ? "hoy" : "recientes";
    structuredParts.push(
      `## Eventos de seguridad (${label})\n` + formatHseEventsForAnswer(hse)
    );
    sources.push("v_hse_events_daily");
  }

  if (intent.tagEquipo && (intent.isEquipmentHistory || !intent.isDelayed)) {
    const history = await getEquipmentHistory(intent.tagEquipo, 20);
    structuredParts.push(
      `## Historial equipo ${intent.tagEquipo}\n` +
        formatEquipmentHistoryForAnswer(history, intent.tagEquipo)
    );
    sources.push("v_equipment_history");
  }

  const matches = await matchKnowledge(question, {
    matchCount: 6,
    tagEquipo: intent.tagEquipo ?? undefined,
    isHse: intent.isHse ? true : undefined,
  });

  const vectorContext = matches
    .map((m, i) => `[${i + 1}] (${m.doc_type}, sim=${m.similarity.toFixed(2)})\n${m.content}`)
    .join("\n\n");

  if (matches.length) sources.push("knowledge_embeddings");

  const mode: RagAnswer["mode"] =
    structuredParts.length && vectorContext
      ? "hybrid"
      : structuredParts.length
      ? "structured"
      : "vector";

  if (structuredParts.length === 0 && matches.length === 0) {
    return {
      answer:
        "No encontré información en la base de datos para responder esa pregunta. Intenta mencionar un tag de equipo (ej. 001-CR002), preguntar por actividades atrasadas o eventos de seguridad de hoy.",
      sources: [],
      mode: "structured",
    };
  }

  const contextBody = [
    structuredParts.length ? structuredParts.join("\n\n") : "",
    vectorContext ? `## Contexto semántico\n${vectorContext}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const geminiAnswer = await generateRagAnswer(question, contextBody);
  if (geminiAnswer) {
    return { answer: geminiAnswer, sources, mode };
  }

  const answer = buildAnswer(question, structuredParts, vectorContext, intent);
  return { answer, sources, mode };
}

function buildAnswer(
  question: string,
  structuredParts: string[],
  vectorContext: string,
  intent: ReturnType<typeof parseQuestionIntent>
): string {
  const intro =
    "Soy MineTrack AI, tu asistente de planificación de mantenimiento para la planta concentradora.\n\n";

  let body = "";

  if (structuredParts.length) {
    body += structuredParts.join("\n\n") + "\n\n";
  }

  if (vectorContext) {
    body += "## Contexto adicional (búsqueda semántica)\n" + vectorContext + "\n\n";
  }

  if (intent.tagEquipo && structuredParts.some((p) => p.includes("Historial"))) {
    body += `**Resumen:** Los registros anteriores corresponden al equipo **${intent.tagEquipo}**, incluyendo trabajos de parada de planta y mantenimiento diario cuando están disponibles.\n`;
  } else if (intent.isDelayed) {
    body +=
      "**Resumen:** Las actividades listadas superaron su fecha fin planificada sin fecha fin real registrada. Prioriza las de mayor días de atraso y ruta crítica.\n";
  } else if (intent.isHse) {
    body +=
      "**Resumen:** Eventos HSE reportados en campo. Revisa clasificación (Near Miss, LTI, etc.) y horas perdidas para acciones correctivas.\n";
  } else {
    body +=
      "**Resumen:** Información recuperada de planificación, eventos de campo y mantenimiento operacional indexados en MineTrack.\n";
  }

  return intro + body;
}
