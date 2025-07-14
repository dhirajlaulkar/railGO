const AWS = require('aws-sdk');
const NotificationHistory = require('../models/NotificationHistory');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const sns = new AWS.SNS();

exports.sendEmailNotification = async ({ userId, pnrSubscriptionId, email, subject, message }) => {
  let deliveryStatus = 'pending';
  let deliveredAt = null;
  let errorMessage = '';
  try {
    const params = {
      Message: message,
      Subject: subject,
      TopicArn: process.env.AWS_SNS_TOPIC_ARN,
      MessageAttributes: {
        'email': {
          DataType: 'String',
          StringValue: email,
        },
      },
    };
    await sns.publish(params).promise();
    deliveryStatus = 'sent';
    deliveredAt = new Date();
  } catch (err) {
    deliveryStatus = 'failed';
    errorMessage = err.message;
  }
  // Log to NotificationHistory
  await NotificationHistory.create({
    userId,
    pnrSubscriptionId,
    notificationType: 'email',
    subject,
    message,
    deliveryStatus,
    deliveredAt,
    errorMessage,
    createdAt: new Date(),
  });
  return { deliveryStatus, errorMessage };
}; 