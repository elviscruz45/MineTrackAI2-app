// Lista de tags de equipos para el dropdown del formulario AIT.
// Sin referencias a imágenes para evitar errores de resolución de assets en web.
// Agrega o quita entradas aquí para actualizar el dropdown.

export const tagEquipoList: { key: string; value: string }[] = [
  { key: "C2-REU",   value: "Reuniones  —  C2-REU" },
  { key: "001-CH2",  value: "Dump Pocket / Chancadora Primaria  —  001-CH2" },
  { key: "001-CN002", value: "Cinta Transportadora N°002  —  001-CN002" },
  { key: "001-RB002", value: "Rompedor de Bloques N°002  —  001-RB002" },
  { key: "001-CR002", value: "Chancadora N°002  —  001-CR002" },
  { key: "C2-CR001", value: "Chancadora Primaria (C2)  —  C2-CR001" },
  { key: "C2-ML001", value: "Molino de Bolas (C2)  —  C2-ML001" },
  { key: "C2-CR021", value: "Chancadora Secundaria (C2)  —  C2-CR021" },
  { key: "C2-CV001", value: "Faja Transportadora (C2)  —  C2-CV001" },
  { key: "C2-SC001", value: "Zaranda Vibratoria (C2)  —  C2-SC001" },
  { key: "SEG-C2",   value: "Seguridad (C2)  —  SEG-C2" },
  { key: "MA-C2",    value: "Medio Ambiente (C2)  —  MA-C2" },
  { key: "C1-CR001", value: "Chancadora Primaria (C1)  —  C1-CR001" },
  { key: "C1-ML001", value: "Molino de Bolas (C1)  —  C1-ML001" },
  { key: "C1-CR021", value: "Chancadora Secundaria (C1)  —  C1-CR021" },
  { key: "C1-CV001", value: "Faja Transportadora (C1)  —  C1-CV001" },
  { key: "C1-SC001", value: "Zaranda Vibratoria (C1)  —  C1-SC001" },
  { key: "SEG-C1",   value: "Seguridad (C1)  —  SEG-C1" },
  { key: "MA-C1",    value: "Medio Ambiente (C1)  —  MA-C1" },
];

export const getTagEquipoLabel = (tag?: string): string => {
  const key = String(tag || "").trim();
  if (!key) return "";

  const found = tagEquipoList.find((item) => item.key === key);
  return found?.key || key;
};
