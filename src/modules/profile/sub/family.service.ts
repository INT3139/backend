import { profileSubRepo } from "../profileSub.repo"
import { UUID } from "@/types"

export class FamilyService {
    /**
     * Get quan hệ gia đình
     */
    async getByProfileId(profileId: UUID) {
        return await profileSubRepo.getFamily(profileId)
    }

    /**
     * Thêm quan hệ gia đình
     */
    async create(data: any) {
        return await profileSubRepo.createFamily(data)
    }

    /**
     * Xóa quan hệ gia đình
     */
    async delete(id: UUID) {
        return await profileSubRepo.deleteFamily(id)
    }
}

export const familyService = new FamilyService()
