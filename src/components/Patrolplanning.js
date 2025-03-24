import { useEffect, useState } from "react";
import { GoogleMap, LoadScript, MarkerF, InfoWindowF } from "@react-google-maps/api";
import axios from "axios";

const mapContainerStyle = {
  width: "100%",
  height: "850px",
};

const center = {
  lat: 11.0168, 
  lng: 76.9558,
};

const getCrimeIcon = (severity) => {
  if (severity >= 5) return "https://raw.githubusercontent.com/Concept211/Google-Maps-Markers/master/images/marker_red.png"; 


  if (severity >= 3) return "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
  if (severity === 1) return "http://maps.google.com/mapfiles/ms/icons/pink-dot.png";
  return "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
};

const Patrol = () => {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/hotspots")
      .then((response) => {
        setHotspots(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching crime hotspots:", error);
        setError("Failed to load hotspots.");
        setLoading(false);
      });
  }, []);

  return (
    <LoadScript googleMapsApiKey="AIzaSyBc65FrtspVHSZsqXxeUa0ZWWLOBJ9etos">
      {loading && <div>Loading...</div>}
      {error && <div>{error}</div>}
      {!loading && !error && (
        <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={12}>
          {hotspots.map((hotspot) => (
            <MarkerF
              key={hotspot.id}
              position={{ lat: hotspot.latitude, lng: hotspot.longitude }}
              icon={getCrimeIcon(hotspot.severity)}
              onClick={() => setSelectedHotspot(hotspot)}
            />
          ))}

          {selectedHotspot && (
            <InfoWindowF
              position={{ lat: selectedHotspot.latitude, lng: selectedHotspot.longitude }}
              onCloseClick={() => setSelectedHotspot(null)}
            >
              <div>
                <b>{selectedHotspot.hotspot_name}</b> <br />
                Crime Type: {selectedHotspot.crime_type} <br />
                Reported Incidents: {selectedHotspot.reported_incidents} <br />
                Severity: {selectedHotspot.severity} <br />
                Last Crime Date: {selectedHotspot.last_crime_date} <br />
                Patrol Recommendations: {selectedHotspot.patrol_recommendations}
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      )}
    </LoadScript>
  );
};

export default Patrol;
