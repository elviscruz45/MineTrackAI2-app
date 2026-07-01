import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DIM = 768;

function hashEmbedding(text: string): number[] {
  const vec = new Array(DIM).fill(0);
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    vec[i % DIM] += c / 255;
    vec[(i * 7 + 13) % DIM] += ((c * 31) % 256) / 256;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

async function embedText(text: string): Promise<number[]> {
  const apiKey = Deno.env.get("GEMINI_API_KEY") ?? Deno.env.get("GOOGLE_API_KEY");
  if (!apiKey) return hashEmbedding(text);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: { parts: [{ text: text.slice(0, 8000) }] },
          outputDimensionality: DIM,
        }),
      }
    );
    const json = await res.json();
    return json?.embedding?.values ?? hashEmbedding(text);
  } catch {
    return hashEmbedding(text);
  }
}

async function synthesizeAnswer(question: string, context: string): Promise<string | null> {
  const apiKey = Deno.env.get("GEMINI_API_KEY") ?? Deno.env.get("GOOGLE_API_KEY");
  if (!apiKey || !context.trim()) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{
              text: `Eres MineTrack AI, asistente de mantenimiento en planta concentradora. Responde en español usando solo este contexto:\n\n${context.slice(0, 12000)}\n\nPregunta: ${question}`,
            }],
          }],
          generationConfig: { temperature: 0.25, maxOutputTokens: 1200 },
        }),
      }
    );
    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof text === "string" && text.trim() ? text.trim() : null;
  } catch {
    return null;
  }
}

function parseIntent(q: string) {
  const tagMatch = q.match(/\b([A-Z0-9]+-[A-Z0-9]+|\d{3}-[A-Z]{2}\d{3})\b/i);
  const lower = q.toLowerCase();
  return {
    tag: tagMatch?.[1]?.toUpperCase() ?? null,
    isHse: /seguridad|hse|near miss|lti/i.test(lower),
    isDelayed: /atrasad|retras|pendiente|crítica|critica/i.test(lower),
    isToday: /hoy|este día|este dia|del día|del dia/i.test(lower),
  };
}

Deno.serve(async (req) => {
  try {
    const { question } = await req.json();
    if (!question?.trim()) {
      return new Response(JSON.stringify({ error: "Missing question" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const intent = parseIntent(question);
    const parts: string[] = [];

    if (intent.isDelayed) {
      const { data } = await supabase
        .from("v_delayed_activities")
        .select("*")
        .order("dias_atraso", { ascending: false })
        .limit(15);
      if (data?.length) {
        parts.push(
          "ACTIVIDADES ATRASADAS:\n" +
            data
              .map(
                (r: Record<string, unknown>, i: number) =>
                  `${i + 1}. [${r.activity_codigo}] ${r.nombre_servicio} — ${r.dias_atraso}d atraso — tag ${r.tag_equipo}`
              )
              .join("\n")
        );
      }
    }

    if (intent.isHse) {
      const start = new Date();
      if (intent.isToday) start.setHours(0, 0, 0, 0);
      else start.setDate(start.getDate() - 7);
      const end = new Date();
      const { data } = await supabase
        .from("v_hse_events_daily")
        .select("*")
        .gte("fecha", start.toISOString())
        .lte("fecha", end.toISOString())
        .order("fecha", { ascending: false })
        .limit(20);
      if (data?.length) {
        parts.push(
          "EVENTOS HSE:\n" +
            data
              .map(
                (r: Record<string, unknown>, i: number) =>
                  `${i + 1}. [${r.clasificacion_hse}] ${r.titulo ?? r.descripcion}`
              )
              .join("\n")
        );
      }
    }

    if (intent.tag) {
      const { data } = await supabase
        .from("v_equipment_history")
        .select("*")
        .eq("tag_code", intent.tag)
        .order("fecha", { ascending: false })
        .limit(20);
      if (data?.length) {
        parts.push(
          `HISTORIAL ${intent.tag}:\n` +
            data
              .map(
                (r: Record<string, unknown>, i: number) =>
                  `${i + 1}. [${r.source}] ${r.titulo}`
              )
              .join("\n")
        );
      }
    }

    const embedding = await embedText(question);
    const { data: matches } = await supabase.rpc("match_knowledge", {
      query_embedding: embedding,
      match_count: 6,
      filter_tag: intent.tag,
      filter_project_id: null,
      filter_doc_type: null,
      filter_is_hse: intent.isHse ? true : null,
    });

    if (matches?.length) {
      parts.push(
        "CONTEXTO SEMÁNTICO:\n" +
          matches.map((m: { content: string }) => m.content).join("\n---\n")
      );
    }

    const context = parts.join("\n\n") || "Sin datos relevantes en la base.";
    const synthesized = await synthesizeAnswer(question, context);
    const answer =
      synthesized ??
      `Soy MineTrack AI, ingeniero de planificación de mantenimiento.\n\n${context}\n\nPregunta: ${question}`;

    return new Response(
      JSON.stringify({ answer, sources: parts.length, mode: "hybrid" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
