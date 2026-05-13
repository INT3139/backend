import JSZip from "jszip"

type ParagraphStyle = "Normal" | "Title" | "Heading1" | "Heading2" | "Heading3"

interface TableOptions {
  widths?: number[]
  headerRow?: boolean
}

const XML_HEADER = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`

function escapeXml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function createTextRuns(text: string, bold = false): string {
  const safeText = String(text ?? "")

  if (!safeText) {
    return `<w:r><w:t xml:space="preserve"></w:t></w:r>`
  }

  return safeText
    .split("\n")
    .map((part, index) => {
      const runProps = bold ? "<w:rPr><w:b/></w:rPr>" : ""
      const textNode = `<w:t xml:space="preserve">${escapeXml(part)}</w:t>`
      const breakNode = index === 0 ? "" : "<w:r><w:br/></w:r>"
      return `${breakNode}<w:r>${runProps}${textNode}</w:r>`
    })
    .join("")
}

function createParagraph(text: string, style: ParagraphStyle = "Normal", bold = false): string {
  return [
    "<w:p>",
    `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>`,
    createTextRuns(text, bold),
    "</w:p>",
  ].join("")
}

function createCell(text: string, width?: number, bold = false): string {
  const widthXml = width ? `<w:tcW w:w="${width}" w:type="dxa"/>` : ""
  return [
    "<w:tc>",
    `<w:tcPr>${widthXml}<w:vAlign w:val="top"/></w:tcPr>`,
    createParagraph(text, "Normal", bold),
    "</w:tc>",
  ].join("")
}

function createTable(rows: string[][], options: TableOptions = {}): string {
  if (rows.length === 0) {
    return ""
  }

  const widths = options.widths ?? []
  const headerRow = options.headerRow ?? true
  const totalWidth =
    widths.length > 0 ? widths.reduce((sum, width) => sum + width, 0) : 9000

  const gridXml =
    widths.length > 0
      ? `<w:tblGrid>${widths.map((width) => `<w:gridCol w:w="${width}"/>`).join("")}</w:tblGrid>`
      : ""

  const rowsXml = rows
    .map((row, rowIndex) => {
      const cellsXml = row
        .map((cell, cellIndex) => createCell(cell, widths[cellIndex], headerRow && rowIndex === 0))
        .join("")

      return `<w:tr>${cellsXml}</w:tr>`
    })
    .join("")

  return [
    "<w:tbl>",
    `<w:tblPr>
      <w:tblW w:w="${totalWidth}" w:type="dxa"/>
      <w:tblBorders>
        <w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      </w:tblBorders>
      <w:tblLayout w:type="fixed"/>
    </w:tblPr>`,
    gridXml,
    rowsXml,
    "</w:tbl>",
  ].join("")
}

function buildDocumentXml(bodyXml: string): string {
  return `${XML_HEADER}
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/>
      <w:cols w:space="708"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>
  </w:body>
</w:document>`
}

function buildStylesXml(): string {
  return `${XML_HEADER}
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman"/>
        <w:sz w:val="24"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:jc w:val="center"/>
      <w:spacing w:after="160"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="32"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="Heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:spacing w:before="200" w:after="100"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="28"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="Heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:spacing w:before="120" w:after="80"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="26"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="Heading 3"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:spacing w:before="80" w:after="40"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="24"/>
    </w:rPr>
  </w:style>
</w:styles>`
}

function buildContentTypesXml(): string {
  return `${XML_HEADER}
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`
}

function buildRootRelsXml(): string {
  return `${XML_HEADER}
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`
}

function buildDocumentRelsXml(): string {
  return `${XML_HEADER}
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
}

function buildCoreXml(title: string): string {
  const now = new Date().toISOString()
  return `${XML_HEADER}
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${escapeXml(title)}</dc:title>
  <dc:creator>Codex</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
</cp:coreProperties>`
}

function buildAppXml(): string {
  return `${XML_HEADER}
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Codex</Application>
</Properties>`
}

export class SimpleDocxBuilder {
  private readonly blocks: string[] = []

  constructor(private readonly title: string) {}

  addTitle(text: string): this {
    this.blocks.push(createParagraph(text, "Title"))
    return this
  }

  addHeading(text: string, level: 1 | 2 | 3 = 1): this {
    const style: ParagraphStyle = level === 1 ? "Heading1" : level === 2 ? "Heading2" : "Heading3"
    this.blocks.push(createParagraph(text, style))
    return this
  }

  addParagraph(text: string, options: { bold?: boolean } = {}): this {
    this.blocks.push(createParagraph(text, "Normal", options.bold))
    return this
  }

  addTable(rows: string[][], options: TableOptions = {}): this {
    this.blocks.push(createTable(rows, options))
    return this
  }

  addSpacer(): this {
    this.blocks.push(createParagraph(""))
    return this
  }

  async build(): Promise<Buffer> {
    const zip = new JSZip()

    zip.file("[Content_Types].xml", buildContentTypesXml())
    zip.folder("_rels")?.file(".rels", buildRootRelsXml())
    zip.folder("docProps")?.file("core.xml", buildCoreXml(this.title))
    zip.folder("docProps")?.file("app.xml", buildAppXml())

    const wordFolder = zip.folder("word")
    wordFolder?.file("document.xml", buildDocumentXml(this.blocks.join("")))
    wordFolder?.file("styles.xml", buildStylesXml())
    wordFolder?.folder("_rels")?.file("document.xml.rels", buildDocumentRelsXml())

    return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })
  }
}
