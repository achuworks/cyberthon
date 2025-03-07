import React from 'react';
// import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sideebar from './components/Sidebar';
import Map from './components/Map';
function App() {
  return (
    <>
      <Sideebar />
      <div style={{ marginLeft: '250px', padding: '20px' }}>
        <Routes>
          <Route path="/hotspot" element={<Map />} />
        </Routes>
      </div>
    </>
  );
}

export default App;