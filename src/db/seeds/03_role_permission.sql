INSERT INTO role_permissions (role_id, permission_code)
SELECT r.id, w.perm FROM (VALUES

  -- ── sys_admin: toàn quyền ────────────────────────────────────
  ('sys_admin', 'hrm.*'),
  ('sys_admin', 'system.*'),

  -- ── headmaster: toàn bộ hrm + audit ─────────────────────────
  ('headmaster', 'hrm.*'),
  ('headmaster', 'system.audit.*'),

  -- ── hrm_director: toàn bộ hrm + system auth/audit/config ────
  ('hrm_director', 'hrm.*'),
  ('hrm_director', 'system.auth.*'),
  ('hrm_director', 'system.audit.*'),
  ('hrm_director', 'system.config.read'),

  -- ── cv_hrm: profile + tuyển dụng + hợp đồng ─────────────────
  ('cv_hrm', 'hrm.profile.*'),
  ('cv_hrm', 'hrm.recruitment.*'),
  ('cv_hrm', 'hrm.contract.*'),
  ('cv_hrm', 'hrm.salary.read'),
  ('cv_hrm', 'hrm.appointment.read'),
  ('cv_hrm', 'hrm.appointment.alert_read'),
  ('cv_hrm', 'hrm.workload.read'),
  ('cv_hrm', 'hrm.reward.read'),
  ('cv_hrm', 'hrm.stats.unit.read'),
  ('cv_hrm', 'hrm.org.read'),
  ('cv_hrm', 'hrm.notification.read'),
  ('cv_hrm', 'hrm.notification.send'),
  ('cv_hrm', 'hrm.attachment.*'),
  ('cv_hrm', 'hrm.workflow.read'),
  ('cv_hrm', 'hrm.workflow.advance'),

  -- ── cv_salary: lương ─────────────────────────────────────────
  ('cv_salary', 'hrm.salary.*'),
  ('cv_salary', 'hrm.profile.read'),
  ('cv_salary', 'hrm.stats.salary.read'),
  ('cv_salary', 'hrm.stats.unit.read'),
  ('cv_salary', 'hrm.notification.read'),
  ('cv_salary', 'hrm.notification.send'),
  ('cv_salary', 'hrm.attachment.upload'),
  ('cv_salary', 'hrm.attachment.download'),
  ('cv_salary', 'hrm.workflow.read'),
  ('cv_salary', 'hrm.workflow.advance'),

  -- ── cv_reward: thi đua ───────────────────────────────────────
  ('cv_reward', 'hrm.reward.*'),
  ('cv_reward', 'hrm.profile.read'),
  ('cv_reward', 'hrm.stats.reward.read'),
  ('cv_reward', 'hrm.stats.unit.read'),
  ('cv_reward', 'hrm.notification.read'),
  ('cv_reward', 'hrm.notification.send'),
  ('cv_reward', 'hrm.attachment.upload'),
  ('cv_reward', 'hrm.attachment.download'),
  ('cv_reward', 'hrm.workflow.read'),
  ('cv_reward', 'hrm.workflow.advance'),

  -- ── cv_workload: định mức ────────────────────────────────────
  ('cv_workload', 'hrm.workload.*'),
  ('cv_workload', 'hrm.profile.read'),
  ('cv_workload', 'hrm.stats.workload.read'),
  ('cv_workload', 'hrm.stats.unit.read'),
  ('cv_workload', 'hrm.notification.read'),
  ('cv_workload', 'hrm.notification.send'),
  ('cv_workload', 'hrm.attachment.upload'),
  ('cv_workload', 'hrm.attachment.download'),
  ('cv_workload', 'hrm.workflow.read'),
  ('cv_workload', 'hrm.workflow.advance'),

  -- ── faculty_leader: trưởng/phó khoa ─────────────────────────
  ('faculty_leader', 'hrm.appointment.*'),
  ('faculty_leader', 'hrm.reward.*'),
  ('faculty_leader', 'hrm.recruitment.*'),
  ('faculty_leader', 'hrm.profile.read'),
  ('faculty_leader', 'hrm.profile.approve'),
  ('faculty_leader', 'hrm.profile.reject'),
  ('faculty_leader', 'hrm.profile.export'),
  ('faculty_leader', 'hrm.contract.read'),
  ('faculty_leader', 'hrm.contract.approve'),
  ('faculty_leader', 'hrm.contract.extend'),
  ('faculty_leader', 'hrm.salary.read'),
  ('faculty_leader', 'hrm.workload.read'),
  ('faculty_leader', 'hrm.workload.approve'),
  ('faculty_leader', 'hrm.workload.export'),
  ('faculty_leader', 'hrm.stats.unit.read'),
  ('faculty_leader', 'hrm.stats.workload.read'),
  ('faculty_leader', 'hrm.stats.reward.read'),
  ('faculty_leader', 'hrm.org.read'),
  ('faculty_leader', 'hrm.notification.read'),
  ('faculty_leader', 'hrm.notification.send'),
  ('faculty_leader', 'hrm.attachment.*'),
  ('faculty_leader', 'hrm.workflow.read'),
  ('faculty_leader', 'hrm.workflow.advance'),

  -- ── dept_head: trưởng/phó bộ môn ────────────────────────────
  -- Scope bị giới hạn bởi scope_unit_id trong user_roles
  -- Không có quyền bổ nhiệm write/approve/dismiss, không ký HĐ
  ('dept_head', 'hrm.profile.read'),
  ('dept_head', 'hrm.profile.export'),
  ('dept_head', 'hrm.recruitment.read'),
  ('dept_head', 'hrm.recruitment.write'),      -- đề xuất lên khoa
  ('dept_head', 'hrm.contract.read'),
  ('dept_head', 'hrm.salary.read'),
  ('dept_head', 'hrm.appointment.read'),
  ('dept_head', 'hrm.appointment.ballot'),
  ('dept_head', 'hrm.workload.read'),
  ('dept_head', 'hrm.workload.approve'),        -- duyệt KLGD đơn vị mình
  ('dept_head', 'hrm.workload.export'),
  ('dept_head', 'hrm.reward.read'),
  ('dept_head', 'hrm.reward.write'),            -- đề xuất thi đua
  ('dept_head', 'hrm.reward.ballot'),
  ('dept_head', 'hrm.stats.unit.read'),
  ('dept_head', 'hrm.stats.workload.read'),
  ('dept_head', 'hrm.stats.reward.read'),
  ('dept_head', 'hrm.org.read'),
  ('dept_head', 'hrm.notification.read'),
  ('dept_head', 'hrm.notification.send'),
  ('dept_head', 'hrm.attachment.upload'),
  ('dept_head', 'hrm.attachment.download'),
  ('dept_head', 'hrm.workflow.read'),
  ('dept_head', 'hrm.workflow.advance'),

  -- ── lecturer: tự xem + khai báo KLGD + bỏ phiếu ────────────
  ('lecturer', 'hrm.profile.read'),
  ('lecturer', 'hrm.profile.write'),
  ('lecturer', 'hrm.salary.self_read'),
  ('lecturer', 'hrm.workload.self_read'),
  ('lecturer', 'hrm.workload.write'),
  ('lecturer', 'hrm.reward.self_read'),
  ('lecturer', 'hrm.reward.ballot'),
  ('lecturer', 'hrm.appointment.ballot'),
  ('lecturer', 'hrm.notification.read'),
  ('lecturer', 'hrm.attachment.upload'),
  ('lecturer', 'hrm.attachment.download'),
  ('lecturer', 'hrm.workflow.read')

) AS w(role_code, perm)
JOIN roles r ON r.code = w.role_code
ON CONFLICT (role_id, permission_code) DO NOTHING;
