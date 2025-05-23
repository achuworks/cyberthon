import React, { useState } from "react";

// Input Component
const Input = ({ placeholder, onChange, style }) => (
  <input
    type="text"
    placeholder={placeholder}
    onChange={onChange}
    style={style}
  />
);

// Textarea Component
const Textarea = ({ placeholder, onChange, style }) => (
  <textarea
    placeholder={placeholder}
    onChange={onChange}
    style={style}
  />
);

// Button Component
const Button = ({ onClick, style, children }) => (
  <button onClick={onClick} style={style}>
    {children}
  </button>
);

// FileUploader Component
const FileUploader = ({ label, onChange, style }) => (
  <div style={style}>
    <label>{label}</label>
    <input type="file" onChange={onChange} />
  </div>
);

// ReportForm Component
function ReportForm() {
  const [report, setReport] = useState({
    type: "",
    description: "",
    location: "",
    file: null,
  });
  const [showReportForm, setShowReportForm] = useState(false);

  const toggleReportForm = () => setShowReportForm(!showReportForm);

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("type", report.type);
    formData.append("description", report.description);
    formData.append("location", report.location);
    if (report.file) {
      formData.append("file", report.file);
    }

    try {
      const response = await fetch("http://localhost:5000/submit-report", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("✅ Report submitted successfully!");
        setShowReportForm(false); // Close modal
        setReport({ type: "", description: "", location: "", file: null });
      } else {
        alert("❌ Failed to submit report.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("❌ Failed to submit report.");
    }
  };

  return (
    <div>
      {/* Floating Button */}
      <button
        onClick={toggleReportForm}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          padding: "12px 20px",
          borderRadius: "50%",
          backgroundColor: "#007bff",
          color: "white",
          fontSize: "16px",
          border: "none",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        Report
      </button>

      {/* Modal Overlay */}
      {showReportForm && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: "9999",
          }}
          onClick={toggleReportForm}
        >
          {/* Modal Content */}
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              Report Suspicious Activity
            </h2>

            <Input
              placeholder="Incident Type"
              onChange={(e) =>
                setReport({ ...report, type: e.target.value })
              }
              style={{ marginBottom: "8px", width: "100%" }}
            />

            <Textarea
              placeholder="Description"
              onChange={(e) =>
                setReport({ ...report, description: e.target.value })
              }
              style={{ marginBottom: "8px", width: "100%" }}
            />

            <Input
              placeholder="Location"
              onChange={(e) =>
                setReport({ ...report, location: e.target.value })
              }
              style={{ marginBottom: "8px", width: "100%" }}
            />
            <Input
              placeholder="Name"
              onChange={(e) =>
                setReport({ ...report, location: e.target.value })
              }
              style={{ marginBottom: "8px", width: "100%" }}
            />
            <Input
              placeholder="Address"
              onChange={(e) =>
                setReport({ ...report, location: e.target.value })
              }
              style={{ marginBottom: "8px", width: "100%" }}
            />
            <Input
              placeholder="Phone number"
              onChange={(e) =>
                setReport({ ...report, location: e.target.value })
              }
              style={{ marginBottom: "8px", width: "100%" }}
            />

            <FileUploader
              label="Attach photo/video (mandatory)"
              style={{ marginBottom: "16px" }}
              onChange={(e) =>
                setReport({ ...report, file: e.target.files[0] })
              }
            />

            <Button
              onClick={handleSubmit}
              style={{
                marginTop: "16px",
                width: "100%",
                backgroundColor: "#28a745",
                color: "white",
                padding: "10px",
                border: "none",
                borderRadius: "4px",
              }}
            >
              Submit Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportForm;
