import { profileSubRepo } from "../profileSub.repo"
import { ID } from "@/types"

export class HealthService {
    /**
     * Get hồ sơ sức khỏe
     */
    async getByProfileId(profileId: ID) {
        return await profileSubRepo.getHealthRecords(profileId)
    }

    /**
     * Cập nhật hồ sơ sức khỏe (upsert)
     */
    async update(profileId: ID, data: any) {
        return await profileSubRepo.upsertHealthRecords(profileId, data)
    }
}

export const healthService = new HealthService()
