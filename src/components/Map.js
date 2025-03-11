import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const LeafletMap = () => {
  return (
    <MapContainer
      center={[11.1271, 78.6569]} // Tamil Nadu coordinates
      zoom={7} // Adjust zoom level to fit Tamil Nadu
      style={{ height: "850px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    </MapContainer>
  );
};

export default LeafletMap;
