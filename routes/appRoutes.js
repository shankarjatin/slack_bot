const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');

// API routes for approvals
router.post('/approvals', approvalController.createApprovalRequest);
router.get('/approvals/:requestId', approvalController.getApprovalStatus);

module.exports = router;