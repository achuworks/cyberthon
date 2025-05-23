import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [allocations, setAllocations] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/resource-allocation")
      .then(res => setAllocations(res.data.allocation))
      .catch(err => console.error("Error loading data:", err));
  }, []);

  return (
    <div style={{
      padding: "32px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: "linear-gradient(to right, #f8fafc, #e2e8f0)",
      minHeight: "100vh"
    }}>
      <h1 style={{
        fontSize: "32px",
        fontWeight: "bold",
        marginBottom: "32px",
        color: "#1e293b"
      }}>
        🚓 Police Resource Allocation Dashboard
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
        {/* Left Column */}
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "600", marginBottom: "20px", color: "#334155" }}>
            🔥 Top Priority Hotspots
          </h2>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#ffffff",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
          }}>
            <thead style={{ backgroundColor: "#f1f5f9", color: "#1e293b" }}>
              <tr>
                {["Hotspot", "Severity", "Avg Incidents", "Patrols Needed", "Peak Day"].map((title, idx) => (
                  <th key={idx} style={{
                    padding: "14px 16px",
                    borderBottom: "2px solid #e2e8f0",
                    fontWeight: "600",
                    textAlign: "left"
                  }}>{title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allocations.map((a, idx) => (
                <tr key={idx} style={{
                  backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f9fafb",
                  transition: "background-color 0.3s",
                  cursor: "pointer"
                }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#ffffff" : "#f9fafb"}
                >
                  <td style={{ padding: "14px 16px", fontWeight: "500" }}>{a.hotspot}</td>
                  <td style={{ padding: "14px 16px" }}>{a.severity}</td>
                  <td style={{ padding: "14px 16px" }}>{a.averageIncidents}</td>
                  <td style={{ padding: "14px 16px", fontWeight: "600", color: "#b91c1c" }}>{a.patrolsNeeded}</td>
                  <td style={{ padding: "14px 16px" }}>{a.peakDay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Column */}
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "600", marginBottom: "20px", color: "#334155" }}>
            📊 Summary Insights
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{
              padding: "20px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              background: "#ffffff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
            }}>
              <strong>Total Hotspots:</strong> {allocations.length}
            </div>

            <div style={{
              padding: "20px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              background: "#ffffff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
            }}>
              <strong>Avg Patrols per Hotspot:</strong> {
                allocations.length > 0
                  ? (
                      allocations.reduce((acc, cur) => acc + cur.patrolsNeeded, 0) / allocations.length
                    ).toFixed(2)
                  : 0
              }
            </div>

            <div style={{
              padding: "20px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              background: "#ffffff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
            }}>
              <strong>Peak Day Analysis:</strong>
              <div style={{ marginTop: "8px" }}>
                {allocations.map((a, idx) => (
                  <div key={idx} style={{ marginBottom: "4px", color: "#475569" }}>
                    📍 <strong>{a.hotspot}:</strong> {a.peakDay}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
