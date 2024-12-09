const express = require('express');
const router = express.Router();
const { dishController } = require('../controllers/index');

router.get('/', (req, res) => {
    dishController.getDishes(req, res);
});

module.exports = router;