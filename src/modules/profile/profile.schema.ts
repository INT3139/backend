import { z } from 'zod'

export const createProfileSchema = z.object({
    userId: z.number().int().positive(),
    unitId: z.number().int().positive(),
    emailVnu: z.string().email().optional(),
    emailPersonal: z.string().email().optional(),
    phoneWork: z.string().optional(),
    phoneHome: z.string().optional(),
    dateOfBirth: z.string().transform(v => new Date(v)).optional(),
    gender: z.string().optional(),
    idNumber: z.string().optional(),
    idIssuedDate: z.string().transform(v => new Date(v)).optional(),
    idIssuedBy: z.string().optional(),
    nationality: z.string().optional(),
    ethnicity: z.string().optional(),
    religion: z.string().optional(),
    maritalStatus: z.string().optional(),
    policyObject: z.string().optional(),
    nickName: z.string().optional(),
    passportNumber: z.string().optional(),
    passportIssuedAt: z.string().transform(v => new Date(v)).optional(),
    passportIssuedBy: z.string().optional(),
    insuranceNumber: z.string().optional(),
    insuranceJoinedAt: z.string().transform(v => new Date(v)).optional(),
    addrHometown: z.record(z.string(), z.unknown()).optional(),
    addrBirthplace: z.record(z.string(), z.unknown()).optional(),
    addrPermanent: z.record(z.string(), z.unknown()).optional(),
    addrCurrent: z.record(z.string(), z.unknown()).optional(),
    academicDegree: z.string().optional(),
    academicTitle: z.string().optional(),
    eduLevelGeneral: z.string().optional(),
    stateManagement: z.string().optional(),
    politicalTheory: z.string().optional(),
    foreignLangLevel: z.string().optional(),
    itLevel: z.string().optional(),
    staffType: z.string().optional(),
    employmentStatus: z.string().optional(),
    joinDate: z.string().transform(v => new Date(v)).optional(),
    retireDate: z.string().transform(v => new Date(v)).optional(),
    profileStatus: z.string().optional(),
    avatarDefault: z.boolean().optional(),
    note: z.string().optional(),
    origin: z.string().optional()
})

export const updateProfileSchema = createProfileSchema.partial()

export const changeStatusSchema = z.object({
    status: z.string().min(1)
})
