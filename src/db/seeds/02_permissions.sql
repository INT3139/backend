-- ================================================================
-- SEED 02: PERMISSIONS + ROLE–PERMISSION MAPPING (wildcard)
-- ================================================================

-- ----------------------------------------------------------------
-- PHẦN 1: DANH MỤC PERMISSION
-- ----------------------------------------------------------------
INSERT INTO permissions (id, code, description, is_active) VALUES
  ('20000000-0000-0001-0000-000000000001', 'hrm.profile.read',           'Xem hồ sơ cán bộ', TRUE),
  ('20000000-0000-0001-0000-000000000002', 'hrm.profile.write',          'Tạo / cập nhật hồ sơ', TRUE),
  ('20000000-0000-0001-0000-000000000003', 'hrm.profile.approve',        'Duyệt hồ sơ', TRUE),
  ('20000000-0000-0001-0000-000000000004', 'hrm.profile.reject',         'Trả hồ sơ về draft', TRUE),
  ('20000000-0000-0001-0000-000000000005', 'hrm.profile.export',         'Xuất danh sách cán bộ', TRUE),
  ('20000000-0000-0001-0000-000000000006', 'hrm.profile.delete',         'Xóa mềm hồ sơ', TRUE),
  ('20000000-0000-0001-0000-000000000007', 'hrm.profile.status',         'Thay đổi trạng thái công tác', TRUE),
  ('20000000-0000-0002-0000-000000000001', 'hrm.recruitment.read',       'Xem đề xuất tuyển dụng', TRUE),
  ('20000000-0000-0002-0000-000000000002', 'hrm.recruitment.write',      'Tạo / sửa đề xuất tuyển dụng', TRUE),
  ('20000000-0000-0002-0000-000000000003', 'hrm.recruitment.approve',    'Phê duyệt tuyển dụng', TRUE),
  ('20000000-0000-0002-0000-000000000004', 'hrm.recruitment.export',     'Xuất danh sách ứng viên', TRUE),
  ('20000000-0000-0003-0000-000000000001', 'hrm.contract.read',          'Xem hợp đồng', TRUE),
  ('20000000-0000-0003-0000-000000000002', 'hrm.contract.write',         'Tạo / sửa hợp đồng', TRUE),
  ('20000000-0000-0003-0000-000000000003', 'hrm.contract.approve',       'Ký duyệt hợp đồng', TRUE),
  ('20000000-0000-0003-0000-000000000004', 'hrm.contract.terminate',     'Chấm dứt hợp đồng', TRUE),
  ('20000000-0000-0003-0000-000000000005', 'hrm.contract.extend',        'Gia hạn hợp đồng', TRUE),
  ('20000000-0000-0003-0000-000000000006', 'hrm.contract.export',        'Xuất danh sách HĐ sắp hết hạn', TRUE),
  ('20000000-0000-0004-0000-000000000001', 'hrm.salary.read',            'Xem thông tin lương', TRUE),
  ('20000000-0000-0004-0000-000000000002', 'hrm.salary.self_read',       'Tự xem lương bản thân', TRUE),
  ('20000000-0000-0004-0000-000000000003', 'hrm.salary.write',           'Cập nhật lương', TRUE),
  ('20000000-0000-0004-0000-000000000004', 'hrm.salary.approve',         'Phê duyệt nâng bậc lương', TRUE),
  ('20000000-0000-0004-0000-000000000005', 'hrm.salary.propose',         'Lập đề xuất nâng bậc', TRUE),
  ('20000000-0000-0004-0000-000000000006', 'hrm.salary.export',          'Xuất báo cáo lương', TRUE),
  ('20000000-0000-0005-0000-000000000001', 'hrm.appointment.read',       'Xem quyết định bổ nhiệm', TRUE),
  ('20000000-0000-0005-0000-000000000002', 'hrm.appointment.write',      'Tạo / sửa hồ sơ bổ nhiệm', TRUE),
  ('20000000-0000-0005-0000-000000000003', 'hrm.appointment.approve',    'Phê duyệt bổ nhiệm', TRUE),
  ('20000000-0000-0005-0000-000000000004', 'hrm.appointment.ballot',     'Bỏ phiếu tín nhiệm', TRUE),
  ('20000000-0000-0005-0000-000000000005', 'hrm.appointment.dismiss',    'Ra quyết định miễn nhiệm', TRUE),
  ('20000000-0000-0005-0000-000000000006', 'hrm.appointment.extend',     'Kéo dài thời gian chức vụ', TRUE),
  ('20000000-0000-0005-0000-000000000007', 'hrm.appointment.export',     'Xuất danh sách bổ nhiệm', TRUE),
  ('20000000-0000-0005-0000-000000000008', 'hrm.appointment.alert_read', 'Cảnh báo bổ nhiệm sắp hết hạn', TRUE),
  ('20000000-0000-0006-0000-000000000001', 'hrm.workload.read',          'Xem định mức KLGD đơn vị', TRUE),
  ('20000000-0000-0006-0000-000000000002', 'hrm.workload.self_read',     'Tự xem định mức KLGD cá nhân', TRUE),
  ('20000000-0000-0006-0000-000000000003', 'hrm.workload.write',         'Khai báo minh chứng KLGD', TRUE),
  ('20000000-0000-0006-0000-000000000004', 'hrm.workload.approve',       'Xét duyệt minh chứng KLGD', TRUE),
  ('20000000-0000-0006-0000-000000000005', 'hrm.workload.admin',         'Cài đặt tham số định mức', TRUE),
  ('20000000-0000-0006-0000-000000000006', 'hrm.workload.finalize',      'Chốt tổng hợp KLGD', TRUE),
  ('20000000-0000-0006-0000-000000000007', 'hrm.workload.export',        'Xuất báo cáo KLGD', TRUE),
  ('20000000-0000-0007-0000-000000000001', 'hrm.reward.read',            'Xem hồ sơ thi đua', TRUE),
  ('20000000-0000-0007-0000-000000000002', 'hrm.reward.self_read',       'Tự xem khen thưởng bản thân', TRUE),
  ('20000000-0000-0007-0000-000000000003', 'hrm.reward.write',           'Tạo / sửa hồ sơ thi đua', TRUE),
  ('20000000-0000-0007-0000-000000000004', 'hrm.reward.approve',         'Phê duyệt hồ sơ thi đua', TRUE),
  ('20000000-0000-0007-0000-000000000005', 'hrm.reward.ballot',          'Bỏ phiếu bình xét thi đua', TRUE),
  ('20000000-0000-0007-0000-000000000006', 'hrm.reward.finalize',        'Chốt kết quả bình xét', TRUE),
  ('20000000-0000-0007-0000-000000000007', 'hrm.reward.export',          'Xuất báo cáo thi đua', TRUE),
  ('20000000-0000-0007-0000-000000000008', 'hrm.reward.discipline',      'Ghi nhận / duyệt kỷ luật', TRUE),
  ('20000000-0000-0008-0000-000000000001', 'hrm.stats.unit.read',        'Thống kê nhân sự cấp đơn vị', TRUE),
  ('20000000-0000-0008-0000-000000000002', 'hrm.stats.school.read',      'Thống kê nhân sự toàn trường', TRUE),
  ('20000000-0000-0008-0000-000000000003', 'hrm.stats.salary.read',      'Báo cáo lương', TRUE),
  ('20000000-0000-0008-0000-000000000004', 'hrm.stats.workload.read',    'Báo cáo KLGD tổng hợp', TRUE),
  ('20000000-0000-0008-0000-000000000005', 'hrm.stats.reward.read',      'Báo cáo thi đua khen thưởng', TRUE),
  ('20000000-0000-0009-0000-000000000001', 'hrm.notification.read',      'Đọc thông báo', TRUE),
  ('20000000-0000-0009-0000-000000000002', 'hrm.notification.send',      'Gửi thông báo thủ công', TRUE),
  ('20000000-0000-0009-0000-000000000003', 'hrm.notification.manage',    'Quản lý template thông báo', TRUE),
  ('20000000-0000-0010-0000-000000000001', 'hrm.attachment.upload',      'Upload file đính kèm', TRUE),
  ('20000000-0000-0010-0000-000000000002', 'hrm.attachment.download',    'Tải file đính kèm', TRUE),
  ('20000000-0000-0010-0000-000000000003', 'hrm.attachment.delete',      'Xóa file đính kèm', TRUE),
  ('20000000-0000-0010-0000-000000000004', 'hrm.attachment.verify',      'Xác minh văn bản đính kèm', TRUE),
  ('20000000-0000-0011-0000-000000000001', 'hrm.workflow.read',          'Xem trạng thái quy trình', TRUE),
  ('20000000-0000-0011-0000-000000000002', 'hrm.workflow.advance',       'Chuyển bước tiếp theo', TRUE),
  ('20000000-0000-0011-0000-000000000003', 'hrm.workflow.cancel',        'Hủy quy trình', TRUE),
  ('20000000-0000-0012-0000-000000000001', 'hrm.org.read',               'Xem cơ cấu tổ chức', TRUE),
  ('20000000-0000-0012-0000-000000000002', 'hrm.org.write',              'Tạo / sửa đơn vị tổ chức', TRUE),
  ('20000000-0000-0099-0000-000000000001', 'system.auth.role.grant',     'Gán / thu hồi vai trò', TRUE),
  ('20000000-0000-0099-0000-000000000002', 'system.auth.user.manage',    'Tạo / sửa / vô hiệu hóa tài khoản', TRUE),
  ('20000000-0000-0099-0000-000000000003', 'system.auth.password.reset', 'Đặt lại mật khẩu', TRUE),
  ('20000000-0000-0099-0000-000000000004', 'system.auth.permission.manage','Quản lý danh mục permission', TRUE),
  ('20000000-0000-0099-0000-000000000005', 'system.auth.role.manage',    'Tạo / sửa / xóa vai trò', TRUE),
  ('20000000-0000-0099-0000-000000000006', 'system.audit.read',          'Xem nhật ký hệ thống', TRUE),
  ('20000000-0000-0099-0000-000000000007', 'system.audit.export',        'Xuất nhật ký audit', TRUE),
  ('20000000-0000-0099-0000-000000000008', 'system.config.read',         'Xem cấu hình hệ thống', TRUE),
  ('20000000-0000-0099-0000-000000000009', 'system.config.write',        'Sửa cấu hình hệ thống', TRUE),
  ('20000000-0000-0099-0000-000000000010', 'system.scheduler.manage',    'Quản lý cron jobs', TRUE)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, description = EXCLUDED.description, is_active = EXCLUDED.is_active;


-- ================================================================
-- PHẦN 2: ROLE – PERMISSION MAPPING (wildcard)
-- Wildcard expand tại runtime bởi wildcardExpand.ts
-- Format: 'module.*' = toàn bộ action trong module đó
-- ================================================================
INSERT INTO role_permissions (role_id, permission_code)
SELECT r.id, w.perm FROM (VALUES

  -- ── sys_admin: toàn bộ ──────────────────────────────────────
  ('sys_admin',       'hrm.*'),
  ('sys_admin',       'system.*'),

  -- ── headmaster: toàn bộ hrm + audit ─────────────────────────
  ('headmaster',      'hrm.*'),
  ('headmaster',      'system.audit.*'),

  -- ── hrm_director: toàn bộ hrm + system auth/audit/config ────
  ('hrm_director',    'hrm.*'),
  ('hrm_director',    'system.auth.*'),
  ('hrm_director',    'system.audit.*'),
  ('hrm_director',    'system.config.read'),

  -- ── cv_hrm: profile + tuyển dụng + hợp đồng (full) ──────────
  ('cv_hrm',          'hrm.profile.*'),
  ('cv_hrm',          'hrm.recruitment.*'),
  ('cv_hrm',          'hrm.contract.*'),
  ('cv_hrm',          'hrm.salary.read'),
  ('cv_hrm',          'hrm.appointment.read'),
  ('cv_hrm',          'hrm.appointment.alert_read'),
  ('cv_hrm',          'hrm.workload.read'),
  ('cv_hrm',          'hrm.reward.read'),
  ('cv_hrm',          'hrm.stats.unit.read'),
  ('cv_hrm',          'hrm.org.read'),
  ('cv_hrm',          'hrm.notification.read'),
  ('cv_hrm',          'hrm.notification.send'),
  ('cv_hrm',          'hrm.attachment.*'),
  ('cv_hrm',          'hrm.workflow.read'),
  ('cv_hrm',          'hrm.workflow.advance'),

  -- ── cv_salary: lương (full) ──────────────────────────────────
  ('cv_salary',       'hrm.salary.*'),
  ('cv_salary',       'hrm.profile.read'),
  ('cv_salary',       'hrm.stats.salary.read'),
  ('cv_salary',       'hrm.stats.unit.read'),
  ('cv_salary',       'hrm.notification.read'),
  ('cv_salary',       'hrm.notification.send'),
  ('cv_salary',       'hrm.attachment.upload'),
  ('cv_salary',       'hrm.attachment.download'),
  ('cv_salary',       'hrm.workflow.read'),
  ('cv_salary',       'hrm.workflow.advance'),

  -- ── cv_reward: thi đua (full) ────────────────────────────────
  ('cv_reward',       'hrm.reward.*'),
  ('cv_reward',       'hrm.profile.read'),
  ('cv_reward',       'hrm.stats.reward.read'),
  ('cv_reward',       'hrm.stats.unit.read'),
  ('cv_reward',       'hrm.notification.read'),
  ('cv_reward',       'hrm.notification.send'),
  ('cv_reward',       'hrm.attachment.upload'),
  ('cv_reward',       'hrm.attachment.download'),
  ('cv_reward',       'hrm.workflow.read'),
  ('cv_reward',       'hrm.workflow.advance'),

  -- ── cv_workload: định mức (full) ─────────────────────────────
  ('cv_workload',     'hrm.workload.*'),
  ('cv_workload',     'hrm.profile.read'),
  ('cv_workload',     'hrm.stats.workload.read'),
  ('cv_workload',     'hrm.stats.unit.read'),
  ('cv_workload',     'hrm.notification.read'),
  ('cv_workload',     'hrm.notification.send'),
  ('cv_workload',     'hrm.attachment.upload'),
  ('cv_workload',     'hrm.attachment.download'),
  ('cv_workload',     'hrm.workflow.read'),
  ('cv_workload',     'hrm.workflow.advance'),

  -- ── faculty_leader: bổ nhiệm + thi đua + tuyển dụng (full) ──
  ('faculty_leader',  'hrm.appointment.*'),
  ('faculty_leader',  'hrm.reward.*'),
  ('faculty_leader',  'hrm.recruitment.*'),
  ('faculty_leader',  'hrm.profile.read'),
  ('faculty_leader',  'hrm.profile.approve'),
  ('faculty_leader',  'hrm.profile.reject'),
  ('faculty_leader',  'hrm.profile.export'),
  ('faculty_leader',  'hrm.contract.read'),
  ('faculty_leader',  'hrm.contract.approve'),
  ('faculty_leader',  'hrm.contract.extend'),
  ('faculty_leader',  'hrm.salary.read'),
  ('faculty_leader',  'hrm.workload.read'),
  ('faculty_leader',  'hrm.workload.approve'),
  ('faculty_leader',  'hrm.workload.export'),
  ('faculty_leader',  'hrm.stats.unit.read'),
  ('faculty_leader',  'hrm.stats.workload.read'),
  ('faculty_leader',  'hrm.stats.reward.read'),
  ('faculty_leader',  'hrm.org.read'),
  ('faculty_leader',  'hrm.notification.read'),
  ('faculty_leader',  'hrm.notification.send'),
  ('faculty_leader',  'hrm.attachment.*'),
  ('faculty_leader',  'hrm.workflow.read'),
  ('faculty_leader',  'hrm.workflow.advance'),

  -- ── lecturer: tự xem + khai báo KLGD + bỏ phiếu ────────────
  ('lecturer',        'hrm.profile.read'),
  ('lecturer',        'hrm.profile.write'),
  ('lecturer',        'hrm.salary.self_read'),
  ('lecturer',        'hrm.workload.self_read'),
  ('lecturer',        'hrm.workload.write'),
  ('lecturer',        'hrm.reward.self_read'),
  ('lecturer',        'hrm.reward.ballot'),
  ('lecturer',        'hrm.appointment.ballot'),
  ('lecturer',        'hrm.notification.read'),
  ('lecturer',        'hrm.attachment.upload'),
  ('lecturer',        'hrm.attachment.download'),
  ('lecturer',        'hrm.workflow.read')

) AS w(role_code, perm)
JOIN roles r ON r.code = w.role_code
ON CONFLICT (role_id, permission_code) DO NOTHING;
