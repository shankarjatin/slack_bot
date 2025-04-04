// require('dotenv').config();
// const express = require('express');
// const bodyParser = require('body-parser');
// const slackRoutes = require('./routes/slackRoutes');
// const apiRoutes = require('./routes/apiRoutes');

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use((req, res, next) => {
//   const rawBody = JSON.stringify(req.body);
//   req.rawBody = rawBody;
//   next();
// });
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// // Routes
// app.use('/slack', slackRoutes);
// app.use('/api', apiRoutes);

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).send('OK');
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// // Add to your server startup
// const { WebClient } = require('@slack/web-api');
// const web = new WebClient(process.env.SLACK_BOT_TOKEN);

// async function testSlackConnection() {
//   try {
//     const result = await web.auth.test();
//     console.log('✅ Slack connection successful!', result);
//   } catch (error) {
//     console.error('❌ Slack connection failed:', error);
//   }
// }

// testSlackConnection();

// module.exports = app;
require('dotenv').config();
const { App } = require('@slack/bolt');
const approvalService = require('./services/approvalService');

const { v4: uuidv4 } = require('uuid');

// Initialize the Bolt app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false // Use HTTP endpoints
});

// Health check endpoint (Express is included with Bolt)
app.receiver.app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Handle slash command
app.command('/approval-test', async ({ command, ack, client }) => {
  // Acknowledge command request
  await ack();
  
  try {
    console.log('Received command:', command);
    
    // Open a modal
    await client.views.open({
      trigger_id: command.trigger_id,
      view: {
        type: "modal",
        callback_id: "approval_submission",
        title: {
          type: "plain_text",
          text: "Request Approval",
          emoji: true
        },
        submit: {
          type: "plain_text",
          text: "Submit",
          emoji: true
        },
        close: {
          type: "plain_text",
          text: "Cancel",
          emoji: true
        },
        blocks: [
          {
            type: "section",
            block_id: "approver_block",
            text: {
              type: "mrkdwn",
              text: "Select an approver"
            },
            accessory: {
              type: "users_select",
              placeholder: {
                type: "plain_text",
                text: "Select an approver",
                emoji: true
              },
              action_id: "select_approver"
            }
          },
          {
            type: "input",
            block_id: "details_block",
            element: {
              type: "plain_text_input",
              multiline: true,
              action_id: "approval_details"
            },
            label: {
              type: "plain_text",
              text: "Enter approval details",
              emoji: true
            }
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error opening modal:', error);
  }
});

// Handle modal submission
app.view('approval_submission', async ({ ack, body, view, client }) => {
  // Acknowledge the view submission request
  await ack();
  
  try {
    // Get values from the modal
    const values = view.state.values;
    const approver = values.approver_block.select_approver.selected_user;
    const details = values.details_block.approval_details.value;
    const requester = body.user.id;
    
    // Generate unique ID for this approval request
    const requestId = uuidv4();
    
    // Store the approval request
    await approvalService.createApproval(requester, approver, details, requestId);
    
    // Send message to approver with approval buttons
    await client.chat.postMessage({
      channel: approver,
      text: `*New approval request from <@${requester}>:*\n\n${details}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*New approval request from <@${requester}>:*\n\n${details}`
          }
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Approve",
                emoji: true
              },
              style: "primary",
              action_id: "approve",
              value: requestId
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Reject",
                emoji: true
              },
              style: "danger",
              action_id: "reject",
              value: requestId
            }
          ]
        }
      ]
    });
  } catch (error) {
    console.error('Error handling modal submission:', error);
  }
});

// Handle approve button
app.action('approve', async ({ ack, body, client }) => {
  // Acknowledge the button click
  await ack();
  
  try {
    const requestId = body.actions[0].value;
    const actionUser = body.user.id;
    
    // Update approval status
    await approvalService.updateStatus(requestId, 'approved', actionUser);
    
    // Get approval details
    const approval = await approvalService.getApproval(requestId);
    
    // Send message to requester
    await client.chat.postMessage({
      channel: approval.requester,
      text: `Your approval request has been ✅ *approved*\n\n>${approval.details}`,
    });
  } catch (error) {
    console.error('Error handling approve action:', error);
  }
});

// Handle reject button
app.action('reject', async ({ ack, body, client }) => {
  // Acknowledge the button click
  await ack();
  
  try {
    const requestId = body.actions[0].value;
    const actionUser = body.user.id;
    
    // Update approval status
    await approvalService.updateStatus(requestId, 'rejected', actionUser);
    
    // Get approval details
    const approval = await approvalService.getApproval(requestId);
    
    // Send message to requester
    await client.chat.postMessage({
      channel: approval.requester,
      text: `Your approval request has been ❌ *rejected*\n\n>${approval.details}`,
    });
  } catch (error) {
    console.error('Error handling reject action:', error);
  }
});

// Start the app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log(`⚡️ Slack Approval Bot is running on port ${process.env.PORT || 3000}`);
  
  // Test Slack connection
  try {
    const authResult = await app.client.auth.test();
    console.log('✅ Slack connection successful!', 
      { botId: authResult.bot_id, userId: authResult.user_id });
  } catch (error) {
    console.error('❌ Slack connection failed:', error);
  }
})();