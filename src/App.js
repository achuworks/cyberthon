import React from "react";
import { Routes, Route } from "react-router-dom"; 
import Sidebar from "./components/Sidebar";
import Map from "./components/Map"; 
import PatrolOptimization from "./components/Patrol";
import Accident from "./components/Accident";
import BehavioralAnalysis from "./components/BehavioralAnalysis";
import CrimeTrendsPrediction from "./components/crimeTrends";
import LegalClassification from "./components/LegalClassification";

function App() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "20px" }}>
        <Routes>
          <Route path="/hotspot" element={<Map />} />
          <Route path="/patrol" element={<PatrolOptimization />} />
          <Route path="/accident" element={<Accident />} />
          <Route path="/behaviour" element={<BehavioralAnalysis />} />
          <Route path="/trends" element={<CrimeTrendsPrediction />} />
          <Route path="/legall" element={<LegalClassification />} />
          <Route path="/" element={<Map />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;