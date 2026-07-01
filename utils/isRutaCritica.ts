const AFFIRMATIVE = new Set(["si", "yes", "true", "1", "verdadero"]);

function normalizeRutaCriticaValue(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function isRutaCritica(value: unknown): boolean {
  if (value === true) return true;
  if (value === false || value == null) return false;
  if (typeof value === "number") return value === 1;

  const normalized = normalizeRutaCriticaValue(value);
  if (!normalized) return false;

  return AFFIRMATIVE.has(normalized);
}
