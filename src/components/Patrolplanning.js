import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import axios from "axios";

const mapContainerStyle = {
  width: "100%",
  height: "850px",
};

const center = [11.0168, 76.9558];

const getCrimeIcon = (severity) => {
  return L.icon({
    iconUrl:
      severity >= 5
        ? "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
        : severity >= 3
        ? "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
        : severity === 1
        ? "http://maps.google.com/mapfiles/ms/icons/pink-dot.png"
        : "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const jeepIcon = L.icon({
  iconUrl:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Police_car_with_flashing_lights_%28clip_art%29.svg/2048px-Police_car_with_flashing_lights_%28clip_art%29.svg.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const ORS_API_KEY = "5b3ce3597851110001cf6248a0974c8fa2994c34ac2d82d07d7a9763";

const Patrol = () => {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [movingMarkerPosition, setMovingMarkerPosition] = useState(null);

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

  const getCoordinates = async (address) => {
    try {
      const response = await axios.get(
        `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(address)}`
      );
      const coords = response.data.features[0]?.geometry.coordinates;
      return coords ? [coords[1], coords[0]] : null;
    } catch (error) {
      console.error("Error fetching geocode:", error);
      return null;
    }
  };

  const handleRoutePlan = async () => {
    if (!startLocation || !endLocation) {
      alert("Please enter both start and end locations.");
      return;
    }

    const startCoords = await getCoordinates(startLocation);
    const endCoords = await getCoordinates(endLocation);

    if (!startCoords || !endCoords) {
      alert("Invalid locations. Please enter correct addresses.");
      return;
    }

    try {
      const coordinatesList = [
        startCoords,
        ...hotspots.map((h) => [h.longitude, h.latitude]),
        endCoords,
      ];

      console.log("Sending coordinates for routing:", coordinatesList);

      const response = await axios.post(
        "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
        {
          coordinates: coordinatesList,
        },
        {
          headers: { 
            Authorization: `Bearer ${ORS_API_KEY}`, 
            "Content-Type": "application/json" 
          },
        }
      );

      const routePath = response.data.features[0].geometry.coordinates.map(
        (coord) => [coord[1], coord[0]]
      );

      setRouteCoordinates(routePath);
      simulateJeepMovement(routePath);
    } catch (error) {
      console.error("Route request failed:", error);
      alert("Failed to generate patrol route.");
    }
  };

  const simulateJeepMovement = (routePath) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < routePath.length) {
        setMovingMarkerPosition(routePath[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 1000);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter Start Location"
        value={startLocation}
        onChange={(e) => setStartLocation(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter End Location"
        value={endLocation}
        onChange={(e) => setEndLocation(e.target.value)}
      />
      <button onClick={handleRoutePlan}>Plan Patrol Route</button>

      {loading && <div>Loading...</div>}
      {error && <div>{error}</div>}

      {!loading && !error && (
        <MapContainer center={center} zoom={12} style={mapContainerStyle}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {hotspots.map((hotspot) => (
            <Marker
              key={hotspot.id}
              position={[hotspot.latitude, hotspot.longitude]}
              icon={getCrimeIcon(hotspot.severity)}
            >
              <Popup>
                <b>{hotspot.hotspot_name}</b> <br />
                Crime Type: {hotspot.crime_type} <br />
                Reported Incidents: {hotspot.reported_incidents} <br />
                Severity: {hotspot.severity} <br />
                Last Crime Date: {hotspot.last_crime_date} <br />
                Patrol Recommendations: {hotspot.patrol_recommendations}
              </Popup>
            </Marker>
          ))}

          {routeCoordinates.length > 0 && <Polyline positions={routeCoordinates} color="blue" />}

          {movingMarkerPosition && <Marker position={movingMarkerPosition} icon={jeepIcon} />}
        </MapContainer>
      )}
    </div>
  );
};

export default Patrol;
