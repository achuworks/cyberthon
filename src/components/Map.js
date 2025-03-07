import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const LeafletMap = () => { 
    return (
      <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '1000px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      </MapContainer>
    );
  };
  
  export default LeafletMap;
  