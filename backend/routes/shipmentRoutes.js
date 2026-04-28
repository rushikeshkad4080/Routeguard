const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');

// CRITICAL: Ensure these names match the exports in the controller exactly
router.get('/', shipmentController.getAllShipments); 
router.post('/', shipmentController.createShipment);

module.exports = router;