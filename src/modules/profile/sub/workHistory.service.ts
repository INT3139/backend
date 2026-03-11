import { profileSubRepo } from "../profileSub.repo"
import { UUID } from "@/types"

export class WorkHistoryService {
    /**
     * Get lịch sử công tác
     */
    async getByProfileId(profileId: UUID) {
        return await profileSubRepo.getWorkHistory(profileId)
    }

    /**
     * Thêm lịch sử công tác
     */
    async create(data: any) {
        return await profileSubRepo.createWorkHistory(data)
    }

    /**
     * Xóa lịch sử công tác
     */
    async delete(id: UUID) {
        return await profileSubRepo.deleteWorkHistory(id)
    }
}

export const workHistoryService = new WorkHistoryService()
