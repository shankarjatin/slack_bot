// const crypto = require('crypto');
// const { slack } = require('../config/config');

// // Slack request verification
// exports.verifySlackRequest = (req, res, next) => {
//   const signature = req.headers['x-slack-signature'];
//   const timestamp = req.headers['x-slack-request-timestamp'];
  
//   // Check if the request timestamp is too old (prevent replay attacks)
//   const now = Math.floor(Date.now() / 1000);
//   if (Math.abs(now - timestamp) > 300) {
//     return res.status(400).send('Invalid timestamp');
//   }
  
//   // Create the signature base string
//   const sigBaseString = `v0:${timestamp}:${req.rawBody || JSON.stringify(req.body)}`;
  
//   // Create the signature
//   const mySignature = 'v0=' + crypto
//     .createHmac('sha256', slack.signingSecret)
//     .update(sigBaseString)
//     .digest('hex');
  
//   // Compare signatures
//   if (crypto.timingSafeEqual(
//     Buffer.from(mySignature),
//     Buffer.from(signature)
//   )) {
//     next();
//   } else {
//     res.status(401).send('Invalid signature');
//   }
// };
const crypto = require('crypto');
const { slack } = require('../config/config');

// Slack request verification
exports.verifySlackRequest = (req, res, next) => {
  console.log('⚠️ VERIFICATION ATTEMPT');
  console.log('Headers:', JSON.stringify(req.headers));
  
  // TEMPORARILY BYPASS VERIFICATION FOR TESTING
  next(); // Skip verification to see if that's the issue
  return;
  
  // The code below will be skipped temporarily
  const signature = req.headers['x-slack-signature'];
  const timestamp = req.headers['x-slack-request-timestamp'];
  
  // Rest of your verification code...
};