require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const ORS_API_KEY = "5b3ce3597851110001cf6248a0974c8fa2994c34ac2d82d07d7a9763";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "crime_data",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database.");
  }
});

app.get("/hotspots", (req, res) => {
  db.query("SELECT * FROM hotspots", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.get("/accident_data", (req, res) => {
  db.query("SELECT * FROM accident_data", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.get("/police_stations", (req, res) => {
  db.query("SELECT * FROM police_stations", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});
app.get("/patrol_route", async (req, res) => {
  console.log("Received patrol route request:", req.query);

  try {
    let { start, waypoints } = req.query;

    if (!start || !waypoints) {
      console.log(" Missing parameters!");
      return res.status(400).json({ error: "Start and waypoints are required" });
    }

    if (!Array.isArray(waypoints)) {
      waypoints = waypoints.split("|");
    }

    console.log("Fetching route with:", { start, waypoints });

    const response = await axios.get(
      "https://api.openrouteservice.org/v2/directions/driving-car",
      {
        params: {
          api_key: ORS_API_KEY,
          start, 
          end: waypoints[waypoints.length - 1], 
          waypoints: waypoints.join("|"), 
        },
      }
    );

    console.log("Route response received");
    res.json(response.data);
  } catch (error) {
    console.error("Error in patrol route:", error.message);
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/legal", (req, res) => {
  const query = `
    SELECT DISTINCT crime_type, legal_section 
    FROM hotspots 
    WHERE legal_section IS NOT NULL AND legal_section <> ''
    ORDER BY crime_type;
  `;

  db.query(query, (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(rows);
  });
});
app.get("/crime-trends", (req, res) => {
  const { from_date, to_date } = req.query;

  if (!from_date || !to_date) {
    return res.status(400).json({ error: "Both from_date and to_date are required." });
  }

  const query = `
    SELECT 
      DATE(last_crime_date) AS crime_date, 
      crime_type, 
      COUNT(*) AS count
    FROM hotspots
    WHERE DATE(last_crime_date) BETWEEN ? AND ?
    GROUP BY crime_date, crime_type
    ORDER BY crime_date ASC, count DESC;
  `;

  db.query(query, [from_date, to_date], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});
app.get("/future-crime-trends", async (req, res) => {
  try {
    console.log('Attempting to fetch predictions from Python backend');
    const response = await axios.get("http://localhost:5001/predict-crimes", {
      timeout: 10000 
    });
    console.log('Predictions received:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Detailed error in future-crime-trends:', {
      message: error.message,
      code: error.code,
      response: error.response?.data
    });

    
    res.status(500).json({ 
      error: "Error fetching predictions",
      details: error.message || 'Unknown error occurred',
      fullError: error.response?.data || {}
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
