import request from './request.js';

export default {
  // Fetch a milestone.
  fetch: request.oneMilestone,
  // Fetch all milestones.
  fetchAll: request.allMilestones
};
