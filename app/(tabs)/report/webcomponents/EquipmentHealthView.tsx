import React, { useEffect, useState } from "react";
import {
  getEquipmentHealthStatus,
} from "@/lib/db/equipmentTimeline";
import { getAllEquipmentTags } from "@/lib/db/equipmentTags";
import type { EquipmentTagRow } from "@/lib/db/types";

const ESTADO_COLORS: Record<string, string> = {
  operativo: "#198754",
  limitado: "#e6a817",
  parado: "#dc3545",
  en_mantenimiento: "#1976d2",
};

const EquipmentHealthView: React.FC = () => {
  const [tags, setTags] = useState<EquipmentTagRow[]>([]);
  const [health, setHealth] = useState<
    { tag_code: string; estado_equipo: string; fecha: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllEquipmentTags(), getEquipmentHealthStatus()])
      .then(([t, h]) => {
        setTags(t);
        setHealth(h);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const healthMap = Object.fromEntries(
    health.map((h) => [h.tag_code, h])
  );

  const counts = { operativo: 0, limitado: 0, parado: 0, en_mantenimiento: 0, sin_dato: 0 };
  tags.forEach((t) => {
    const estado = healthMap[t.tag_code]?.estado_equipo ?? "sin_dato";
    if (estado in counts) counts[estado as keyof typeof counts]++;
    else counts.sin_dato++;
  });

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: "#2A3B76" }}>
        Cargando estado de equipos…
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 0" }}>
      <h2
        style={{
          color: "#2A3B76",
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 20,
        }}
      >
        Estado de Equipos (último registro)
      </h2>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        {(
          [
            ["operativo", "Operativo"],
            ["limitado", "Limitado"],
            ["parado", "Parado"],
            ["en_mantenimiento", "En mantenimiento"],
            ["sin_dato", "Sin dato"],
          ] as const
        ).map(([key, label]) => (
          <div
            key={key}
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: "10px 16px",
              borderLeft: `4px solid ${ESTADO_COLORS[key] ?? "#94a3b8"}`,
              boxShadow: "0 1px 4px rgba(42,59,118,0.07)",
              minWidth: 120,
            }}
          >
            <div style={{ fontSize: 11, color: "#64748b" }}>{label}</div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: ESTADO_COLORS[key] ?? "#94a3b8",
              }}
            >
              {counts[key]}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(42,59,118,0.08)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
              {["Tag", "Equipo", "Área", "Estado", "Última actualización"].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      color: "#2A3B76",
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => {
              const h = healthMap[tag.tag_code];
              const estado = h?.estado_equipo ?? "sin dato";
              const color = ESTADO_COLORS[estado] ?? "#94a3b8";
              const fecha = h?.fecha
                ? new Date(h.fecha).toLocaleDateString("es-PE")
                : "—";
              return (
                <tr
                  key={tag.id}
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                >
                  <td style={{ padding: "10px 16px", fontWeight: 600 }}>
                    {tag.tag_code}
                  </td>
                  <td style={{ padding: "10px 16px" }}>{tag.nombre}</td>
                  <td style={{ padding: "10px 16px" }}>{tag.area ?? "—"}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <span
                      style={{
                        background: `${color}18`,
                        color,
                        padding: "3px 10px",
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    >
                      {estado.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td style={{ padding: "10px 16px", color: "#64748b" }}>
                    {fecha}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EquipmentHealthView;
