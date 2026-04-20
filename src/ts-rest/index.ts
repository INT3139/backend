import { initContract } from '@ts-rest/core';
import { authContract } from './auth.contract';
import { profileContract } from './profile.contract';
import { adminContract } from './admin.contract';
import { workflowContract } from './workflow.contract';
import { recruitmentContract } from './recruitment.contract';
import { rewardContract } from './reward.contract';
import { salaryContract } from './salary.contract';
import { attachmentContract } from './attachment.contract';
import { workloadContract } from './workload.contract';

const c = initContract();

export const apiContract = c.router({
  auth: authContract,
  admin: adminContract,
  profile: profileContract,
  workflow: workflowContract,
  recruitment: recruitmentContract,
  reward: rewardContract,
  salary: salaryContract,
  attachment: attachmentContract,
  workload: workloadContract,
}, {
  pathPrefix: '/api/v1'
});
