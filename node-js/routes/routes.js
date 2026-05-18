const express = require('express');

const kitchenController = require('../controllers/kitchenController');
const furnitureController = require('../controllers/furnitureController');
const gardenController = require('../controllers/gardenController');
const tradesController = require('../controllers/tradesController');
const requestController = require('../controllers/requestController');

const router = express.Router();

router.post('/kitchen/calculate', kitchenController.calculateKitchen);

router.post('/furniture/calculate', furnitureController.calculateFurniture);
// router.post('/furniture/request', furnitureController.createFurnitureRequest);

router.post('/garden/calculate', gardenController.calculateGarden);
// router.post('/garden/request', gardenController.createGardenRequest);

router.post('/trades/calculate', tradesController.calculateTrades);
// router.post('/trades/request', tradesController.createTradesRequest);

router.post('/request/send', requestController.sendRequest);
router.post('/request/smtp-test', requestController.sendSmtpTest);

module.exports = router;
