import { profileSubRepo } from "../profileSub.repo"
import { ID } from "@/types"

export class ExtraService {
    /**
     * Get thông tin bổ sung
     */
    async getByProfileId(profileId: ID) {
        return await profileSubRepo.getExtraInfo(profileId)
    }

    /**
     * Cập nhật thông tin bổ sung (upsert)
     */
    async update(profileId: ID, data: any) {
        return await profileSubRepo.upsertExtraInfo(profileId, data)
    }
}

export const extraService = new ExtraService()
