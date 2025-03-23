import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import axios from "axios";


const getCrimeColor = (severity) => {
  if (severity > 4) return "red";     
  if (severity > 2) return "orange"; 
  return "blue";                      
};

const LeafletMap = () => {
  const [hotspots, setHotspots] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/hotspots")
      .then(async (response) => {
        const updatedHotspots = await Promise.all(response.data.map(async (spot) => {
          const placeName = await fetchPlaceName(spot.latitude, spot.longitude);
          return { ...spot, placeName };
        }));
        setHotspots(updatedHotspots);
      })
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  
  const fetchPlaceName = async (lat, lon) => {
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      return res.data.display_name || "Unknown Location";
    } catch (error) {
      console.error("Error fetching place name:", error);
      return "Unknown Location";
    }
  };

  return (
    <MapContainer center={[11.1271, 78.6569]} zoom={7} style={{ height: "850px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {hotspots.map((spot) => (
        <CircleMarker
          key={spot.id}
          center={[spot.latitude, spot.longitude]}
          radius={8} 
          fillColor={getCrimeColor(spot.severity)}
          color="black"
          weight={1}
          fillOpacity={0.7}
        >
          <Popup>
            <b>{spot.placeName}</b> <br /> 
            Crime Type: {spot.crime_type} <br />
            Severity: {spot.severity}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};

export default LeafletMap;
