# Future Blink Slack bot 

## ✨ Overview

## This system is designed to facilitate approval workflows within Slack using a Slack bot built with Node.js and Express.js. The bot allows a requester to create approval requests and sends them to an approver. The approver can then approve or reject the request, and the requester is notified of the decision.


## Workflow
![App Screenshot](https://i.ibb.co/zTZszXg0/diagram-export-4-6-2025-2-22-04-PM.png)

## Screenshots

 ### Command
![App Screenshot](https://i.ibb.co/xqXJWSgs/image.png)

 ### Modal
![App Screenshot](https://i.ibb.co/SDqG093X/image.png)

 ### Approval request
![App Screenshot](https://i.ibb.co/cqJC6qy/image.png)

 ### Request status
![App Screenshot](https://i.ibb.co/3yQWgNrc/image.png)



## 🛠️ Tech Stack 

-*Requester triggers /approval-test slash command.*

-*Bot opens a modal to request approver selection and approval details.*

-*Requester submits the modal with approver and details.*

=*Bot stores approval request and sends a message to the selected approver.*

-*Approver clicks "Approve" or "Reject".*

-*Status is updated and notification is sent to the requester.*



  
## 🚀 Setup and Installation
 Prerequisites

Node.js installed
Node.js (v14 or higher)
npm or yarn

## Slack Setup

 ### Command
![App Screenshot](https://i.ibb.co/wZh6fTdp/image.png)


### Project Setup
```bash

#Clone repository
git clone <repository-url>

# Navigate to backend folder
cd slack_bot

# Install dependencies
npm install

# Start app
npm start / npm run dev
```

### .env example
```bash

# Slack
SLACK_BOT_TOKEN=
SLACK_SIGNING_SECRET=
# Server
PORT=3000



