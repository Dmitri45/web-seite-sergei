const express = require("express");
const path = require("path");
const app = express();

// CORS для разработки
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json());

// Раздача статических файлов из корня проекта
app.use(express.static(path.join(__dirname, '..')));

const { calculateTotal } = require('./calculators/kitchenCalculator');
const { getRouteMatrixAndCalculatePrice } = require('./calculators/transportCalculator');

app.post("/api/calculate", async (req, res) => {
  try {
    const data = req.body;

    // простая валидация
    
    let result = calculateTotal(data);

    if (data.transportation == 'yes'){ 
     result.price += await getRouteMatrixAndCalculatePrice(data); }
     
    res.json(result);

  } catch (err) {
    console.error("Ошибка:", err.message);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.listen(4000, () => console.log("http://localhost:4000")); 