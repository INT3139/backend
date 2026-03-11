import { profileSubRepo } from "../profileSub.repo"
import { UUID } from "@/types"

export class HealthService {
    /**
     * Get hồ sơ sức khỏe
     */
    async getByProfileId(profileId: UUID) {
        return await profileSubRepo.getHealthRecords(profileId)
    }

    /**
     * Cập nhật hồ sơ sức khỏe (upsert)
     */
    async update(profileId: UUID, data: any) {
        return await profileSubRepo.upsertHealthRecords(profileId, data)
    }
}

export const healthService = new HealthService()
