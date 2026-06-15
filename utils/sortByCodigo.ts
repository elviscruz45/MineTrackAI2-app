export const compareCodigo = (a: string, b: string) => {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;

  const aParts = a.split(".").map(Number);
  const bParts = b.split(".").map(Number);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const diff = (aParts[i] ?? 0) - (bParts[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
};

export const sortByCodigo = <T extends Record<string, any>>(
  arr: T[],
  key: string = "Codigo"
): T[] => {
  return [...arr].sort((a, b) =>
    compareCodigo(a[key] || "", b[key] || "")
  );
};
