/**
 * Generate 768-dim embedding vectors.
 * Uses Gemini text-embedding-004 when API key is available;
 * falls back to deterministic hash embedding for dev/offline.
 */

const DIM = 768;

function hashString(str: string): number[] {
  const vec = new Array(DIM).fill(0);
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    vec[i % DIM] += c / 255;
    vec[(i * 7 + 13) % DIM] += ((c * 31) % 256) / 256;
    vec[(i * 17 + 3) % DIM] += ((c * 97) % 256) / 256;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

async function embedWithGemini(text: string, apiKey: string): Promise<number[]> {
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
  if (!res.ok) {
    throw new Error(`Gemini embed failed: ${res.status}`);
  }
  const json = await res.json();
  const values = json?.embedding?.values;
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error("Gemini returned empty embedding");
  }
  return values;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey =
    process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    "";

  if (apiKey && text.trim()) {
    try {
      return await embedWithGemini(text, apiKey);
    } catch (err) {
      console.warn("Gemini embedding failed, using hash fallback:", err);
    }
  }

  return hashString(text.trim() || "empty");
}

export const EMBEDDING_DIM = DIM;
