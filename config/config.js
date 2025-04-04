module.exports = {
    slack: {
      apiUrl: 'https://slack.com/api',
      botToken: process.env.SLACK_BOT_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET
    },
    storage: {
      // In a real app, you'd use a database
      // This is a simple in-memory store for demonstration
      approvals: new Map()
    }
  };