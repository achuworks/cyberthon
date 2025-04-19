import React, { useEffect, useState } from "react";
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";

const COLOR_PALETTE = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FDCB6E', '#6C5CE7', 
  '#FF8A5B', '#2ECC71', '#AF7AC5', '#5D6D7E', '#F1948A', '#48C9B0', '#EC7063' 
];

const BehavioralAnalysis = () => {
  const [crimeTrends, setCrimeTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchCrimeTrends = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both start and end dates");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/crime-trends?from_date=${fromDate}&to_date=${toDate}`);
      const data = await response.json();
      if (response.ok) {
        setCrimeTrends(data);
      } else {
        throw new Error(data.error || "Failed to fetch crime trends.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const preparePieData = (data) => {
    return data.reduce((acc, { crime_type, count }) => {
      const existing = acc.find((item) => item.name === crime_type);
      if (existing) {
        existing.value += count;
      } else {
        acc.push({ name: crime_type, value: count });
      }
      return acc;
    }, []).sort((a, b) => b.value - a.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl">
      <h1 style={{ 
  fontFamily: 'Arial Black, Gadget, sans-serif', 
  fontSize: '2rem', 
  color: '#2c3e50', 
  marginBottom: '20px' 
}}>
  Crime Trend Analysis
</h1>

        
<div style={{
  backgroundColor: 'white',
  boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '32px'
}}>
  <div style={{
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px'
  }}>
   
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <label style={{
        color: '#4a5568',
        fontWeight: '600',
        fontSize: '16px'
      }}>From:</label>
      <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        style={{
          padding: '8px',
          border: '1px solid #cbd5e0',
          borderRadius: '8px',
          color: '#4a5568',
          outline: 'none',
          transition: '0.3s ease',
          width: '150px'
        }}
      />
    </div>
   
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <label style={{
        color: '#4a5568',
        fontWeight: '600',
        fontSize: '16px'
      }}>To:</label>
      <input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        style={{
          padding: '8px',
          border: '1px solid #cbd5e0',
          borderRadius: '8px',
          color: '#4a5568',
          outline: 'none',
          transition: '0.3s ease',
          width: '150px'
        }}
      />
    </div>
    <button
      onClick={fetchCrimeTrends}
      style={{
        padding: '8px 24px',
        backgroundColor: '#980124',
        color: 'white',
        fontWeight: 'bold',
        borderRadius: '8px',
        boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'transform 0.3s ease, background-color 0.3s ease'
      }}
      onMouseEnter={(e) => e.target.style.backgroundColor = '#000509'}
      onMouseLeave={(e) => e.target.style.backgroundColor = '#980124'}
    >
      Analyze Data
    </button>
  </div>
</div>


        {loading && (
          <div className="text-center mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading crime data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-center mb-6">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {crimeTrends.length > 0 && !loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-center text-gray-800">Crime Distribution</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={crimeTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="crime_type" />
                  <YAxis />
                  <Tooltip 
                    cursor={{fill: 'rgba(0,0,0,0.1)'}}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderRadius: '10px', 
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                    }} 
                  />
                  <Bar dataKey="count" fill="#4ECDC4" barSize={30} radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-center text-gray-800">Crime Type Breakdown</h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie 
                    data={preparePieData(crimeTrends)} 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={130} 
                    fill="#8884d8" 
                    dataKey="value"
                  >
                    {preparePieData(crimeTrends).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderRadius: '10px', 
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {crimeTrends.length === 0 && !loading && !error && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <p className="text-gray-600 text-lg">
              Select a date range to view detailed crime trends
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BehavioralAnalysis;