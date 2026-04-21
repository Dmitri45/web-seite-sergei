const express = require('express');

const {caclculateGarden} = require('../controllers/gardenController');

const router = express.Router();

router.post('/calculate', caclculateGarden);
router.post('/request', caclculateGarden);

module.exports = router;
