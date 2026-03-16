const axios = require('axios'); // Не забудь npm install axios
const e = require('express');

const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImUzOTQwODUyYTQxYzQ3OWFiZjkyMDY1NDcyM2JlZGI0IiwiaCI6Im11cm11cjY0In0=';
const BASE_COORDS = [6.779844555473214, 51.56523808298011];

async function getRouteMatrixAndCalculatePrice(object) {
    // Собираем точки маршрута: from, via[], to
    const clientPoints = [];
    if (object.transportFrom && object.transportFrom.coordinates) {
        clientPoints.push([
            object.transportFrom.coordinates.lon,
            object.transportFrom.coordinates.lat
        ]);
    }
    if (Array.isArray(object.transportVia)) {
        object.transportVia.forEach(via => {
            if (via && via.coordinates) {
                clientPoints.push([
                    via.coordinates.lon,
                    via.coordinates.lat
                ]);
            }
        });
    }
    if (object.transportTo && object.transportTo.coordinates) {
        clientPoints.push([
            object.transportTo.coordinates.lon,
            object.transportTo.coordinates.lat
        ]);
    }
    try {
        let allPoints = [BASE_COORDS, ...clientPoints, BASE_COORDS]; 
        console.log(allPoints);
        
        const orsResponse = await axios.post('https://api.openrouteservice.org/v2/matrix/driving-car', {
            locations: allPoints,
            metrics: ['distance'],
            units: 'km'
        }, {
            headers: { 'Authorization': ORS_API_KEY },
            timeout: 5000 // Ждем максимум 5 секунд
        });

        // В Axios данные лежат сразу в .data
        console.log('Ответ ORS:', orsResponse.data); // Логируем весь ответ для отладки
        const distances = orsResponse.data.distances;

        let total = 0;
        let totalKm = 0;

        for (let i = 0; i < distances.length - 1; i++) {
        const segment = distances[i][i + 1];
        totalKm += segment;
        if (segment > 40) {
            total += segment * 0.5; // 0.5 евро за км сверх 40 км
        }
        else {
            total += segment * 0.25; 
        }
        }
        console.log('Расстояния между точками (км):', distances);
        console.log('Общее расстояние (км):', totalKm);
        console.log('Расчетная стоимость транспорта:', total);
        return total;
    }
    catch (err) {
        // Если ORS прислал ошибку, Axios попадет сюда автоматически
        console.error('Ошибка:', err.response?.data || err.message);
        throw new Error('Ошибка навигации');
    }
}

module.exports = { getRouteMatrixAndCalculatePrice };