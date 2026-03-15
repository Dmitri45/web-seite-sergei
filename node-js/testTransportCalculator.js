const { getRouteMatrixAndCalculatePrice } = require('./calculators/transportCalculator');

const testObject = {
  transportFrom: { coordinates: { lon: 6.779823097801429, lat: 51.56518472860774 } },
  transportVia: [
    { coordinates: { lon: 6.751769553622466, lat: 51.57568640506843 } }
  ],
  transportTo: { coordinates: { lon: 6.74593242663682, lat: 51.55426956453895 } }
};

getRouteMatrixAndCalculatePrice(testObject)
  .then(result => {
    console.log('Результат:', result);
  })
  .catch(err => {
    console.error('Ошибка:', err.message);
  });
