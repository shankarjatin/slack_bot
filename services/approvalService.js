const config = require('../config/config');

exports.createApproval = async (requester, approver, details, requestId) => {
  const approvalRequest = {
    id: requestId,
    requester,
    approver,
    details,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // In a real app, save to database
  config.storage.approvals.set(requestId, approvalRequest);
  
  return approvalRequest;
};

exports.getStatus = async (requestId) => {
  const approval = config.storage.approvals.get(requestId);
  if (!approval) {
    throw new Error('Approval request not found');
  }
  return { status: approval.status };
};

exports.getApproval = async (requestId) => {
  const approval = config.storage.approvals.get(requestId);
  if (!approval) {
    throw new Error('Approval request not found');
  }
  return approval;
};

exports.updateStatus = async (requestId, status, actionUser) => {
  const approval = config.storage.approvals.get(requestId);
  if (!approval) {
    throw new Error('Approval request not found');
  }
  
  if (approval.approver !== actionUser) {
    throw new Error('User not authorized to update this approval');
  }
  
  approval.status = status;
  approval.updatedAt = new Date();
  
  config.storage.approvals.set(requestId, approval);
  
  return approval;
};