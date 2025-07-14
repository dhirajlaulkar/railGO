const cron = require('node-cron');
const PNRSubscription = require('../models/PNRSubscription');
const User = require('../models/User');
const pnrService = require('./pnrService');
const notificationService = require('./notificationService');

async function checkPNRStatusAndNotify() {
  const subs = await PNRSubscription.find({ isActive: true });
  for (const sub of subs) {
    try {
      const latestStatus = await pnrService.fetchPNRStatus(sub.pnrNumber);
      if (!sub.currentStatus || sub.currentStatus.status !== latestStatus.status) {
        // Status changed, update and notify
        sub.statusHistory.push({ status: latestStatus.status, updatedAt: new Date(), notificationSent: false });
        sub.currentStatus = latestStatus;
        sub.lastChecked = new Date();
        await sub.save();
        // Get user email
        const user = await User.findById(sub.userId);
        if (user && user.notificationPreferences.email) {
          const subject = `PNR Update for ${sub.pnrNumber}`;
          const message = `Dear ${user.firstName},\n\nYour PNR status has changed to: ${latestStatus.status}\n\nDetails: ${JSON.stringify(latestStatus, null, 2)}`;
          await notificationService.sendEmailNotification({
            userId: user._id,
            pnrSubscriptionId: sub._id,
            email: user.email,
            subject,
            message,
          });
        }
      }
    } catch (err) {
      console.error(`Error checking PNR ${sub.pnrNumber}:`, err.message);
    }
  }
}

exports.startPNRScheduler = () => {
  cron.schedule('*/30 * * * *', async () => {
    console.log('Running scheduled PNR status check...');
    await checkPNRStatusAndNotify();
  });
  console.log('PNR status scheduler started (every 30 minutes)');
}; 