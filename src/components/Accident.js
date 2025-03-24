import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import axios from "axios";

const Accident = () => {
  const [accidents, setAccidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/accident_data") 
      .then(response => {
        setAccidents(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching accident data:", error);
        setError("Failed to load accident data.");
        setLoading(false);
      });
  }, []);

  return (
    <>
      {loading && <div>Loading...</div>}
      {error && <div>{error}</div>}
      {!loading && !error && (
        <MapContainer center={[11.0168, 76.9558]} zoom={12} style={{ height: "850px", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {accidents.map((accident) => (
            <CircleMarker
              key={accident.id}
              center={[accident.latitude, accident.longitude]}
              radius={8}
              fillColor="red" 
              color="black"
              weight={1}
              fillOpacity={0.7}
            >
              <Popup>
                <b>{accident.location_name}</b> <br /> 
                Accident Type: {accident.accident_type} <br />
                Legal Reference: {accident.legal_reference} <br />
                Date: {accident.date_occurred} <br />
                Severity: {accident.severity} <br />
                Remarks: {accident.remarks}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      )}
    </>
  );
};

export default Accident;
