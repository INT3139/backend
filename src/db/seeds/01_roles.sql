-- Seed: roles
INSERT INTO roles (id, code, name, description) VALUES
  (gen_random_uuid(), 'sys_admin',      'Quản trị hệ thống',       'Toàn quyền hệ thống'),
  (gen_random_uuid(), 'hrm_director',   'Trưởng P.HCNS',           'Lãnh đạo phòng HCNS'),
  (gen_random_uuid(), 'cv_hrm',         'Chuyên viên HCNS',        'Quản lý hồ sơ nhân sự'),
  (gen_random_uuid(), 'cv_salary',      'Chuyên viên lương',       'Quản lý chế độ lương'),
  (gen_random_uuid(), 'cv_workload',    'Chuyên viên định mức',    'Quản lý KLGD'),
  (gen_random_uuid(), 'cv_reward',      'Chuyên viên thi đua',     'Quản lý thi đua khen thưởng'),
  (gen_random_uuid(), 'faculty_leader', 'Trưởng/Phó khoa',         'Lãnh đạo cấp khoa'),
  (gen_random_uuid(), 'dept_head',      'Trưởng/Phó bộ môn',       'Lãnh đạo cấp bộ môn'),
  (gen_random_uuid(), 'lecturer',       'Giảng viên',              'Cán bộ giảng dạy')
ON CONFLICT (code) DO NOTHING;
