import { profileSubRepo } from "../profileSub.repo"
import { UUID } from "@/types"

export class ExtraService {
    /**
     * Get thông tin bổ sung
     */
    async getByProfileId(profileId: UUID) {
        return await profileSubRepo.getExtraInfo(profileId)
    }

    /**
     * Cập nhật thông tin bổ sung (upsert)
     */
    async update(profileId: UUID, data: any) {
        return await profileSubRepo.upsertExtraInfo(profileId, data)
    }
}

export const extraService = new ExtraService()
