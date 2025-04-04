const slackService = require('../services/slackService');
const approvalService = require('../services/approvalService');
const { v4: uuidv4 } = require('uuid');

exports.handleSlashCommand = async (req, res) => {
    console.log('💬 SLACK COMMAND RECEIVED');
    console.log('Headers:', JSON.stringify(req.headers));
    console.log('Body:', JSON.stringify(req.body));
    console.log('Raw Body:', req.rawBody);
  
  const { command, trigger_id, user_id } = req.body;
  
  // IMPORTANT: You're responding twice in your code!
  // Removed the first res.status(200).send() that was causing issues
  
  if (command === '/approval-test') {
    try {
        console.log('Command:', command);
      // Create the modal with the trigger_id from the request
      const modal = createApprovalModal(trigger_id);
      
      // Acknowledge the command immediately
      res.status(200).send();
      
      // Then open the modal
      await slackService.sendModal(trigger_id, modal);
    } catch (error) {
      console.error('Error handling slash command:', error);
      // Only respond if we haven't already
      if (!res.headersSent) {
        return res.status(500).send('Something went wrong');
      }
    }
} else {
  // Only for other commands
  res.status(200).send('Unknown command');
}
};


function createApprovalModal(trigger_id) {
    return {
      trigger_id: trigger_id, // Now properly defined
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
              type: "mrkdwn",     },
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
      };

    }

exports.handleInteraction = async (req, res) => {
  const payload = JSON.parse(req.body.payload);
  
  // Acknowledge the request immediately
  res.status(200).send();
  
  try {
    if (payload.type === 'view_submission') {
      // Handle modal submission
      await handleModalSubmission(payload);
    } else if (payload.type === 'block_actions') {
      // Handle button clicks
      await handleButtonActions(payload);
    }
  } catch (error) {
    console.error('Error handling interaction:', error);
  }
};

function createApprovalModal() {
  return {
    trigger_id: payload.trigger_id,
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
  };
}

async function handleModalSubmission(payload) {
  const values = payload.view.state.values;
  const approver = values.approver_block.select_approver.selected_user;
  const details = values.details_block.approval_details.value;
  const requester = payload.user.id;
  
  // Generate unique ID for this approval request
  const requestId = uuidv4();
  
  // Store the approval request
  await approvalService.createApproval(requester, approver, details, requestId);
  
  // Send message to approver with approval buttons
  await slackService.sendApprovalRequest(approver, requester, details, requestId);
}

async function handleButtonActions(payload) {
  const action = payload.actions[0];
  const requestId = action.value;
  const actionUser = payload.user.id;
  
  if (action.action_id === 'approve') {
    await approvalService.updateStatus(requestId, 'approved', actionUser);
    // Notify the requester
    const approval = await approvalService.getApproval(requestId);
    await slackService.sendApprovalNotification(approval.requester, 'approved', approval.details);
  } else if (action.action_id === 'reject') {
    await approvalService.updateStatus(requestId, 'rejected', actionUser);
    // Notify the requester
    const approval = await approvalService.getApproval(requestId);
    await slackService.sendApprovalNotification(approval.requester, 'rejected', approval.details);
  }
}