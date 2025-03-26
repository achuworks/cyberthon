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
  database: "crime_data"
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
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

app.get("/accident_data", (req, res) => {
  db.query("SELECT * FROM accident_data", (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

app.get("/police_stations", (req, res) => {
  db.query("SELECT * FROM police_stations", (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});
app.get("/patrol_route", async (req, res) => {
  console.log("Received patrol route request:", req.query);

  try {
    let { start, waypoints } = req.query;

    if (!start || !waypoints) {
      console.log("Missing parameters!");
      return res.status(400).json({ error: "Start and waypoints are required" });
    }

    // Ensure waypoints is an array (if it's a string, convert it to an array)
    if (!Array.isArray(waypoints)) {
      waypoints = waypoints.split("|");  // Convert comma-separated string into an array
    }

    console.log("Fetching route with:", { start, waypoints });

    const response = await axios.get(
      `https://api.openrouteservice.org/v2/directions/driving-car`,
      {
        params: {
          api_key: ORS_API_KEY,
          start, 
          end: waypoints[waypoints.length - 1], // Last waypoint as destination
          waypoints: waypoints.join("|"), // Reconstruct waypoints
        },
      }
    );

    console.log("Route response received:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Error in patrol route:", error.message);
    res.status(500).json({ error: error.message });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});