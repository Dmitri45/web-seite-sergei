const express = require("express");
const path = require("path");
const { loadEnv } = require('./config/loadEnv');

loadEnv();

const routes = require('./routes/routes');
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const PROJECTS_DIR = path.join(__dirname, '..', 'projects');

app.use((req, res, next) => {
  const allowedOrigin = process.env.CORS_ORIGIN || '*';
  res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());

app.use('/projects', express.static(PROJECTS_DIR, {
  etag: true,
  maxAge: '7d'
}));

app.use(express.static(PUBLIC_DIR, {
  etag: true,
  maxAge: '1h'
}));

app.use('/api', routes);

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`S.K. SERVICE server listening on http://${HOST}:${PORT}`);
});
