import { profileSubRepo } from "../profileSub.repo"
import { ID } from "@/types"

export class WorkHistoryService {
    /**
     * Get lịch sử công tác
     */
    async getByProfileId(profileId: ID) {
        return await profileSubRepo.getWorkHistory(profileId)
    }

    /**
     * Thêm lịch sử công tác
     */
    async create(data: any) {
        return await profileSubRepo.createWorkHistory(data)
    }

    /**
     * Cập nhật lịch sử công tác
     */
    async update(id: ID, data: any) {
        return await profileSubRepo.updateWorkHistory(id, data)
    }

    /**
     * Xóa lịch sử công tác
     */
    async delete(id: ID) {
        return await profileSubRepo.deleteWorkHistory(id)
    }
}

export const workHistoryService = new WorkHistoryService()
