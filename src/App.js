import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
// Import other components for the different routes you're defining

function App() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '20px' }}>
        <Routes>
          <Route path="/hotspot" element={<Map />} />
          
        </Routes>
      </div>
    </div>
  );
}

export default App;