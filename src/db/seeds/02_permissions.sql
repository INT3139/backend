-- ================================================================
-- SEED 02: PERMISSIONS + ROLE–PERMISSION MAPPING (wildcard)
-- ================================================================

-- ----------------------------------------------------------------
-- PHẦN 1: DANH MỤC PERMISSION
-- ----------------------------------------------------------------
INSERT INTO permissions (code, description, is_active) VALUES
  ('hrm.profile.read',              'Xem hồ sơ cán bộ',                        TRUE),
  ('hrm.profile.write',             'Tạo / cập nhật hồ sơ',                    TRUE),
  ('hrm.profile.approve',           'Duyệt hồ sơ',                             TRUE),
  ('hrm.profile.reject',            'Trả hồ sơ về draft',                      TRUE),
  ('hrm.profile.export',            'Xuất danh sách cán bộ',                   TRUE),
  ('hrm.profile.delete',            'Xóa mềm hồ sơ',                           TRUE),
  ('hrm.profile.status',            'Thay đổi trạng thái công tác',            TRUE),
  ('hrm.recruitment.read',          'Xem đề xuất tuyển dụng',                  TRUE),
  ('hrm.recruitment.write',         'Tạo / sửa đề xuất tuyển dụng',            TRUE),
  ('hrm.recruitment.approve',       'Phê duyệt tuyển dụng',                    TRUE),
  ('hrm.recruitment.export',        'Xuất danh sách ứng viên',                 TRUE),
  ('hrm.contract.read',             'Xem hợp đồng',                            TRUE),
  ('hrm.contract.write',            'Tạo / sửa hợp đồng',                      TRUE),
  ('hrm.contract.approve',          'Ký duyệt hợp đồng',                       TRUE),
  ('hrm.contract.terminate',        'Chấm dứt hợp đồng',                       TRUE),
  ('hrm.contract.extend',           'Gia hạn hợp đồng',                        TRUE),
  ('hrm.contract.export',           'Xuất danh sách HĐ sắp hết hạn',           TRUE),
  ('hrm.salary.read',               'Xem thông tin lương',                     TRUE),
  ('hrm.salary.self_read',          'Tự xem lương bản thân',                   TRUE),
  ('hrm.salary.write',              'Cập nhật lương',                          TRUE),
  ('hrm.salary.approve',            'Phê duyệt nâng bậc lương',                TRUE),
  ('hrm.salary.propose',            'Lập đề xuất nâng bậc',                    TRUE),
  ('hrm.salary.export',             'Xuất báo cáo lương',                      TRUE),
  ('hrm.appointment.read',          'Xem quyết định bổ nhiệm',                 TRUE),
  ('hrm.appointment.write',         'Tạo / sửa hồ sơ bổ nhiệm',               TRUE),
  ('hrm.appointment.approve',       'Phê duyệt bổ nhiệm',                      TRUE),
  ('hrm.appointment.ballot',        'Bỏ phiếu tín nhiệm',                      TRUE),
  ('hrm.appointment.dismiss',       'Ra quyết định miễn nhiệm',                TRUE),
  ('hrm.appointment.extend',        'Kéo dài thời gian chức vụ',               TRUE),
  ('hrm.appointment.export',        'Xuất danh sách bổ nhiệm',                 TRUE),
  ('hrm.appointment.alert_read',    'Cảnh báo bổ nhiệm sắp hết hạn',           TRUE),
  ('hrm.workload.read',             'Xem định mức KLGD đơn vị',                TRUE),
  ('hrm.workload.self_read',        'Tự xem định mức KLGD cá nhân',            TRUE),
  ('hrm.workload.write',            'Khai báo minh chứng KLGD',                TRUE),
  ('hrm.workload.approve',          'Xét duyệt minh chứng KLGD',               TRUE),
  ('hrm.workload.admin',            'Cài đặt tham số định mức',                TRUE),
  ('hrm.workload.finalize',         'Chốt tổng hợp KLGD',                      TRUE),
  ('hrm.workload.export',           'Xuất báo cáo KLGD',                       TRUE),
  ('hrm.reward.read',               'Xem hồ sơ thi đua',                       TRUE),
  ('hrm.reward.self_read',          'Tự xem khen thưởng bản thân',             TRUE),
  ('hrm.reward.write',              'Tạo / sửa hồ sơ thi đua',                TRUE),
  ('hrm.reward.approve',            'Phê duyệt hồ sơ thi đua',                TRUE),
  ('hrm.reward.ballot',             'Bỏ phiếu bình xét thi đua',               TRUE),
  ('hrm.reward.finalize',           'Chốt kết quả bình xét',                   TRUE),
  ('hrm.reward.export',             'Xuất báo cáo thi đua',                    TRUE),
  ('hrm.reward.discipline',         'Ghi nhận / duyệt kỷ luật',                TRUE),
  ('hrm.stats.unit.read',           'Thống kê nhân sự cấp đơn vị',             TRUE),
  ('hrm.stats.school.read',         'Thống kê nhân sự toàn trường',            TRUE),
  ('hrm.stats.salary.read',         'Báo cáo lương',                           TRUE),
  ('hrm.stats.workload.read',       'Báo cáo KLGD tổng hợp',                   TRUE),
  ('hrm.stats.reward.read',         'Báo cáo thi đua khen thưởng',             TRUE),
  ('hrm.notification.read',         'Đọc thông báo',                           TRUE),
  ('hrm.notification.send',         'Gửi thông báo thủ công',                  TRUE),
  ('hrm.notification.manage',       'Quản lý template thông báo',              TRUE),
  ('hrm.attachment.upload',         'Upload file đính kèm',                    TRUE),
  ('hrm.attachment.download',       'Tải file đính kèm',                       TRUE),
  ('hrm.attachment.delete',         'Xóa file đính kèm',                       TRUE),
  ('hrm.attachment.verify',         'Xác minh văn bản đính kèm',               TRUE),
  ('hrm.workflow.read',             'Xem trạng thái quy trình',                TRUE),
  ('hrm.workflow.advance',          'Chuyển bước tiếp theo',                   TRUE),
  ('hrm.workflow.cancel',           'Hủy quy trình',                           TRUE),
  ('hrm.org.read',                  'Xem cơ cấu tổ chức',                      TRUE),
  ('hrm.org.write',                 'Tạo / sửa đơn vị tổ chức',               TRUE),
  ('system.auth.role.grant',        'Gán / thu hồi vai trò',                   TRUE),
  ('system.auth.user.manage',       'Tạo / sửa / vô hiệu hóa tài khoản',      TRUE),
  ('system.auth.password.reset',    'Đặt lại mật khẩu',                        TRUE),
  ('system.auth.permission.manage', 'Quản lý danh mục permission',             TRUE),
  ('system.auth.role.manage',       'Tạo / sửa / xóa vai trò',                TRUE),
  ('system.audit.read',             'Xem nhật ký hệ thống',                    TRUE),
  ('system.audit.export',           'Xuất nhật ký audit',                      TRUE),
  ('system.config.read',            'Xem cấu hình hệ thống',                   TRUE),
  ('system.config.write',           'Sửa cấu hình hệ thống',                   TRUE),
  ('system.scheduler.manage',       'Quản lý cron jobs',                        TRUE)
ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  is_active   = EXCLUDED.is_active;


-- ================================================================
-- PHẦN 2: ROLE – PERMISSION MAPPING (wildcard)
-- ================================================================
-- Lưu ý: middleware phải expand wildcard (hrm.*, hrm.profile.*, ...)
-- trước khi check. Các pattern này không map tới bản ghi permissions cụ thể.

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