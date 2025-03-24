import React from "react";
import { Routes, Route } from "react-router-dom"; 
import Sidebar from "./components/Sidebar";
import Map from "./components/Map"; 
import Patrol from "./components/Patrolplanning";
import Accident from "./components/Accident";

function App() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "20px" }}>
        <Routes>
          <Route path="/hotspot" element={<Map />} />
          <Route path="/patrol" element={<Patrol />} />
          <Route path="/accident" element={<Accident />} />
          <Route path="/" element={<Map />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;