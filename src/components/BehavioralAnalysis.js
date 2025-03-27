import React, { useEffect, useState } from "react";
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const COLOR_PALETTE = [
  '#FF6B6B',   
  '#4ECDC4',   
  '#45B7D1',   
  '#FDCB6E',   
  '#6C5CE7',   
  '#FF8A5B',   
  '#2ECC71',   
  '#AF7AC5',   
  '#5D6D7E',   
  '#F1948A',   
  '#48C9B0',   
  '#EC7063'    
];

const BehavioralAnalysis = () => {
  const [crimeTrends, setCrimeTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchCrimeTrends = async () => {
    if (!fromDate || !toDate) return;

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
    <div className="min-h-screen p-8 bg-gradient-to-r from-blue-50 to-blue-100">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
        Crime Trends Analysis
      </h1>

      <div className="flex justify-center gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <label className="text-gray-700 font-semibold">From:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-4 py-2 border rounded-lg shadow-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <div className="flex items-center space-x-4">
          <label className="text-gray-700 font-semibold">To:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-4 py-2 border rounded-lg shadow-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <button
          onClick={fetchCrimeTrends}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Analyze Data
        </button>
      </div>

      {loading && (
        <div className="text-center mt-4 text-gray-600 animate-pulse">
          Loading crime data...
        </div>
      )}
      {error && (
        <div className="text-center text-red-500 mt-4 bg-red-50 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Charts */}
      {crimeTrends.length > 0 && !loading && !error ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-semibold mb-4 text-center text-gray-800">
              Crime Distribution
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={crimeTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="crime_type" />
                <YAxis />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '10px', 
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                  }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const { crime_type, count } = payload[0].payload;
                      return (
                        <div className="p-4 bg-white rounded-lg shadow-lg">
                          <p className="text-gray-800 font-semibold">{crime_type}</p>
                          <p className="text-gray-600">Count: {count}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#4ECDC4" 
                  barSize={30}
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Enhanced Pie Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-semibold mb-4 text-center text-gray-800">
              Crime Type Breakdown
            </h3>
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
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-4 bg-white rounded-lg shadow-lg">
                          <p className="font-semibold text-gray-800">{data.name}</p>
                          <p className="text-gray-600">Count: {data.value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-6 bg-white p-6 rounded-lg shadow-md">
          Select a date range to view crime trends
        </div>
      )}
    </div>
  );
};

export default BehavioralAnalysis;