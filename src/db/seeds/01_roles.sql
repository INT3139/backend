-- Seed: roles
INSERT INTO roles (code, name, description) VALUES
  ('sys_admin',      'Quản trị hệ thống',       'Toàn quyền hệ thống'),
  ('headmaster',      'Ban giám hiệu',           'Lãnh đạo nhà trường'),
  ('hrm_director',   'Trưởng P.HCNS',           'Lãnh đạo phòng HCNS'),
  ('cv_hrm',         'Chuyên viên HCNS',        'Quản lý hồ sơ nhân sự'),
  ('cv_salary',      'Chuyên viên lương',       'Quản lý chế độ lương'),
  ('cv_workload',    'Chuyên viên định mức',    'Quản lý KLGD'),
  ('cv_reward',      'Chuyên viên thi đua',     'Quản lý thi đua khen thưởng'),
  ('faculty_leader', 'Trưởng/Phó khoa',         'Lãnh đạo cấp khoa'),
  ('dept_head',      'Trưởng/Phó bộ môn',       'Lãnh đạo cấp bộ môn'),
  ('lecturer',       'Giảng viên',              'Cán bộ giảng dạy')
ON CONFLICT (code) DO NOTHING;
