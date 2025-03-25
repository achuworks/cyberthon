import React from "react";
import { Routes, Route } from "react-router-dom"; 
import Sidebar from "./components/Sidebar";
import Map from "./components/Map"; 
import PatrolOptimization from "./components/Patrol";
import Accident from "./components/Accident";

function App() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "20px" }}>
        <Routes>
          <Route path="/hotspot" element={<Map />} />
          <Route path="/patrol" element={<PatrolOptimization />} />
          <Route path="/accident" element={<Accident />} />
          <Route path="/" element={<Map />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;