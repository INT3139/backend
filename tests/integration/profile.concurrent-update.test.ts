import request from "supertest"
import { and, eq, inArray } from "drizzle-orm"
import { createApp } from "@/app"
import { db } from "@/configs/db"
import {
  organizationalUnits,
  permissions,
  profileStaff,
  resourceScopes,
  rolePermissions,
  roles,
  userRoles,
  users,
  wfDefinitions,
  wfInstances,
} from "@/db/schema"
import { issueTokenPair } from "@/core/auth/jwt"
import { TestDbHelper } from "../helpers/testHelpers"
import { PERM } from "@/constants/permission"

const app = createApp()

describe("Profile Concurrent Update Integration", () => {
  beforeEach(async () => {
    await TestDbHelper.clearAllTables()
  })

  it("merges concurrent valid updates into one active workflow and returns 403 for role without write", async () => {
    const [school] = await db.insert(organizationalUnits).values({
      code: "VNU",
      name: "VNU",
      unitType: "school",
    }).returning()

    const [faculty] = await db.insert(organizationalUnits).values({
      code: "UET",
      name: "University of Engineering and Technology",
      unitType: "faculty",
      parentId: school.id,
    }).returning()

    const [department] = await db.insert(organizationalUnits).values({
      code: "SOICT",
      name: "School of Information and Communication Technology",
      unitType: "department",
      parentId: faculty.id,
    }).returning()

    await db.insert(permissions).values({
      code: PERM.PROFILE.WRITE,
      description: "Profile write",
      isActive: true,
    }).onConflictDoNothing()

    const insertedRoles = await db.insert(roles).values([
      { code: "lecturer", name: "Lecturer" },
      { code: "cv_hrm", name: "CV HRM" },
      { code: "faculty_leader", name: "Faculty Leader" },
    ]).onConflictDoNothing().returning()

    const roleMap = new Map(insertedRoles.map((r) => [r.code, r.id]))
    if (roleMap.size < 3) {
      const existing = await db.select().from(roles).where(inArray(roles.code, ["lecturer", "cv_hrm", "faculty_leader"]))
      existing.forEach((r) => roleMap.set(r.code, r.id))
    }

    await db.insert(rolePermissions).values([
      { roleId: roleMap.get("lecturer")!, permissionCode: PERM.PROFILE.WRITE },
      { roleId: roleMap.get("cv_hrm")!, permissionCode: PERM.PROFILE.WRITE },
    ]).onConflictDoNothing()

    const createdUsers = await db.insert(users).values([
      {
        username: "owner_user",
        email: "owner_user@test.local",
        fullName: "Owner User",
        passwordHash: "hash",
        isActive: true,
        unitId: department.id,
      },
      {
        username: "lecturer_a",
        email: "lecturer_a@test.local",
        fullName: "Lecturer A",
        passwordHash: "hash",
        isActive: true,
        unitId: department.id,
      },
      {
        username: "lecturer_b",
        email: "lecturer_b@test.local",
        fullName: "Lecturer B",
        passwordHash: "hash",
        isActive: true,
        unitId: department.id,
      },
      {
        username: "cv_hrm_a",
        email: "cv_hrm_a@test.local",
        fullName: "CV HRM A",
        passwordHash: "hash",
        isActive: true,
        unitId: faculty.id,
      },
      {
        username: "faculty_leader_a",
        email: "faculty_leader_a@test.local",
        fullName: "Faculty Leader A",
        passwordHash: "hash",
        isActive: true,
        unitId: faculty.id,
      },
    ]).returning()

    const userByUsername = new Map(createdUsers.map((u) => [u.username, u]))
    const owner = userByUsername.get("owner_user")!
    const lecturerA = userByUsername.get("lecturer_a")!
    const lecturerB = userByUsername.get("lecturer_b")!
    const cvHrmA = userByUsername.get("cv_hrm_a")!
    const facultyLeaderA = userByUsername.get("faculty_leader_a")!

    await db.insert(userRoles).values([
      {
        userId: lecturerA.id,
        roleId: roleMap.get("lecturer")!,
        scopeType: "department",
        scopeUnitId: department.id,
        grantedBy: owner.id,
      },
      {
        userId: lecturerB.id,
        roleId: roleMap.get("lecturer")!,
        scopeType: "department",
        scopeUnitId: department.id,
        grantedBy: owner.id,
      },
      {
        userId: cvHrmA.id,
        roleId: roleMap.get("cv_hrm")!,
        scopeType: "faculty",
        scopeUnitId: faculty.id,
        grantedBy: owner.id,
      },
      {
        userId: facultyLeaderA.id,
        roleId: roleMap.get("faculty_leader")!,
        scopeType: "faculty",
        scopeUnitId: faculty.id,
        grantedBy: owner.id,
      },
    ])

    const [profile] = await db.insert(profileStaff).values({
      userId: owner.id,
      unitId: department.id,
      emailVnu: "owner@vnu.edu.vn",
      staffType: "lecturer",
      employmentStatus: "active",
      profileStatus: "approved",
    }).returning()

    await db.insert(resourceScopes).values({
      resourceType: "profile",
      resourceId: profile.id,
      ownerId: owner.id,
      unitId: department.id,
    })

    await db.insert(wfDefinitions).values({
      code: "profile_update",
      name: "Profile Update Workflow",
      module: "profile",
      steps: [
        { step: 1, name: "Khoi tao", role_id: null, action_type: "forward", required: true },
        { step: 2, name: "Duyet", role_id: null, action_type: "approve", required: true },
      ],
      isActive: true,
    })

    const tokenOf = (user: any) =>
      issueTokenPair({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        unitId: user.unitId,
      }).accessToken

    const requests = [
      request(app)
        .put(`/api/v1/profiles/${profile.id}`)
        .set("Authorization", `Bearer ${tokenOf(lecturerA)}`)
        .send({ note: "note from lecturer A" }),
      request(app)
        .put(`/api/v1/profiles/${profile.id}`)
        .set("Authorization", `Bearer ${tokenOf(lecturerB)}`)
        .send({ origin: "origin from lecturer B" }),
      request(app)
        .put(`/api/v1/profiles/${profile.id}`)
        .set("Authorization", `Bearer ${tokenOf(cvHrmA)}`)
        .send({ nickName: "nick from cv hrm" }),
      request(app)
        .put(`/api/v1/profiles/${profile.id}`)
        .set("Authorization", `Bearer ${tokenOf(facultyLeaderA)}`)
        .send({ religion: "religion from faculty leader" }),
    ]

    const responses = await Promise.all(requests)
    const statuses = responses.map((r) => r.status)
    const successResponses = responses.filter((r) => r.status === 200)
    const forbiddenResponses = responses.filter((r) => r.status === 403)

    expect(statuses).toContain(200)
    expect(statuses).toContain(403)
    expect(successResponses.length).toBe(3)
    expect(forbiddenResponses.length).toBe(1)
    successResponses.forEach((res) => {
      expect(res.body.data.workflowId).toBeDefined()
    })

    const activeWorkflows = await db.select().from(wfInstances).where(and(
      eq(wfInstances.resourceType, "profile"),
      eq(wfInstances.resourceId, profile.id),
      inArray(wfInstances.status, ["pending", "in_progress"]),
    ))

    expect(activeWorkflows).toHaveLength(1)
    const workflow = activeWorkflows[0] as any
    expect(workflow.metadata.main.note).toBe("note from lecturer A")
    expect(workflow.metadata.main.origin).toBe("origin from lecturer B")
    expect(workflow.metadata.main.nickName).toBe("nick from cv hrm")
    expect(workflow.metadata.main.religion).toBeUndefined()

    const [latestProfile] = await db.select().from(profileStaff).where(eq(profileStaff.id, profile.id))
    expect(latestProfile.profileStatus).toBe("pending")
  })
})
