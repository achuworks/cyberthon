import React, { useState } from "react";

const PredictCrime = () => {
  const [year, setYear] = useState(2024);
  const [prediction, setPrediction] = useState(null);

  const handlePredict = () => {
    fetch(`http://localhost:5000/predict-crime?year=${year}`)
      .then((res) => res.json())
      .then((data) => setPrediction(data.predicted_incidents))
      .catch((err) => console.error("Error:", err));
  };

  return (
    <div>
      <h2>Predict Future Crimes</h2>
      <input type="number" value={year} onChange={(e) => setYear(e.target.value)} />
      <button onClick={handlePredict}>Predict</button>
      {prediction !== null && <p>Predicted Incidents: {prediction}</p>}
    </div>
  );
};

export default PredictCrime;
