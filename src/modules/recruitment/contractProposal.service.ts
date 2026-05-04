import { db } from "@/configs/db"
import { workflowEngine, type WorkflowInstance } from "@/core/workflow/engine"
import { WF } from "@/constants/workflowCodes"
import { ID, AuthUser } from "@/types"
import { users, profileStaff, recruitmentContracts } from "@/db/schema"
import { hashPassword } from "@/utils/hash"
import { registerWorkflowHandler } from "@/core/workflow/workflow.dispatcher"

export class ContractProposalService {
    /**
     * Khởi tạo đề xuất ký hợp đồng mới
     */
    async initiateProposal(data: any, user: AuthUser) {
        return db.transaction(async (tx) => {
            const workflow = await workflowEngine.initiate({
                definitionCode: WF.NEW_CONTRACT_PROPOSAL,
                resourceType: 'new_contract_proposal',
                resourceId: 0, // Placeholder
                initiatedBy: user.id,
                metadata: { proposalData: data }
            }, tx)

            // Skip logic: Nếu người tạo là faculty_leader, tự động duyệt bước Phê duyệt cấp Khoa (Step 2)
            if (user.activeRoles?.includes('faculty_leader')) {
                await workflowEngine.advance(workflow.id, user.id, 'approve', 'Tự động duyệt cấp Khoa (người khởi tạo là Trưởng khoa)')
            }

            return workflow
        })
    }

    /**
     * Rút lại đề xuất (Recall)
     */
    async recallProposal(instanceId: ID, user: AuthUser, reason: string) {
        return await workflowEngine.recall(instanceId, user.id, reason)
    }

    /**
     * Xử lý khi workflow được hoàn thành (Step 7 approved)
     */
    async applyChangesFromNewContractWorkflow(inst: WorkflowInstance, _actorId: ID, tx?: any) {
        const metadata = inst.metadata?.proposalData
        if (!metadata) return

        const dbClient = tx || db

        // 1. Tạo User (Tài khoản giảng viên mới)
        const passwordHash = await hashPassword('Uet123456') // Mật khẩu mặc định
        const [newUser] = await dbClient.insert(users).values({
            username: metadata.email.split('@')[0] + '_' + Math.floor(Math.random() * 1000),
            email: metadata.email,
            passwordHash,
            fullName: metadata.fullName,
            unitId: metadata.unitId,
        }).returning()

        // 2. Tạo Profile
        const [newProfile] = await dbClient.insert(profileStaff).values({
            userId: newUser.id,
            fullName: metadata.fullName,
            unitId: metadata.unitId,
            staffType: metadata.staffType || 'lecturer',
            employmentStatus: 'active',
            profileStatus: 'active',
        }).returning()

        // 3. Tạo Hợp đồng
        await dbClient.insert(recruitmentContracts).values({
            profileId: newProfile.id,
            contractType: metadata.contractType || 'fixed_term',
            startDate: metadata.startDate || new Date().toISOString().split('T')[0],
            endDate: metadata.endDate,
            recruitingUnitId: metadata.unitId,
            salaryGrade: metadata.salaryGrade,
            status: 'draft', // Chờ HR hoàn thiện bản ký thực tế
            workflowId: inst.id,
            createdBy: inst.initiatedBy,
        })
    }
}

export const contractProposalService = new ContractProposalService()

// Đăng ký handler để thực thi logic sau khi workflow kết thúc
registerWorkflowHandler(
    'new_contract_proposal',
    (inst, actorId, tx) => contractProposalService.applyChangesFromNewContractWorkflow(inst, actorId, tx)
)
