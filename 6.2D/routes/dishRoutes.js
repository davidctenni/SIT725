const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dishController');

router.get('/', dishController.getDishes);

router.post('/', dishController.addDish);

module.exports = router;