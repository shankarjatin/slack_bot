exports.formatMessage = (text) => {
    return {
      text: text,
      mrkdwn: true
    };
  };
  
  exports.extractUserId = (userMention) => {
    return userMention.replace(/<@|>/g, '');
  };
  
  // Create blocks for approval modal
  exports.createApprovalModalBlocks = () => {
    return [
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
    ];
  };