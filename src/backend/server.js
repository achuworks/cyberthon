const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "crime_data"
});

app.get("/hotspots", (req, res) => {
  db.query("SELECT * FROM hotspots", (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(result);
    }
  });
});
app.get("/accident_data", (req, res) => {
  db.query("SELECT * FROM accident_data", (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(result);
    }
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
