import React, { useEffect, useState } from "react";
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const SEASON_CONFIG = {
  Winter: {
    icon: '❄️',
    bgColor: 'bg-blue-50',
    hoverBg: 'hover:bg-blue-100',
    activeBg: 'bg-blue-500',
    textColor: 'text-blue-800',
    hoverText: 'hover:text-blue-900'
  },
  Spring: {
    icon: '🌱',
    bgColor: 'bg-green-50',
    hoverBg: 'hover:bg-green-100',
    activeBg: 'bg-green-500',
    textColor: 'text-green-800',
    hoverText: 'hover:text-green-900'
  },
  Summer: {
    icon: '☀️',
    bgColor: 'bg-yellow-50',
    hoverBg: 'hover:bg-yellow-100',
    activeBg: 'bg-yellow-500',
    textColor: 'text-yellow-800',
    hoverText: 'hover:text-yellow-900'
  },
  Monsoon: {
    icon: '🌧️',
    bgColor: 'bg-gray-50',
    hoverBg: 'hover:bg-gray-100',
    activeBg: 'bg-gray-500',
    textColor: 'text-gray-800',
    hoverText: 'hover:text-gray-900'
  }
};

const COLOR_PALETTE = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
    '#9966FF', '#FF9F40', '#FF5733', '#28A745' // Replaced light grey with stronger colors
  ];
  

const BehavioralAnalysis = () => {
  const [crimeTrends, setCrimeTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);

  useEffect(() => {
    const fetchCrimeData = async () => {
      try {
        const response = await fetch("http://localhost:5000/hotspots");
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        const processedData = analyzeTrends(data);
        setCrimeTrends(processedData);
        setSelectedSeason(processedData[0]?.season || null);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCrimeData();
  }, []);

  const analyzeTrends = (data) => {
    const trendsBySeason = {};

    data.forEach(({ crime_type, season }) => {
      if (!trendsBySeason[season]) trendsBySeason[season] = {};
      trendsBySeason[season][crime_type] = (trendsBySeason[season][crime_type] || 0) + 1;
    });

    return Object.keys(trendsBySeason).map(season => ({
      season,
      ...trendsBySeason[season]
    }));
  };

  const prepareSeasonalPieData = (seasonData) => {
    return Object.entries(seasonData)
      .filter(([key]) => key !== 'season')
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-xl font-semibold text-gray-600">Loading crime data...</div>
    </div>
  );

  if (error) return (
    <div className="text-center text-red-500 mt-4">
      Error loading crime data
    </div>
  );

  return (
    <div className="min-h-screen p-8 bg-gradient-to-r from-blue-50 to-blue-100">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
        Seasonal Crime Analysis
      </h1>

      {/* Enhanced Season Selector */}
      <div className="flex justify-center mb-6">
        <div className="bg-white shadow-lg rounded-full p-2 flex items-center space-x-2 border-2 border-gray-100">
          {crimeTrends.map((season) => {
            const seasonConfig = SEASON_CONFIG[season.season];
            return (
                <button
                key={season.season}
                onClick={() => setSelectedSeason(season.season)}
                className={`
                  flex items-center justify-center px-6 py-3 
                  rounded-full font-semibold text-lg 
                  transition-all duration-300 ease-in-out 
                  transform hover:scale-110 
                  shadow-md hover:shadow-xl
                  bg-gradient-to-r from-${seasonConfig.activeBg} to-${seasonConfig.hoverBg}
                  text-white 
                  hover:from-${seasonConfig.hoverBg} hover:to-${seasonConfig.bgColor}
                  focus:outline-none focus:ring-4 focus:ring-${seasonConfig.textColor.split('-')[1]}-300
                `}
              >
                <span className="text-2xl mr-2 animate-pulse">
                  {seasonConfig.icon}
                </span>
                {season.season}
              </button>
              
            );
          })}
        </div>
      </div>

      {/* Previous visualization remains the same */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-semibold mb-4 text-center">
            Crime Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={crimeTrends.filter(t => t.season === selectedSeason)}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="season" />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                }} 
              />
              {Object.keys(crimeTrends[0] || {})
                .filter(key => key !== 'season')
                .map((crimeType, index) => (
                  <Bar 
                    key={crimeType}
                    dataKey={crimeType}
                    fill={COLOR_PALETTE[index % COLOR_PALETTE.length]}
                    name={crimeType}
                  />
                ))
              }
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-semibold mb-4 text-center">
            Crime Type Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={prepareSeasonalPieData(
                  crimeTrends.find(t => t.season === selectedSeason) || {}
                )}
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => 
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {prepareSeasonalPieData(
                  crimeTrends.find(t => t.season === selectedSeason) || {}
                ).map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} 
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default BehavioralAnalysis;