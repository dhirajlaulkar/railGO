const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const sns = new AWS.SNS();

exports.sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  const subject = 'RailGo Email Verification';
  const message = `Click the following link to verify your email: ${verificationUrl}`;

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
}; 