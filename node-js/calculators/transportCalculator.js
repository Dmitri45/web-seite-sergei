const axios = require('axios'); // Не забудь npm install axios

const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImUzOTQwODUyYTQxYzQ3OWFiZjkyMDY1NDcyM2JlZGI0IiwiaCI6Im11cm11cjY0In0=';
const BASE_COORDS = [51.56523808298011, 6.779844555473214];

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
        // Вызов OpenRouteService через Axios
        const orsResponse = await axios.post('https://api.openrouteservice.org/v2/matrix/driving-car', {
            locations: [BASE_COORDS, ...clientPoints, BASE_COORDS],
            sources: [0],
            destinations: clientPoints.map((_, i) => i + 1),
            metrics: ['distance'],
            units: 'km'
        }, {
            headers: { 'Authorization': ORS_API_KEY },
            timeout: 5000 // Ждем максимум 5 секунд
        });

        // В Axios данные лежат сразу в .data
        console.log('Ответ ORS:', orsResponse.data); // Логируем весь ответ для отладки
        const distances = orsResponse.data.distances;
        
        return distances;
    }  
    catch (err) {
        // Если ORS прислал ошибку, Axios попадет сюда автоматически
        console.error('Ошибка:', err.response?.data || err.message);
        throw new Error('Ошибка навигации');
    }
}

module.exports = { getRouteMatrixAndCalculatePrice };