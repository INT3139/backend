import { profileSubRepo } from "../profileSub.repo"
import { ID } from "@/types"

export class EducationService {
    /**
     * Get danh sách quá trình đào tạo của cán bộ
     */
    async getByProfileId(profileId: ID) {
        return await profileSubRepo.getEducation(profileId)
    }

    /**
     * Thêm quá trình đào tạo
     */
    async create(data: any) {
        return await profileSubRepo.createEducation(data)
    }

    /**
     * Xóa quá trình đào tạo
     */
    async delete(id: ID) {
        return await profileSubRepo.deleteEducation(id)
    }
}

export const educationService = new EducationService()
