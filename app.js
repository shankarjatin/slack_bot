require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const slackRoutes = require('./routes/slackRoutes');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  const rawBody = JSON.stringify(req.body);
  req.rawBody = rawBody;
  next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use('/slack', slackRoutes);
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Add to your server startup
const { WebClient } = require('@slack/web-api');
const web = new WebClient(process.env.SLACK_BOT_TOKEN);

async function testSlackConnection() {
  try {
    const result = await web.auth.test();
    console.log('✅ Slack connection successful!', result);
  } catch (error) {
    console.error('❌ Slack connection failed:', error);
  }
}

testSlackConnection();

module.exports = app;