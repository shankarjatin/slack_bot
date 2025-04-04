const express = require('express');
const router = express.Router();
const slackController = require('../controllers/slackController');
const { verifySlackRequest } = require('../middleware/slackAuth');

// Apply Slack verification middleware
router.use(verifySlackRequest);

// Slash command route
router.post('/command', slackController.handleSlashCommand);

// Interactive components (buttons, modals)
router.post('/interact', slackController.handleInteraction);

module.exports = router;