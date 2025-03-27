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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
