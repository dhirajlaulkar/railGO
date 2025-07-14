const express = require('express');
const { body, param } = require('express-validator');
const pnrController = require('../controllers/pnrController');
const auth = require('../middleware/auth');

const router = express.Router();

// Subscribe to PNR
router.post(
  '/subscribe',
  auth,
  [
    body('pnrNumber').isLength({ min: 10, max: 10 }).withMessage('PNR must be 10 digits'),
    body('pnrNumber').isNumeric().withMessage('PNR must be numeric'),
  ],
  pnrController.subscribePNR
);

// Get all subscriptions
router.get('/subscriptions', auth, pnrController.getSubscriptions);

// Get specific subscription
router.get('/subscriptions/:id', auth, pnrController.getSubscription);

// Update subscription
router.put('/subscriptions/:id', auth, pnrController.updateSubscription);

// Delete subscription
router.delete('/subscriptions/:id', auth, pnrController.deleteSubscription);

// Get current PNR status
router.get('/status/:pnr', auth, [param('pnr').isLength({ min: 10, max: 10 }).isNumeric()], pnrController.getPNRStatus);

module.exports = router; 