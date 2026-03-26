import fs from 'fs-extra';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import z from 'zod';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

dayjs.extend(customParseFormat);

const execFileAsync = promisify(execFile);

// Định dạng ngày tháng chuẩn Việt Nam DD/MM/YYYY
const dateVietnamSchema = z.string().refine((val) => {
    const date = dayjs(val, ['DD/MM/YYYY', 'YYYY-MM-DD'], true);
    return date.isValid();
}, "Ngày tháng phải theo định dạng DD/MM/YYYY hoặc YYYY-MM-DD");

// Mục 30a: Quan hệ gia đình (Bố, mẹ, vợ chồng, con, anh chị em)
const familyMemberSchema = z.object({
    quanHe: z.string().min(1, "Quan hệ không được để trống (Ví dụ: Bố, Mẹ)"),
    hoTen: z.string().min(1, "Họ tên không được để trống"),
    namSinh: z.string().optional(),
    queQuanNgheNghiep: z.string().optional(),
});

// Mục 27: Quá trình công tác
const workHistorySchema = z.object({
    thoiGian: z.string().min(1, "Thời gian không được để trống"),
    chucDanhDonVi: z.string().min(1, "Chức danh đơn vị không được để trống"),
});

// Mục 26: Đào tạo
const educationSchema = z.object({
    tenTruong: z.string().optional(),
    nganhHoc: z.string().optional(),
    thoiGianHoc: z.string().optional(),
    hinhThucHoc: z.string().optional(),
    vanBang: z.string().optional(),
});

// Schema chính cho toàn bộ Lý lịch 2C
export const LyLich2CSchema = z.object({
    // Thông tin chung
    tinh: z.string().optional(),
    boPhan: z.string().optional(),
    donViTrucThuoc: z.string().optional(),
    donViCoSo: z.string().optional(),
    soHieuCanBo: z.string().optional(),

    // 1) Họ tên
    hoTen: z.string().min(1, "Họ và tên khai sinh là bắt buộc"),
    gioiTinh: z.enum(["Nam", "Nữ"]),

    // 2) Tên gọi khác
    tenGoiKhac: z.string().optional(),

    // 3) Cấp ủy, Chức vụ
    capUyHienTai: z.string().optional(),
    chucVu: z.string().optional(),
    phuCapChucVu: z.string().optional(),

    // 4) Ngày sinh
    ngaySinh: dateVietnamSchema,

    // 5) Nơi sinh
    noiSinh: z.string().optional(),

    // 6) Quê quán
    queQuan: z.object({
        xaPhuong: z.string().optional(),
        huyenQuan: z.string().optional(),
        tinhTP: z.string().optional(),
    }),

    // 7) Nơi ở hiện nay & Hộ khẩu
    noiOHienNay: z.string().optional(),
    dienThoai: z.string().optional(),
    hoKhauThuongTru: z.string().optional(),

    // 8) Dân tộc, 9) Tôn giáo
    danToc: z.string().optional(),
    tonGiao: z.string().optional(),

    // 10) Thành phần gia đình
    thanhPhanGiaDinh: z.string().optional(),

    // 11) Nghề nghiệp trước khi tuyển dụng
    ngheNghiepBanThan: z.string().optional(),

    // 12) Ngày tuyển dụng
    ngayTuyenDung: dateVietnamSchema.optional(),
    coQuanTuyenDung: z.string().optional(),

    // 13) Ngày vào cơ quan hiện tại
    ngayVaoCoQuanHienTai: dateVietnamSchema.optional(),
    ngayThamGiaCachMang: dateVietnamSchema.optional(),

    // 14) Đảng viên
    ngayVaoDang: dateVietnamSchema.optional(),
    ngayChinhThuc: dateVietnamSchema.optional(),

    // 15) Tổ chức chính trị xã hội
    ngayThamGiaToChuc: z.string().optional(),

    // 16) Quân sự
    ngayNhapNgu: dateVietnamSchema.optional(),
    ngayXuatNgu: dateVietnamSchema.optional(),
    quanHamChucVu: z.string().optional(),

    // 17) Học vấn
    trinhDoPhoThong: z.string().optional(),
    hocHamHocVi: z.string().optional(),
    lyLuanChinhTri: z.string().optional(),
    ngoaiNgu: z.string().optional(),

    // 18) Công tác đang làm
    congTacChinh: z.string().optional(),

    // 19) Ngạch công chức
    ngachCongChuc: z.string().optional(),
    maSo: z.string().optional(),
    bacLuong: z.string().optional(),
    heSoLuong: z.string().optional(),

    // 20) Danh hiệu
    danhHieu: z.string().optional(),

    // 21) Sở trường
    soTruong: z.string().optional(),
    congViecLauNhat: z.string().optional(),

    // 22) Khen thưởng
    khenThuong: z.string().optional(),

    // 23) Kỷ luật
    kyLuat: z.string().optional(),

    // 24) Sức khỏe
    tinhTrangSucKhoe: z.string().optional(),
    chieuCao: z.string().optional(),
    canNang: z.string().optional(),
    nhomMau: z.string().optional(),

    // 25) CMND
    soCMND: z.string().optional(),
    thuongBinhLoai: z.string().optional(),
    giaDinhLietSi: z.string().optional(),

    // 26) Đào tạo (Mảng)
    daoTao: z.array(educationSchema).optional(),

    // 27) Quá trình công tác (Mảng - Bắt buộc có dữ liệu)
    quaTrinhCongTac: z.array(workHistorySchema).min(1, "Phải có ít nhất một quá trình công tác"),

    // 28) Đặc điểm lịch sử
    dacDiemLichSu: z.string().optional(),
    lamViecCheDoCu: z.string().optional(),

    // 29) Quan hệ nước ngoài
    quanHeNuocNgoai: z.string().optional(),
    thanNhanNuocNgoai: z.string().optional(),

    // 30) Quan hệ gia đình (Bắt buộc kiểm tra logic Bố/Mẹ)
    quanHeGiaDinh: z.object({
        banThan: z.array(familyMemberSchema), // Bố, mẹ, vợ, con...
        benVoChong: z.array(familyMemberSchema).optional(), // Bố mẹ vợ/chồng
    }),

    // 31) Hoàn cảnh kinh tế
    quaTrinhLuong: z.array(z.object({
        thangNam: z.string(),
        ngachBac: z.string(),
        heSo: z.string()
    })).optional(),
    nguonThuNhap: z.string().optional(),
    nhaO: z.string().optional(),
    datO: z.string().optional(),

    // Ảnh 4x6 (Path hoặc Buffer)
    anhDaiDien: z.string().optional(), // Đường dẫn file ảnh
});

export type LyLich2CData = z.infer<typeof LyLich2CSchema>;

export class ExportService {
    private templatePath: string;
    private outputDir: string;

    constructor() {
        this.templatePath = path.join(__dirname, "../public/2C.docx")
        this.outputDir = path.join(__dirname, '../public/export');
    }

    private normalizeData(data: any): LyLich2CData {
        const normalizeDate = (dateStr: string | undefined) => {
            if (!dateStr) return "";
            const d = dayjs(dateStr, ['DD/MM/YYYY', 'YYYY-MM-DD'], true);
            return d.isValid() ? d.format('DD/MM/YYYY') : dateStr;
        };

        return {
            ...data,
            ngaySinh: normalizeDate(data.ngaySinh),
            ngayTuyenDung: normalizeDate(data.ngayTuyenDung),
            ngayVaoCoQuanHienTai: normalizeDate(data.ngayVaoCoQuanHienTai),
            ngayThamGiaCachMang: normalizeDate(data.ngayThamGiaCachMang),
            ngayVaoDang: normalizeDate(data.ngayVaoDang),
            ngayChinhThuc: normalizeDate(data.ngayChinhThuc),
            ngayNhapNgu: normalizeDate(data.ngayNhapNgu),
            ngayXuatNgu: normalizeDate(data.ngayXuatNgu),
            // Xử lý mảng ngày tháng nếu có (ví dụ trong quá trình công tác)
            quaTrinhCongTac: data.quaTrinhCongTac?.map((item: any) => ({
                ...item,
                // Nếu có trường ngày cụ thể trong mảng thì chuẩn hóa ở đây
            })),
        };
    }

    /**
     * Kiểm tra logic nghiệp vụ đặc thù (Ví dụ: Mục 30 phải có Bố và Mẹ)
     */
    private validateBusinessLogic(data: LyLich2CData) {
        const errors: string[] = [];

        // Kiểm tra Mục 30a: Bắt buộc có Bố và Mẹ
        const listBanThan = data.quanHeGiaDinh?.banThan || [];
        const hasBo = listBanThan.some(p => p.quanHe.toLowerCase().includes('bố') || p.quanHe.toLowerCase().includes('cha'));
        const hasMe = listBanThan.some(p => p.quanHe.toLowerCase().includes('mẹ') || p.quanHe.toLowerCase().includes('mẹ'));

        if (!hasBo) errors.push("Thiếu thông tin Bố (hoặc Cha) trong mục Quan hệ gia đình.");
        if (!hasMe) errors.push("Thiếu thông tin Mẹ trong mục Quan hệ gia đình.");

        if (errors.length > 0) {
            throw new Error(`Lỗi dữ liệu lý lịch 2C: ${errors.join(" ")}`);
        }
    }

    /**
     * Tạo file Word (.docx) từ template và dữ liệu
     */
    async generateWord(data: LyLich2CData, fileName: string): Promise<string> {
        // 1. Validate & Normalize
        const parsedData = LyLich2CSchema.parse(data);
        this.validateBusinessLogic(parsedData);
        const normalizedData = this.normalizeData(parsedData);

        // 2. Đọc Template
        if (!fs.existsSync(this.templatePath)) {
            throw new Error(`Không tìm thấy file template: ${this.templatePath}`);
        }
        const content = fs.readFileSync(this.templatePath, 'binary');
        const zip = new PizZip(content);

        // 3. Cấu hình Image Module (Cho ảnh 4x6)
        let imageModule = undefined;
        // if (normalizedData.anhDaiDien && fs.existsSync(normalizedData.anhDaiDien)) {
        //     imageModule = new ImageModule({
        //         centered: false,
        //         getImage: (buffer: any) => buffer,
        //         getSize: (img: any, token: any, part: any) => {
        //             // Kích thước ảnh 4x6 cm quy đổi sang pixel (tương đối)
        //             // Hoặc đọc kích thước thực từ ảnh
        //             return [150, 200];
        //         },
        //     });
        // }

        // 4. Khởi tạo Docxtemplater
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            modules: imageModule ? [imageModule] : [],
        });

        // 5. Render dữ liệu
        try {
            doc.render(normalizedData);
        } catch (error: any) {
            if (error.properties && error.properties.errors instanceof Array) {
                const errorMessages = error.properties.errors.map((e: any) => e.properties.explanation).join("\n");
                throw new Error(`Lỗi render template: ${errorMessages}`);
            }
            throw error;
        }

        // 6. Lưu file
        const buf = doc.getZip().generate({ type: 'nodebuffer' });
        const outputPath = path.join(this.outputDir, `${fileName}.docx`);

        await fs.ensureDir(this.outputDir);
        fs.writeFileSync(outputPath, buf);

        return outputPath;
    }

    /**
     * Chuyển đổi file Word sang PDF sử dụng LibreOffice
     */
    async convertToPDF(docxPath: string): Promise<string> {
        const outputDir = path.dirname(docxPath);

        // Command có thể thay đổi tùy hệ điều hành (libreoffice hoặc soffice)
        const command = process.platform === 'win32' ? 'soffice' : 'libreoffice';

        try {
            await execFileAsync(command, [
                '--headless',
                '--convert-to', 'pdf',
                '--outdir', outputDir,
                docxPath
            ]);

            const pdfPath = path.join(outputDir, path.basename(docxPath, '.docx') + '.pdf');

            // Kiểm tra file PDF đã được tạo chưa
            if (!fs.existsSync(pdfPath)) {
                throw new Error("LibreOffice đã chạy nhưng không tạo ra file PDF.");
            }

            return pdfPath;
        } catch (error: any) {
            throw new Error(`Lỗi chuyển đổi sang PDF: ${error.message}. Đảm bảo đã cài đặt LibreOffice.`);
        }
    }

    /**
     * Hàm chính: Tạo cả Word và PDF
     */
    async generateLyLich2C(data: LyLich2CData, fileName: string): Promise<{ word: string, pdf: string }> {
        try {
            // Bước 1: Tạo Word
            const wordPath = await this.generateWord(data, fileName);
            console.log(`Đã tạo file Word: ${wordPath}`);

            // Bước 2: Chuyển sang PDF
            const pdfPath = await this.convertToPDF(wordPath);
            console.log(`Đã tạo file PDF: ${pdfPath}`);

            return {
                word: wordPath,
                pdf: pdfPath
            };
        } catch (error: any) {
            console.error("Lỗi trong quá trình xuất lý lịch:", error.message);
            throw error;
        }
    }
}
