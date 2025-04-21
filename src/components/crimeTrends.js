import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
});

const CrimeTrendsPrediction = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hotspots, setHotspots] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [policeStations, setPoliceStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [predictionMode, setPredictionMode] = useState(false);

  const getCrimeColor = (severity) => {
    if (severity >= 8) return "darkred";
    if (severity >= 5) return "red";
    if (severity >= 3) return "orange";
    if (severity === 1) return "#D5006D";
    return "blue";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hotspotsResponse = await axios.get("http://localhost:5000/hotspots");
        setHotspots(hotspotsResponse.data);
        
        const stationsResponse = await axios.get("http://localhost:5000/police_stations");
        setPoliceStations(stationsResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load map data.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generatePredictions = async () => {
    setPredictionMode(true);
    setLoading(true);
    setError(null);

    try {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const response = await axios.get("http://localhost:5000/future-crime-trends", {
        params: { prediction_date: formattedDate },
      });

      if (response.data.predictions) {
        setPredictions(response.data.predictions);
      } else {
        const basePredictionFactor = response.data.predicted_incidents ? 
          response.data.predicted_incidents[0] / 100 : 0.8;

        const generatedPredictions = hotspots.map(hotspot => {
          const randomFactor = Math.random() * 0.4 + 0.8; 
          const predictionFactor = basePredictionFactor * randomFactor;

          return {
            id: hotspot.id,
            hotspot_name: hotspot.hotspot_name,
            latitude: hotspot.latitude,
            longitude: hotspot.longitude,
            crime_type: hotspot.crime_type,
            severity: Math.min(10, Math.round(hotspot.severity * predictionFactor)),
            predicted_incidents: Math.round(hotspot.reported_incidents * predictionFactor),
            legal_section: hotspot.legal_section,
            patrol_recommendations: hotspot.patrol_recommendations
          };
        });
        
        setPredictions(generatedPredictions);
      }
    } catch (err) {
      console.error("Error generating predictions:", err);
      setError(`Failed to generate predictions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetView = () => {
    setPredictionMode(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-700">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center font-semibold p-4">{error}</div>;
  }

  return (
    <div className="flex flex-col p-4">
      <h2 className="text-2xl font-bold text-center mb-4">
        {predictionMode ? "Crime Prediction Map" : "Current Crime Hotspots"}
      </h2>

      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Date for Prediction:
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)} 
              dateFormat="yyyy-MM-dd"
              popperPlacement="top"
              popperModifiers={[
                {
                  name: "offset",
                  options: {
                    offset: [0, 8],
                  },
                },
              ]}
              portalId="root"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          {predictionMode ? (
  <button
    onClick={resetView}
    style={{
      width: "100%",
      maxWidth: "auto",
      backgroundColor: "#6B7280", 
      color: "white",
      fontWeight: "500",
      paddingVertical: "0.5rem",
      paddingHorizontal: "1rem",
      borderRadius: "0.375rem",
      transition: "background-color 0.3s ease",
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.backgroundColor = "#4B5563"; 
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.backgroundColor = "#6B7280"; 
    }}
  >
    View Current Hotspots
  </button>
) : (
  <button
    onClick={generatePredictions}
    style={{
      width: "100%",
      maxWidth: "auto",
      backgroundColor: "#3B82F6", 
      color: "white",
      fontWeight: "500",
      paddingVertical: "0.5rem", 
      paddingHorizontal: "1rem", 
      borderRadius: "0.375rem", 
      transition: "background-color 0.3s ease", 
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.backgroundColor = "#2563EB"; 
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.backgroundColor = "#3B82F6"; 
    }}
  >
    Generate Prediction
  </button>
)}
        </div>
      </div>

      <div className="bg-white rounded shadow">
        <MapContainer 
          center={[11.0168, 76.9558]} 
          zoom={12} 
          style={{ height: "750px", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {predictionMode ? (
            predictions.map((prediction) => (
              <CircleMarker
                key={`prediction-${prediction.id}`}
                center={[prediction.latitude, prediction.longitude]}
                radius={Math.max(10, prediction.severity * 2)} 
                fillColor={getCrimeColor(prediction.severity)}
                color="black"
                weight={2}
                fillOpacity={0.7}
              >
                <Popup>
                  <b>{prediction.hotspot_name || "Crime Hotspot"}</b> <br />
                  Crime Type: {prediction.crime_type} <br />
                  Predicted Incidents: {prediction.predicted_incidents} <br />
                  Severity: {prediction.severity}/10 <br />
                  Prediction Date: {selectedDate.toLocaleDateString()} <br />
                  {prediction.legal_section && <><br />IPC Section: {prediction.legal_section}</>}
                  {prediction.patrol_recommendations && <><br />Patrol Recommendations: {prediction.patrol_recommendations}</>}
                </Popup>
              </CircleMarker>
            ))
          ) : (
            hotspots.map((hotspot) => (
              <CircleMarker
                key={`hotspot-${hotspot.id}`}
                center={[hotspot.latitude, hotspot.longitude]}
                radius={8} 
                fillColor={getCrimeColor(hotspot.severity)}
                color="black"
                weight={1}
                fillOpacity={0.7}
              >
                <Popup>
                  <b>{hotspot.hotspot_name || "Crime Hotspot"}</b> <br />
                  Crime Type: {hotspot.crime_type} <br />
                  Reported Incidents: {hotspot.reported_incidents} <br />
                  Severity: {hotspot.severity} <br />
                  Last Crime Date: {hotspot.last_crime_date} <br />
                  {hotspot.legal_section && <><br />IPC Section: {hotspot.legal_section}</>}
                  {hotspot.patrol_recommendations && <><br />Patrol Recommendations: {hotspot.patrol_recommendations}</>}
                </Popup>
              </CircleMarker>
            ))
          )}

          {policeStations.map((station) => (
            <Marker
              key={`police-${station.id}`}
              position={[station.latitude, station.longitude]}
            >
              <Popup>
                <b>{station.name || "Police Station"}</b> <br />
                Location: {station.latitude}, {station.longitude}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default CrimeTrendsPrediction;