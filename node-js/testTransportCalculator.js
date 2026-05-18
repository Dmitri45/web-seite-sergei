const { getRouteMatrixAndCalculatePrice } = require('./calculators/transportCalculator');

const testObject = {
  transportFrom: {
    coordinates: { lon: 7.013926870812345, lat: 51.471951561254045 } // Essen
  },
  transportVia: [
    {
      coordinates: { lon: 7.505723523968762, lat: 51.512820626573756 } // Dortmund
    }
  ],
  transportTo: {
    coordinates: { lon: 6.808351338061204, lat: 51.2384097377971 } // Düsseldorf
  }
};

getRouteMatrixAndCalculatePrice(testObject)
  .then(result => {
    console.log('Ergebnis:', result);
  })
  .catch(err => {
    console.error('Fehler:', err.message);
  });

// TODO: 
// Die Projektstruktur sollte noch sauber aufgeteilt werden.
// Calculator, Routes, Server, Controller und Validation separat halten und nur dort nutzen, wo sie gebraucht werden.
