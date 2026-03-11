import { v4 as uuidv4 } from 'uuid'

/**
 * Tạo UUID giả cho testing
 */
export function mockId(prefix = 'id'): string {
    return `${prefix}-${uuidv4().substring(0, 8)}`
}

/**
 * Tạo mock user object
 */
export function createMockUser(overrides?: Partial<any>) {
    return {
        id: mockId('user'),
        username: 'testuser',
        email: 'test@example.com',
        full_name: 'Test User',
        password_hash: 'hashed_password',
        is_active: true,
        unit_id: mockId('unit'),
        created_at: new Date(),
        updated_at: new Date(),
        ...overrides
    }
}

/**
 * Tạo mock profile_staff object
 */
export function createMockProfileStaff(overrides?: Partial<any>) {
    return {
        id: mockId('profile'),
        user_id: mockId('user'),
        employment_status: 'active',
        date_of_birth: new Date('1990-01-01'),
        academic_degree: 'PhD',
        academic_title: 'Associate Professor',
        unit_id: mockId('unit'),
        created_at: new Date(),
        updated_at: new Date(),
        ...overrides
    }
}

/**
 * Tạo mock organizational_unit object
 */
export function createMockOrganizationalUnit(overrides?: Partial<any>) {
    return {
        id: mockId('unit'),
        name: 'Faculty of Information Technology',
        code: 'FIT',
        unit_type: 'faculty',
        parent_id: null,
        created_at: new Date(),
        updated_at: new Date(),
        ...overrides
    }
}

/**
 * Tạo mock recruitment object
 */
export function createMockRecruitment(overrides?: Partial<any>) {
    return {
        id: mockId('recruitment'),
        position_title: 'Lecturer',
        department: 'FIT',
        status: 'pending',
        created_by: mockId('user'),
        created_at: new Date(),
        updated_at: new Date(),
        ...overrides
    }
}

/**
 * Tạo mock workload object
 */
export function createMockWorkload(overrides?: Partial<any>) {
    return {
        id: mockId('workload'),
        profile_id: mockId('profile'),
        academic_year: '2024',
        semester: '1',
        total_teaching: 120,
        quota_teaching: 150,
        created_at: new Date(),
        updated_at: new Date(),
        ...overrides
    }
}

/**
 * Tạo mock salary object
 */
export function createMockSalary(overrides?: Partial<any>) {
    return {
        id: mockId('salary'),
        profile_id: mockId('profile'),
        occupation_code: 'VC.001',
        salary_grade: 3,
        salary_coefficient: 2.34,
        effective_date: new Date(),
        decision_number: '123/QD-2024',
        created_at: new Date(),
        ...overrides
    }
}

/**
 * Tạo mock reward object
 */
export function createMockReward(overrides?: Partial<any>) {
    return {
        id: mockId('reward'),
        profile_id: mockId('profile'),
        title_name: 'Excellent Teacher',
        title_level: 'university',
        awarded_year: '2024',
        decision_number: '456/QD-2024',
        created_at: new Date(),
        ...overrides
    }
}

/**
 * Tạo mock attachment object
 */
export function createMockAttachment(overrides?: Partial<any>) {
    return {
        id: mockId('attachment'),
        resource_type: 'profile',
        resource_id: mockId('profile'),
        uploaded_by: mockId('user'),
        file_name: 'test.pdf',
        file_size_bytes: 1024,
        mime_type: 'application/pdf',
        storage_key: 'profiles/test-uuid.pdf',
        storage_bucket: 'hrm-files',
        category: 'certificate',
        is_verified: false,
        uploaded_at: new Date(),
        ...overrides
    }
}

/**
 * Tạo mock notification object
 */
export function createMockNotification(overrides?: Partial<any>) {
    return {
        id: mockId('notification'),
        template_code: 'welcome',
        recipient_id: mockId('user'),
        resource_type: 'profile',
        resource_id: null,
        payload: {},
        channel: 'in_app',
        status: 'pending',
        scheduled_at: new Date(),
        created_at: new Date(),
        ...overrides
    }
}

/**
 * Tạo mock audit log object
 */
export function createMockAuditLog(overrides?: Partial<any>) {
    return {
        id: mockId('audit'),
        actor_id: mockId('user'),
        action: 'CREATE',
        resource_type: 'profile',
        resource_id: mockId('profile'),
        new_values: {},
        actor_ip: '127.0.0.1',
        event_time: new Date(),
        created_at: new Date(),
        ...overrides
    }
}

/**
 * Tạo mock auth user cho testing
 */
export function createMockAuthUser(overrides?: Partial<any>) {
    return {
        id: mockId('user'),
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        unitId: mockId('unit'),
        ...overrides
    }
}

/**
 * Tạo mock user scope cho testing
 */
export function createMockUserScope(overrides?: Partial<any>) {
    return {
        scopeType: 'faculty',
        unitId: mockId('unit'),
        ...overrides
    }
}
