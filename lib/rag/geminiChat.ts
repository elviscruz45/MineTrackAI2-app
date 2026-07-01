/**
 * Synthesize RAG answers with Gemini when API key is configured.
 */

function getGeminiApiKey(): string {
  return (
    process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    ""
  );
}

export async function generateRagAnswer(
  question: string,
  context: string,
): Promise<string | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey || !context.trim()) return null;

  const prompt = `Eres MineTrack AI, asistente experto en planificación de mantenimiento y operaciones de planta concentradora minera (chancado, molienda, flotación).

Responde en español, de forma clara y profesional para supervisores y gerentes de mantenimiento.
Basa tu respuesta ÚNICAMENTE en el contexto recuperado de la base de datos.
Si el contexto no alcanza para responder con certeza, indícalo y sugiere qué dato falta (tag de equipo, proyecto activo, etc.).
Usa viñetas o secciones breves cuando ayude a la lectura.

CONTEXTO DE LA BASE DE DATOS:
${context.slice(0, 12000)}

PREGUNTA:
${question}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.25,
            maxOutputTokens: 1200,
          },
        }),
      },
    );

    if (!res.ok) {
      throw new Error(`Gemini generateContent failed: ${res.status}`);
    }

    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof text === "string" && text.trim() ? text.trim() : null;
  } catch (err) {
    console.warn("Gemini chat synthesis failed:", err);
    return null;
  }
}

export function isGeminiConfigured(): boolean {
  return Boolean(getGeminiApiKey());
}
