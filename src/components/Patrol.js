import { MapContainer, TileLayer, Marker, CircleMarker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import axios from "axios";
import L from "leaflet";

const policeStationIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/1669/1669667.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const getCrimeColor = (severity) => {
  if (severity >= 5) return "red";     
  if (severity >= 3) return "orange";  
  if (severity === 1) return "#D5006D"; 
  return "blue";                        
};

// Haversine formula to calculate the distance (in km) between two lat/lng points
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const Patrol = () => {
  const [stations, setStations] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const patrolRadius = 20; // Define patrol coverage radius (in km)

  useEffect(() => {
    axios.get("http://localhost:5000/police_stations")
      .then(response => setStations(response.data))
      .catch(error => {
        console.error("Error fetching police stations:", error);
        setError("Failed to load police stations.");
      });

    axios.get("http://localhost:5000/hotspots")
      .then(response => setHotspots(response.data))
      .catch(error => {
        console.error("Error fetching hotspots:", error);
        setError("Failed to load hotspots.");
      })
      .finally(() => setLoading(false));
  }, []);

  const fetchPatrolRoute = async (station) => {
    try {
      // Filter hotspots within the defined patrol radius
      const nearbyHotspots = hotspots.filter(h =>
        getDistance(station.latitude, station.longitude, h.latitude, h.longitude) <= patrolRadius
      );

      if (nearbyHotspots.length === 0) {
        alert("No hotspots available in the surrounding area.");
        return;
      }

      // Sort by severity (highest first)
      const sortedHotspots = nearbyHotspots.sort((a, b) => b.severity - a.severity);
      const waypoints = sortedHotspots.map(h => `${h.longitude},${h.latitude}`);

      const response = await axios.get("http://localhost:5000/patrol_route", {
        params: {
          start: `${station.longitude},${station.latitude}`,
          waypoints,
        },
      });

      setRoute(response.data.features[0].geometry.coordinates);
    } catch (error) {
      console.error("Error fetching patrol route:", error);
    }
  };

  return (
    <>
      {loading && <div>Loading...</div>}
      {error && <div>{error}</div>}
      {!loading && !error && (
        <MapContainer center={[11.0168, 76.9558]} zoom={12} style={{ height: "850px", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {stations.map((station) => (
            <Marker
              key={station.id}
              position={[station.latitude, station.longitude]}
              icon={policeStationIcon}
              eventHandlers={{
                click: () => fetchPatrolRoute(station),
              }}
            >
              <Popup>
                <b>{station.name}</b> <br />
                Address: {station.address} <br />
                Latitude: {station.latitude} <br />
                Longitude: {station.longitude} <br />
                <button onClick={() => fetchPatrolRoute(station)}>Generate Patrol Route</button>
              </Popup>
            </Marker>
          ))}

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
                Patrol Recommendations: {hotspot.patrol_recommendations}
              </Popup>
            </CircleMarker>
          ))}

          {route && (
            <Polyline
              positions={route.map(([lng, lat]) => [lat, lng])}
              color="blue"
              weight={4}
            />
          )}
        </MapContainer>
      )}
    </>
  );
};

export default Patrol;
