const mongoose = require('mongoose');

const notificationHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pnrSubscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'PNRSubscription', required: true },
  notificationType: { type: String, enum: ['email', 'sms'], required: true },
  subject: String,
  message: String,
  deliveryStatus: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  deliveredAt: Date,
  errorMessage: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NotificationHistory', notificationHistorySchema); 