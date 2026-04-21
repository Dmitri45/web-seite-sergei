const express = require('express');

const {caclculateKitchen} = require('../controllers/kitchenController');

const router = express.Router();

router.post('/calculate', caclculateKitchen);
router.post('/request', caclculateKitchen);

module.exports = router;
