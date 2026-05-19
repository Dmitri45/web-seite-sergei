const express = require("express");
const path = require("path");
const { loadEnv } = require('./config/loadEnv');

loadEnv();

const routes = require('./routes/routes');
const app = express();

// CORS fuer die Entwicklung
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json());

app.use('/projects', express.static(path.join(__dirname, '..', 'projects'), {
  etag: true,
  maxAge: '7d'
}));

// Statische Dateien aus dem Projektwurzelverzeichnis ausliefern
app.use(express.static(path.join(__dirname, '..')));

app.use('/api', routes);

app.listen(3000, () => console.log("http://localhost:3000")); 
