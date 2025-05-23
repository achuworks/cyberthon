import React, { useState } from "react";
import axios from "axios";

const Report = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleGenerateReport = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await axios({
        url: "http://localhost:5000/generate-report",
        method: "POST",
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Crime_Report.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading report:", error);
      setErrorMsg("Failed to download report. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>📄 Crime Report & Insights</h2>
        <p style={styles.description}>
          Generate a downloadable PDF analyzing crime hotspots, patterns, and trends.
        </p>

        <button
          onClick={handleGenerateReport}
          disabled={loading}
          style={{
            ...styles.button,
            backgroundColor: loading ? "#999" : "#007bff",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Generating..." : "Download PDF Report"}
        </button>

        {errorMsg && <p style={styles.error}>{errorMsg}</p>}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f7f9fc",
  },
  card: {
    background: "#fff",
    padding: "30px 40px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    maxWidth: "500px",
    width: "100%",
    textAlign: "center",
  },
  heading: {
    marginBottom: "16px",
    color: "#333",
    fontSize: "1.5rem",
  },
  description: {
    marginBottom: "24px",
    color: "#555",
    fontSize: "1rem",
  },
  button: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "1rem",
    transition: "background 0.3s ease",
  },
  error: {
    marginTop: "15px",
    color: "#d9534f",
    fontWeight: "bold",
  },
};

export default Report;
