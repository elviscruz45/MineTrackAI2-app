import React from "react";

// Define types for environmental data
interface EnvironmentIncident {
  id: string;
  date: string;
  type: "Spill" | "Emission" | "Waste" | "Water" | "Other";
  severity: "Critical" | "Major" | "Minor";
  location: string;
  status: "Active" | "Contained" | "Resolved";
  description: string;
  impactArea: string[];
  mitigationActions: string[];
  responsibleTeam: string;
}

interface EnvironmentKPI {
  category: string;
  metrics: {
    label: string;
    current: number;
    target: number;
    unit: string;
    trend: "improving" | "declining" | "stable";
    compliance: "within" | "near" | "exceeded";
  }[];
}

interface Props {
  selectedProject?: string;
}

const EnvironmentView: React.FC<Props> = ({ selectedProject }) => {
  // Mock environmental KPIs
  const environmentKPIs: EnvironmentKPI[] = [
    {
      category: "Water Management",
      metrics: [
        {
          label: "Water Consumption",
          current: 850,
          target: 1000,
          unit: "m³/day",
          trend: "improving",
          compliance: "within",
        },
        {
          label: "Water Recycling Rate",
          current: 85,
          target: 80,
          unit: "%",
          trend: "improving",
          compliance: "within",
        },
        {
          label: "pH Level",
          current: 7.2,
          target: 7.0,
          unit: "pH",
          trend: "stable",
          compliance: "within",
        },
      ],
    },
    {
      category: "Air Quality",
      metrics: [
        {
          label: "Dust Emissions",
          current: 48,
          target: 45,
          unit: "µg/m³",
          trend: "declining",
          compliance: "near",
        },
        {
          label: "CO2 Emissions",
          current: 95,
          target: 100,
          unit: "tons/day",
          trend: "improving",
          compliance: "within",
        },
      ],
    },
    {
      category: "Waste Management",
      metrics: [
        {
          label: "Solid Waste Recycling",
          current: 75,
          target: 80,
          unit: "%",
          trend: "improving",
          compliance: "near",
        },
        {
          label: "Hazardous Waste",
          current: 3.2,
          target: 4.0,
          unit: "tons/day",
          trend: "improving",
          compliance: "within",
        },
      ],
    },
    {
      category: "Energy Efficiency",
      metrics: [
        {
          label: "Energy Consumption",
          current: 280,
          target: 300,
          unit: "MWh/day",
          trend: "improving",
          compliance: "within",
        },
        {
          label: "Renewable Energy Usage",
          current: 28,
          target: 30,
          unit: "%",
          trend: "improving",
          compliance: "near",
        },
      ],
    },
  ];

  // Mock environmental incidents
  const environmentIncidents: EnvironmentIncident[] = [
    {
      id: "ENV-001",
      date: "2025-08-09",
      type: "Water",
      severity: "Minor",
      location: "Primary Crushing Area - Drainage System",
      status: "Resolved",
      description: "Elevated sediment levels detected in water discharge",
      impactArea: ["Local watershed", "Settling ponds"],
      mitigationActions: [
        "Increased settling time in retention ponds",
        "Additional filtration system installed",
        "Daily water quality monitoring implemented",
      ],
      responsibleTeam: "Environmental Management",
    },
    {
      id: "ENV-002",
      date: "2025-08-08",
      type: "Emission",
      severity: "Major",
      location: "Crusher Dust Collection System",
      status: "Active",
      description:
        "Dust suppression system malfunction leading to increased particulate emissions",
      impactArea: ["Air quality", "Worker safety", "Local community"],
      mitigationActions: [
        "Emergency repair of dust collection system",
        "Temporary operation reduction",
        "Community notification issued",
      ],
      responsibleTeam: "Maintenance & Environmental",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "#dc3545";
      case "Contained":
        return "#ffc107";
      case "Resolved":
        return "#198754";
      default:
        return "#6c757d";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "#dc3545";
      case "Major":
        return "#ffc107";
      case "Minor":
        return "#198754";
      default:
        return "#6c757d";
    }
  };

  const getComplianceColor = (compliance: string) => {
    switch (compliance) {
      case "within":
        return "#198754";
      case "near":
        return "#ffc107";
      case "exceeded":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Project Title */}
      {selectedProject && (
        <h1
          style={{
            marginBottom: "30px",
            color: "#2A3B76",
            fontSize: "24px",
            borderBottom: "2px solid #e9ecef",
            paddingBottom: "10px",
          }}
        >
          Environmental Monitoring: {selectedProject}
        </h1>
      )}

      {/* Environmental KPIs Grid */}
      <div style={{ marginBottom: "40px" }}>
        {environmentKPIs.map((category) => (
          <div key={category.category} style={{ marginBottom: "30px" }}>
            <h2
              style={{
                marginBottom: "20px",
                color: "#1976d2",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span>{category.category}</span>
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
              }}
            >
              {category.metrics.map((metric) => (
                <div
                  key={metric.label}
                  style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    border: `1px solid ${getComplianceColor(
                      metric.compliance
                    )}`,
                  }}
                >
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    {metric.label}
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: getComplianceColor(metric.compliance),
                      marginTop: "8px",
                      display: "flex",
                      alignItems: "baseline",
                      gap: "5px",
                    }}
                  >
                    {metric.current}
                    <span style={{ fontSize: "14px", color: "#666" }}>
                      {metric.unit}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "4px",
                    }}
                  >
                    Target: {metric.target} {metric.unit}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color:
                        metric.trend === "improving"
                          ? "#198754"
                          : metric.trend === "declining"
                          ? "#dc3545"
                          : "#666",
                      marginTop: "4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {metric.trend === "improving"
                      ? "▲"
                      : metric.trend === "declining"
                      ? "▼"
                      : "►"}
                    {metric.trend.charAt(0).toUpperCase() +
                      metric.trend.slice(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Environmental Incidents Section */}
      <div>
        <h2
          style={{
            marginBottom: "20px",
            color: "#1976d2",
            fontSize: "18px",
          }}
        >
          Environmental Incidents & Actions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {environmentIncidents.map((incident) => (
            <div
              key={incident.id}
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                border: "1px solid #e9ecef",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
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
                  <div
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      backgroundColor: getSeverityColor(incident.severity),
                      color: "white",
                    }}
                  >
                    {incident.severity}
                  </div>
                </div>
                <div style={{ color: "#666", fontSize: "14px" }}>
                  {incident.id}
                </div>
              </div>

              <div
                style={{
                  marginBottom: "8px",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                {incident.type} Incident
              </div>

              <div style={{ marginBottom: "8px", fontSize: "14px" }}>
                <strong>Date:</strong> {incident.date}
              </div>

              <div style={{ marginBottom: "8px", fontSize: "14px" }}>
                <strong>Location:</strong> {incident.location}
              </div>

              <div style={{ marginBottom: "12px", fontSize: "14px" }}>
                <strong>Description:</strong> {incident.description}
              </div>

              <div style={{ marginBottom: "12px", fontSize: "14px" }}>
                <strong>Impact Areas:</strong>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "4px",
                  }}
                >
                  {incident.impactArea.map((area, index) => (
                    <span
                      key={index}
                      style={{
                        padding: "2px 8px",
                        borderRadius: "12px",
                        backgroundColor: "#e9ecef",
                        fontSize: "12px",
                        color: "#666",
                      }}
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "8px", fontSize: "14px" }}>
                <strong>Mitigation Actions:</strong>
                <ul
                  style={{
                    margin: "8px 0 0 20px",
                    padding: 0,
                    fontSize: "13px",
                  }}
                >
                  {incident.mitigationActions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>

              <div style={{ fontSize: "14px", color: "#666" }}>
                <strong>Responsible Team:</strong> {incident.responsibleTeam}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnvironmentView;
