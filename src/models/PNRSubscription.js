const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: String,
  updatedAt: Date,
  notificationSent: Boolean
}, { _id: false });

const journeyDetailsSchema = new mongoose.Schema({
  trainNumber: String,
  trainName: String,
  fromStation: String,
  toStation: String,
  journeyDate: Date,
  class: String,
  quota: String
}, { _id: false });

const currentStatusSchema = new mongoose.Schema({
  status: String,
  coach: String,
  seatNumber: String,
  berthPreference: String,
  currentLocation: String,
  chartStatus: String
}, { _id: false });

const pnrSubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pnrNumber: { type: String, required: true, length: 10 },
  passengerName: String,
  journeyDetails: journeyDetailsSchema,
  currentStatus: currentStatusSchema,
  statusHistory: [statusHistorySchema],
  isActive: { type: Boolean, default: true },
  lastChecked: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PNRSubscription', pnrSubscriptionSchema); 