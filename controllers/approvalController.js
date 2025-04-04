const approvalService = require('../services/approvalService');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a new approval request
 */
exports.createApprovalRequest = async (req, res) => {
  try {
    const { requester, approver, details } = req.body;
    
    if (!requester || !approver || !details) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: requester, approver, and details are required' 
      });
    }
    
    const requestId = uuidv4();
    const approval = await approvalService.createApproval(requester, approver, details, requestId);
    
    res.status(201).json({
      success: true,
      data: approval
    });
  } catch (error) {
    console.error('Error creating approval request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create approval request'
    });
  }
};

/**
 * Get the status of an approval request
 */
exports.getApprovalStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    if (!requestId) {
      return res.status(400).json({
        success: false,
        error: 'Request ID is required'
      });
    }
    
    const approval = await approvalService.getApproval(requestId);
    
    res.status(200).json({
      success: true,
      data: {
        id: approval.id,
        status: approval.status,
        requester: approval.requester,
        approver: approval.approver,
        details: approval.details,
        createdAt: approval.createdAt,
        updatedAt: approval.updatedAt
      }
    });
  } catch (error) {
    console.error('Error getting approval status:', error);
    
    if (error.message === 'Approval request not found') {
      return res.status(404).json({
        success: false,
        error: 'Approval request not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to get approval status'
    });
  }
};