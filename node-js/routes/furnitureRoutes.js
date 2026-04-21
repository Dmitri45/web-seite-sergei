const express = require('express');

const {caclculateFurniture} = require('../controllers/furnitureController');

const router = express.Router();

router.post('/calculate', caclculateFurniture);
router.post('/request', caclculateFurniture);

module.exports = router;
