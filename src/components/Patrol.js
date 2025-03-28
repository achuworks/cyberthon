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

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

const Patrol = () => {
  const [stations, setStations] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState("Spring"); 
  const patrolRadius = 20; 

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const stationsResponse = await axios.get("http://localhost:5000/police_stations");
        setStations(stationsResponse.data);

        const hotspotsResponse = await axios.get("http://localhost:5000/hotspots", {
          params: { season: selectedSeason }, 
        });

        if (hotspotsResponse.data.length === 0) {
          console.warn("No hotspots found for season:", selectedSeason);
        }

        setHotspots(hotspotsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSeason]); 

  const fetchPatrolRoute = async (station) => {
    try {
      const nearbyHotspots = hotspots.filter(h =>
        getDistance(station.latitude, station.longitude, h.latitude, h.longitude) <= patrolRadius
      );

      if (nearbyHotspots.length === 0) {
        alert("No hotspots available within patrol radius.");
        return;
      }

      const sortedHotspots = nearbyHotspots.sort((a, b) =>
        getDistance(station.latitude, station.longitude, a.latitude, a.longitude) -
        getDistance(station.latitude, station.longitude, b.latitude, b.longitude)
      );

      const waypoints = sortedHotspots.map(h => `${h.longitude},${h.latitude}`).join("|");

      console.log("Fetching patrol route with waypoints:", waypoints);

      const response = await axios.get("http://localhost:5000/patrol_route", {
        params: {
          start: `${station.longitude},${station.latitude}`,
          waypoints,
        },
      });

      if (!response.data.features || response.data.features.length === 0) {
        console.warn("No valid route returned.");
        alert("No valid patrol route available.");
        return;
      }

      setRoute(response.data.features[0].geometry.coordinates);
      console.log("Patrol route received:", response.data.features[0].geometry.coordinates);
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