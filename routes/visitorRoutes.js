// src/routes/visitorRoutes.js
const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');
const Visitor = require('../models/visitor');


// Route for capturing visitor details
router.post('/capture-details', visitorController.captureDetails);

// Route for verifying OTP
router.post('/saveDetails', visitorController.saveDetails);

// PUT route to update visitor entry with checkout time
router.put('/checkout', visitorController.updateCheckoutTime);


// GET all visitors
router.get('/all', async (req, res) => {
    try {
      const allVisitors = await Visitor.find();
      res.status(200).json(allVisitors);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

// PUT route for manual checkout of visitors
router.put('/manual-checkout', visitorController.manualCheckOut);

module.exports = router;
