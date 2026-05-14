import JSZip from "jszip"
import { profileExportService } from "@/services/profile-export.service"

describe("ProfileExportService", () => {
  const sampleProfile: any = {
    id: 101,
    userId: 501,
    user: {
      fullName: "Nguyen Van A",
      username: "nguyenvana",
      email: "a@example.com",
    },
    gender: "male",
    dateOfBirth: "1990-03-15",
    idNumber: "001090123456",
    ethnicity: "Kinh",
    religion: "Khong",
    nationality: "Viet Nam",
    maritalStatus: "married",
    emailVnu: "a@vnu.edu.vn",
    emailPersonal: "a@gmail.com",
    phoneWork: "0901000001",
    phoneHome: "0243000000",
    staffType: "Giang vien",
    employmentStatus: "active",
    profileStatus: "approved",
    academicDegree: "phd",
    academicTitle: "pgs",
    eduLevelGeneral: "12/12",
    politicalTheory: "cao cap",
    foreignLangLevel: "IELTS 7.0",
    itLevel: "Ung dung CNTT nang cao",
    joinDate: "2015-09-01",
    addrBirthplace: { province: "Ha Noi", district: "Cau Giay" },
    addrHometown: { province: "Nam Dinh", district: "Hai Hau" },
    addrPermanent: { detail: "So 1", ward: "Dich Vong", district: "Cau Giay", province: "Ha Noi" },
    addrCurrent: { detail: "So 99", ward: "Trung Hoa", district: "Cau Giay", province: "Ha Noi" },
    education: [
      {
        eduType: "degree",
        fromDate: "2012-09-01",
        toDate: "2016-06-01",
        institution: "UET",
        major: "Cong nghe thong tin",
        degreeLevel: "Cu nhan",
      },
    ],
    workHistory: [
      {
        fromDate: "2016-07-01",
        toDate: "2020-12-31",
        unitName: "Bo mon Khoa hoc may tinh",
        positionName: "Giang vien",
        historyType: "chinh_quyen",
      },
    ],
    family: [
      {
        side: "self",
        relationship: "Vo",
        fullName: "Tran Thi B",
        birthYear: 1992,
        description: "Ke toan",
      },
    ],
    positions: [
      {
        positionName: "Pho truong bo mon",
        positionType: "Quan ly",
        startDate: "2024-01-01",
        isPrimary: true,
      },
    ],
    healthRecords: {
      healthStatus: "Tot",
      heightCm: "170",
      weightKg: "65",
      bloodType: "O",
    },
    extraInfo: {
      incomeSalary: "180000000",
      incomeOtherSources: "20000000",
      houseTypeOwned: "Nha rieng",
      houseAreaOwned: "85",
      landPurchasedM2: "60",
    },
    salary: {
      occupationTitle: "Giang vien chinh",
      occupationCode: "V.07.01.03",
      salaryGrade: 3,
      salaryCoefficient: "4.98",
      effectiveDate: "2024-10-01",
      nextGradeDate: "2027-10-01",
      decisionNumber: "123/QD-UET",
    },
    rewards: {
      commendations: [
        {
          awardName: "Bang khen cap co so",
          awardLevel: "co_so",
          decisionDate: "2024-11-20",
        },
      ],
      titles: [
        {
          titleName: "Chien si thi dua",
          titleLevel: "unit",
          awardedYear: "2024",
        },
      ],
      discipline: [],
    },
    researchWorks: {
      data: [
        {
          workType: "journal_paper",
          title: "A study on AI for education",
          publishYear: 2024,
          journalName: "Journal of AI",
          indexing: "Scopus",
          doi: "10.1000/test",
          extra: {},
        },
        {
          workType: "research_project",
          title: "National education platform",
          publishYear: 2023,
          projectCode: "DT-01",
          extra: { host_org: "UET", level: "Cap truong" },
        },
      ],
    },
  }

  async function readDocumentXml(buffer: Buffer) {
    const zip = await JSZip.loadAsync(buffer)
    return zip.file("word/document.xml")?.async("string")
  }

  it("generates a 2C document with expected sections", async () => {
    const buffer = await profileExportService.export2C(sampleProfile)
    const documentXml = await readDocumentXml(buffer)

    expect(buffer.subarray(0, 2).toString()).toBe("PK")
    expect(documentXml).toContain("AUTO DATA WRAP")
    expect(documentXml).toContain("Nguyen Van A")
    expect(documentXml).toContain("Bang khen cap co so")
    expect(documentXml).not.toContain("{fullName}")
  })

  it("generates a scientific CV document with research details", async () => {
    const buffer = await profileExportService.exportScientific(sampleProfile)
    const documentXml = await readDocumentXml(buffer)

    expect(buffer.subarray(0, 2).toString()).toBe("PK")
    expect(documentXml).toContain("AUTO DATA WRAP")
    expect(documentXml).toContain("A study on AI for education")
    expect(documentXml).toContain("National education platform")
    expect(documentXml).not.toContain("{researchBlock}")
  })
})
