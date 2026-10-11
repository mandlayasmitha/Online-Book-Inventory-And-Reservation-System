const asyncHandler = require('../utils/asyncHandler');
const service = require('../services/member.service');

// GET /api/members  (read-only helper)
exports.list = asyncHandler(async (req, res) => {
  const members = await service.listMembers();
  res.json({ success: true, count: members.length, data: members });
});
