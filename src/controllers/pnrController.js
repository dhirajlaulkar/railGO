const PNRSubscription = require('../models/PNRSubscription');
const { validationResult } = require('express-validator');
const pnrService = require('../services/pnrService');

// Helper to validate 10-digit PNR
const isValidPNR = (pnr) => /^\d{10}$/.test(pnr);

exports.subscribePNR = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { pnrNumber, passengerName, journeyDetails } = req.body;
  if (!isValidPNR(pnrNumber)) {
    return res.status(400).json({ message: 'Invalid PNR format. Must be 10 digits.' });
  }
  try {
    // Prevent duplicate subscription for same PNR by same user
    const exists = await PNRSubscription.findOne({ userId: req.user.id, pnrNumber });
    if (exists) {
      return res.status(409).json({ message: 'Already subscribed to this PNR.' });
    }
    const sub = new PNRSubscription({
      userId: req.user.id,
      pnrNumber,
      passengerName,
      journeyDetails,
      statusHistory: [],
      isActive: true,
    });
    await sub.save();
    res.status(201).json(sub);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getSubscriptions = async (req, res) => {
  try {
    const subs = await PNRSubscription.find({ userId: req.user.id });
    res.status(200).json(subs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getSubscription = async (req, res) => {
  try {
    const sub = await PNRSubscription.findOne({ _id: req.params.id, userId: req.user.id });
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    res.status(200).json(sub);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const sub = await PNRSubscription.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    res.status(200).json(sub);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteSubscription = async (req, res) => {
  try {
    const sub = await PNRSubscription.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    res.status(200).json({ message: 'Subscription deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getPNRStatus = async (req, res) => {
  const { pnr } = req.params;
  if (!isValidPNR(pnr)) {
    return res.status(400).json({ message: 'Invalid PNR format. Must be 10 digits.' });
  }
  try {
    // Fetch live status from external API
    const status = await pnrService.fetchPNRStatus(pnr);
    // If user is subscribed, update their currentStatus and statusHistory
    const sub = await PNRSubscription.findOne({ userId: req.user.id, pnrNumber: pnr });
    if (sub) {
      // Only add to history if status changed
      if (!sub.currentStatus || sub.currentStatus.status !== status.status) {
        sub.statusHistory.push({ status: status.status, updatedAt: new Date(), notificationSent: false });
      }
      sub.currentStatus = status;
      sub.lastChecked = new Date();
      await sub.save();
    }
    res.status(200).json(status);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch PNR status', error: err.message });
  }
}; 