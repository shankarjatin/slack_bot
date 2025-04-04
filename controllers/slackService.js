const axios = require('axios');
const config = require('../config/config');

const SLACK_API_URL = config.slack.apiUrl;

exports.sendModal = async (triggerId, modal) => {
  const response = await axios.post(`${SLACK_API_URL}/views.open`, modal, {
    headers: {
      'Authorization': `Bearer ${config.slack.botToken}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

exports.sendMessage = async (channel, text, blocks = []) => {
  const response = await axios.post(`${SLACK_API_URL}/chat.postMessage`, {
    channel,
    text,
    blocks
  }, {
    headers: {
      'Authorization': `Bearer ${config.slack.botToken}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

exports.sendApprovalRequest = async (approver, requester, details, requestId) => {
  const blocks = [
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
  ];
  
  return await this.sendMessage(approver, "You have a new approval request", blocks);
};

exports.sendApprovalNotification = async (requester, status, details) => {
  const statusEmoji = status === 'approved' ? '✅' : '❌';
  const statusText = status === 'approved' ? 'approved' : 'rejected';
  
  const message = `Your approval request has been ${statusEmoji} *${statusText}*\n\n>${details}`;
  
  return await this.sendMessage(requester, message);
};