import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import axios from "axios";


const getCrimeColor = (severity) => {
  if (severity >= 5) return "red";     
  if (severity >= 3) return "orange"; 
  if (severity === 1) return "#D5006D";
  return "blue";                        
};

const LeafletMap = () => {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/hotspots")
      .then(response => {
        setHotspots(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching crime hotspots:", error);
        setError("Failed to load hotspots.");
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
          {hotspots.map((hotspot) => (
            <CircleMarker
              key={hotspot.id}
              center={[hotspot.latitude, hotspot.longitude]}
              radius={8}
              fillColor={getCrimeColor(hotspot.severity)}
              color="black"
              weight={1}
              fillOpacity={0.7}
            >
              <Popup>
                <b>{hotspot.hotspot_name}</b> <br /> 
                Crime Type: {hotspot.crime_type} <br />
                Reported Incidents: {hotspot.reported_incidents} <br />
                Severity: {hotspot.severity} <br />
                Last Crime Date: {hotspot.last_crime_date} <br />
                IPC Section:{hotspot.legal_section}<br />
                Patrol Recommendations: {hotspot.patrol_recommendations}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      )}
    </>
  );
};

export default LeafletMap;