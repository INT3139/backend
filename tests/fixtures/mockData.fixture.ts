import { ID, AuthUser } from "@/types"

/**
 * Tạo ID giả cho testing (number)
 */
export function mockId(): number {
    return Math.floor(Math.random() * 1000000) + 1
}

/**
 * Tạo mock user object
 */
export function createMockUser(overrides?: Partial<any>) {
    return {
        id: mockId(),
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        passwordHash: 'hashed_password',
        isActive: true,
        unitId: mockId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides
    }
}

/**
 * Tạo mock profile_staff object
 */
export function createMockProfileStaff(overrides?: Partial<any>) {
    return {
        id: mockId(),
        userId: mockId(),
        employmentStatus: 'active',
        dateOfBirth: new Date('1990-01-01'),
        academicDegree: 'PhD',
        academicTitle: 'Associate Professor',
        unitId: mockId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides
    }
}

/**
 * Tạo mock organizational_unit object
 */
export function createMockOrganizationalUnit(overrides?: Partial<any>) {
    return {
        id: mockId(),
        name: 'Faculty of Information Technology',
        code: 'FIT',
        unitType: 'faculty',
        ...overrides
    }
}

/**
 * Tạo AuthUser cho request
 */
export function createMockAuthUser(overrides?: Partial<Partial<AuthUser>>): AuthUser {
    return {
        id: mockId(),
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        unitId: mockId(),
        ...overrides
    }
}
