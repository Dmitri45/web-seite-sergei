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
    console.log('Результат:', result);
  })
  .catch(err => {
    console.error('Ошибка:', err.message);
  });

// TODO: 
// Нужно не забыть сделать правильную структуру проеккта, как предложил ChatGPT.
// Сделать отдельно caloculator, routes, server, controller, validation и т.д. И юзать их в нужных местах, а не держать всё в одном файле.