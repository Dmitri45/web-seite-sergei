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
// Почему ORS возвращает 0 для всех маршрутов? Возможно, проблема в формате координат или в запросе. Нужно проверить, правильно ли мы передаем координаты и соответствует ли формат требованиям ORS. Также стоит логировать весь ответ от ORS для отладки.
// Нужно не забыть сделать правильную структуру проеккта, как предложил ChatGPT.
