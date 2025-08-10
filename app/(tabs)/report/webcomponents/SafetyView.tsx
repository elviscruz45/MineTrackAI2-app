import React from "react";

// Define types for our safety data
interface SafetyIncident {
  id: string;
  date: string;
  type: string;
  severity: "High" | "Medium" | "Low";
  description: string;
  location: string;
  status: "Open" | "Closed" | "In Progress";
  actions: string[];
  responsibleParty: string;
}

interface SafetyKPI {
  label: string;
  value: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "stable";
}

interface Props {
  selectedProject?: string;
}

const SafetyView: React.FC<Props> = ({ selectedProject }) => {
  // Mock KPI data
  const safetyKPIs: SafetyKPI[] = [
    {
      label: "Total Recordable Incident Rate (TRIR)",
      value: 0.45,
      target: 0.5,
      unit: "incidents per 200,000 hours",
      trend: "down",
    },
    {
      label: "Lost Time Injury Frequency Rate (LTIFR)",
      value: 0.12,
      target: 0.2,
      unit: "incidents per 1,000,000 hours",
      trend: "down",
    },
    {
      label: "Near Miss Reports",
      value: 24,
      target: 20,
      unit: "reports this month",
      trend: "up",
    },
    {
      label: "Safety Training Completion",
      value: 95,
      target: 100,
      unit: "%",
      trend: "up",
    },
  ];

  // Mock incident data
  const safetyIncidents: SafetyIncident[] = [
    {
      id: "INC-001",
      date: "2025-08-09",
      type: "Near Miss",
      severity: "Medium",
      description: "Loose equipment noticed during routine inspection",
      location: "Section 1 - Primary Crusher",
      status: "Closed",
      actions: [
        "Equipment secured immediately",
        "Inspection protocol updated",
        "Staff briefing conducted",
      ],
      responsibleParty: "Maintenance Team",
    },
    {
      id: "INC-002",
      date: "2025-08-08",
      type: "Safety Observation",
      severity: "Low",
      description: "PPE compliance issue observed during shift change",
      location: "Main Access Point",
      status: "Closed",
      actions: [
        "Reminder sent to all staff",
        "Additional PPE stations installed",
      ],
      responsibleParty: "Safety Department",
    },
    // Add more incidents as needed
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "#dc3545";
      case "In Progress":
        return "#ffc107";
      case "Closed":
        return "#198754";
      default:
        return "#6c757d";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High":
        return "#dc3545";
      case "Medium":
        return "#ffc107";
      case "Low":
        return "#198754";
      default:
        return "#6c757d";
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* KPI Section */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ marginBottom: "20px", color: "#1976d2" }}>Safety KPIs</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          {safetyKPIs.map((kpi) => (
            <div
              key={kpi.label}
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ fontSize: "14px", color: "#666" }}>{kpi.label}</div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: kpi.value <= kpi.target ? "#198754" : "#dc3545",
                  marginTop: "8px",
                }}
              >
                {kpi.value} {kpi.unit}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginTop: "4px",
                }}
              >
                Target: {kpi.target} {kpi.unit}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: kpi.trend === "up" ? "#198754" : "#dc3545",
                  marginTop: "4px",
                }}
              >
                {kpi.trend === "up" ? "▲" : "▼"} Trend
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Incidents Section */}
      <div>
        <h2 style={{ marginBottom: "20px", color: "#1976d2" }}>
          Recent Safety Events
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {safetyIncidents.map((incident) => (
            <div
              key={incident.id}
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <div style={{ fontWeight: "bold" }}>{incident.type}</div>
                <div
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    backgroundColor: getStatusColor(incident.status),
                    color: "white",
                  }}
                >
                  {incident.status}
                </div>
              </div>

              <div style={{ marginBottom: "8px", fontSize: "14px" }}>
                <strong>Date:</strong> {incident.date}
              </div>

              <div style={{ marginBottom: "8px", fontSize: "14px" }}>
                <strong>Location:</strong> {incident.location}
              </div>

              <div style={{ marginBottom: "8px", fontSize: "14px" }}>
                <strong>Severity:</strong>{" "}
                <span
                  style={{
                    color: getSeverityColor(incident.severity),
                    fontWeight: "bold",
                  }}
                >
                  {incident.severity}
                </span>
              </div>

              <div style={{ marginBottom: "12px", fontSize: "14px" }}>
                <strong>Description:</strong> {incident.description}
              </div>

              <div style={{ marginBottom: "8px", fontSize: "14px" }}>
                <strong>Actions Taken:</strong>
                <ul
                  style={{
                    margin: "8px 0 0 20px",
                    padding: 0,
                    fontSize: "13px",
                  }}
                >
                  {incident.actions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>

              <div style={{ fontSize: "14px" }}>
                <strong>Responsible Party:</strong> {incident.responsibleParty}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SafetyView;
