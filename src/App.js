import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Map from "./components/Map"; // Ensure this includes markers from MongoDB

function App() {
  return (
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ flex: 1, padding: "20px" }}>
          <Routes>
            {/* Route for Crime Hotspot Map */}
            <Route path="/hotspot" element={<Map />} />
            {/* Default Route */}
            <Route path="/" element={<Map />} />
          </Routes>
        </div>
      </div>

  );
}

export default App;
