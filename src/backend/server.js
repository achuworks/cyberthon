require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

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
const multer = require("multer");

// Set up file upload handler
const upload = multer({ dest: "uploads/" });

app.post("/submit-report", upload.single("file"), (req, res) => {
  const { type, description, location } = req.body;
  const media_url = req.file ? req.file.path : null;

  const query = `
    INSERT INTO reports (type, description, location, media_url)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [type, description, location, media_url], (err, result) => {
    if (err) {
      console.error("Database insertion error:", err);
      return res.status(500).json({ error: "Failed to insert report" });
    }
    res.json({ message: "Report submitted successfully", id: result.insertId });
  });
});


app.get("/hotspots", (req, res) => {
  db.query("SELECT * FROM hotspots", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});
app.get("/resource-allocation", (req, res) => {
  const query = `
    SELECT 
      hotspot_name, 
      latitude, 
      longitude, 
      severity, 
      average_incidents,
      peak_incident_day
    FROM hotspots
    
    ORDER BY severity DESC, average_incidents DESC
    LIMIT 10;
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    const allocation = result.map((spot) => {
      const patrolsNeeded = Math.ceil((spot.severity * spot.average_incidents) / 10);
      return {
        hotspot: spot.hotspot_name,
        severity: spot.severity,
        averageIncidents: spot.average_incidents,
        coordinates: [spot.latitude, spot.longitude],
        patrolsNeeded,
        peakDay: spot.peak_incident_day,
      };
    });

    res.json({ allocation });
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
      console.log("Missing parameters!");
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
    res.status(500).json({ error: error.message });
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
    
    const { prediction_date } = req.query;
    console.log(`Prediction date requested: ${prediction_date}`);
    
    const response = await axios.get("http://localhost:5001/predict-crimes", {
      params: { prediction_date },
      timeout: 20000
    });
    
    console.log(`Received predictions for ${response.data.predictions?.length || 0} locations`);
    res.json(response.data);
  } catch (error) {
    console.error('Error in future-crime-trends:', {
      message: error.message,
      code: error.code,
      response: error.response?.data || 'No response data'
    });
    
    res.status(500).json({ 
      error: "Failed to generate crime predictions",
      details: error.message,
      hint: "Make sure the Python prediction service is running on port 5001"
    });
  }
});


app.post("/generate-report", async (req, res) => {
  try {
    const summaryQuery = `SELECT COUNT(*) AS total_incidents FROM hotspots;`;
    const topHotspotsQuery = `
      SELECT hotspot_name, SUM(reported_incidents) AS reported_incidents
      FROM hotspots
      GROUP BY hotspot_name
      ORDER BY reported_incidents DESC
      LIMIT 5;
    `;
    const crimeTrendQuery = `
      SELECT crime_type, COUNT(*) AS total
      FROM hotspots
      GROUP BY crime_type;
    `;

    const [summary] = await new Promise((resolve, reject) => {
      db.query(summaryQuery, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const topHotspots = await new Promise((resolve, reject) => {
      db.query(topHotspotsQuery, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const crimeTrends = await new Promise((resolve, reject) => {
      db.query(crimeTrendQuery, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const doc = new PDFDocument();
    let chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
      const result = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=Crime_Report.pdf');
      res.send(result);
    });

    doc.fontSize(18).text("Crime Hotspot Report & Insights", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Summary:\nTotal Incidents: ${summary.total_incidents}`);
    doc.moveDown().text("Top 5 Hotspots:");
    topHotspots.forEach(h => {
      doc.text(`- ${h.hotspot_name}: ${h.reported_incidents} incidents`);
    });
    doc.moveDown().text("Crime Type Distribution:");
    crimeTrends.forEach(c => {
      doc.text(`- ${c.crime_type}: ${c.total} cases`);
    });

    doc.end();

  } catch (error) {
    console.error("Report generation failed:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});