import { profileSubRepo } from "../profileSub.repo"
import { ID } from "@/types"

export class FamilyService {
    /**
     * Get quan hệ gia đình
     */
    async getByProfileId(profileId: ID) {
        return await profileSubRepo.getFamily(profileId)
    }

    /**
     * Thêm quan hệ gia đình
     */
    async create(data: any) {
        return await profileSubRepo.createFamily(data)
    }

    /**
     * Cập nhật quan hệ gia đình
     */
    async update(id: ID, data: any) {
        return await profileSubRepo.updateFamily(id, data)
    }

    /**
     * Xóa quan hệ gia đình
     */
    async delete(id: ID) {
        return await profileSubRepo.deleteFamily(id)
    }
}

export const familyService = new FamilyService()
