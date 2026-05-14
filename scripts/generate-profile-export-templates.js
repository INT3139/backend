const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function createParagraph(text, bold = false) {
  const runProps = bold ? "<w:rPr><w:b/></w:rPr>" : "";
  return [
    "<w:p>",
    "<w:pPr><w:spacing w:before=\"120\" w:after=\"80\"/></w:pPr>",
    `<w:r>${runProps}<w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`,
    "</w:p>",
  ].join("");
}

function appendBlock(documentXml, paragraphs) {
  const bodyClose = "</w:body>";
  const block = paragraphs.join("");
  if (!documentXml.includes(bodyClose)) {
    throw new Error("Invalid DOCX XML: missing </w:body>");
  }
  return documentXml.replace(bodyClose, `${block}${bodyClose}`);
}

async function generateTemplate(inputPath, outputPath, paragraphs) {
  const inputBuffer = fs.readFileSync(inputPath);
  const zip = await JSZip.loadAsync(inputBuffer);
  const documentFile = zip.file("word/document.xml");
  if (!documentFile) {
    throw new Error(`Missing word/document.xml in ${inputPath}`);
  }
  const documentXml = await documentFile.async("string");
  const nextXml = appendBlock(documentXml, paragraphs);
  zip.file("word/document.xml", nextXml);

  const outputBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, outputBuffer);
}

async function main() {
  const root = process.cwd();
  const publicDir = path.join(root, "src", "public");
  const exportDir = path.join(publicDir, "export");

  const commonParagraphs = [
    createParagraph(""),
    createParagraph("===== AUTO DATA WRAP =====", true),
    createParagraph("Ho va ten: {fullName}"),
    createParagraph("Ma ho so: {profileId}"),
    createParagraph("Ngay xuat: {exportDate}"),
    createParagraph("Gioi tinh: {gender}"),
    createParagraph("Ngay sinh: {dateOfBirth}"),
    createParagraph("So dinh danh: {idNumber}"),
    createParagraph("Noi sinh: {birthplace}"),
    createParagraph("Que quan: {hometown}"),
    createParagraph("Dan toc: {ethnicity}"),
    createParagraph("Ton giao: {religion}"),
    createParagraph("Quoc tich: {nationality}"),
    createParagraph("Tinh trang hon nhan: {maritalStatus}"),
    createParagraph("Email VNU: {emailVnu}"),
    createParagraph("Email ca nhan: {emailPersonal}"),
    createParagraph("Dien thoai co quan: {phoneWork}"),
    createParagraph("Dien thoai nha: {phoneHome}"),
    createParagraph("Ho khau thuong tru: {addrPermanent}"),
    createParagraph("Noi o hien tai: {addrCurrent}"),
    createParagraph("Ngay vao truong: {joinDate}"),
    createParagraph("Loai nhan su: {staffType}"),
    createParagraph("Trang thai cong tac: {employmentStatus}"),
    createParagraph("Trang thai ho so: {profileStatus}"),
    createParagraph("Hoc vi: {academicDegree}"),
    createParagraph("Hoc ham: {academicTitle}"),
    createParagraph("Hoc van pho thong: {eduLevelGeneral}"),
    createParagraph("Ly luan chinh tri: {politicalTheory}"),
    createParagraph("Quan ly nha nuoc: {stateManagement}"),
    createParagraph("Ngoai ngu: {foreignLangLevel}"),
    createParagraph("Tin hoc: {itLevel}"),
    createParagraph("Bi danh: {nickName}"),
    createParagraph(""),
    createParagraph("[Qua trinh dao tao]", true),
    createParagraph("{educationBlock}"),
    createParagraph(""),
    createParagraph("[Qua trinh cong tac]", true),
    createParagraph("{workHistoryBlock}"),
    createParagraph(""),
    createParagraph("[Chuc vu dam nhiem]", true),
    createParagraph("{positionsBlock}"),
    createParagraph(""),
    createParagraph("[Quan he gia dinh]", true),
    createParagraph("{familyBlock}"),
    createParagraph(""),
    createParagraph("[Luong va suc khoe]", true),
    createParagraph("{salaryBlock}"),
    createParagraph("{healthBlock}"),
    createParagraph("{extraInfoBlock}"),
    createParagraph(""),
    createParagraph("[Khen thuong / Ky luat]", true),
    createParagraph("{rewardBlock}"),
    createParagraph(""),
    createParagraph("[Tong hop nghien cuu]", true),
    createParagraph("{researchSummaryBlock}"),
    createParagraph(""),
    createParagraph("[Danh muc nghien cuu chi tiet]", true),
    createParagraph("{researchBlock}"),
    createParagraph(""),
    createParagraph("[Qua trinh luong]", true),
    createParagraph("{salaryHistoryBlock}"),
  ];

  await generateTemplate(
    path.join(publicDir, "2C.docx"),
    path.join(exportDir, "2C.template.docx"),
    commonParagraphs
  );

  await generateTemplate(
    path.join(publicDir, "Ly_lich_khoa_hoc.docx"),
    path.join(exportDir, "Ly_lich_khoa_hoc.template.docx"),
    commonParagraphs
  );

  console.log("Generated export templates in src/public/export");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
