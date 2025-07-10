import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import districtData from "../../../assets/warehouses.json";

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// Component to fly map to selected district
const FlyToDistrict = ({ lat, lng }) => {
  const map = useMap();
  if (lat && lng) {
    map.flyTo([lat, lng], 10, { duration: 1.5 });
  }
  return null;
};

const BangladeshMap = () => {
  const center = [23.8103, 90.4125]; // Default center
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  // Auto search on typing
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value) {
      setSelectedDistrict(null);
      return;
    }

    const match = districtData.find(
      (d) =>
        d.district.toLowerCase().includes(value.toLowerCase()) ||
        d.region.toLowerCase().includes(value.toLowerCase())
    );

    if (match) {
      setSelectedDistrict(match);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Auto Search Box */}
      <div className="flex justify-center">
        <input
          type="text"
          placeholder="Search district or region..."
          value={searchTerm}
          onChange={handleInputChange}
          className="px-4 py-2 border rounded w-72 shadow"
        />
      </div>

      <MapContainer
        center={center}
        zoom={7}
        scrollWheelZoom={true}
        style={{ height: "600px", width: "100%", borderRadius: "10px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Auto fly to district if selected */}
        {selectedDistrict && (
          <FlyToDistrict
            lat={selectedDistrict.latitude}
            lng={selectedDistrict.longitude}
          />
        )}

        {/* All markers */}
        {districtData.map((district, index) => (
          <Marker
            key={index}
            position={[district.latitude, district.longitude]}
          >
            <Popup>
              <strong>{district.city}</strong> ({district.district})<br />
              Areas: {district.covered_area?.join(", ")}<br />
              <a
                href={district.flowchart}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                View Flowchart
              </a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default BangladeshMap;
