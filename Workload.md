# Module Workload - Quản lý Khối lượng công việc

## 1. Tổng quan
Module `workload` chịu trách nhiệm quản lý định mức (quotas) và khối lượng công việc thực tế (actual hours) của giảng viên tại UET. Hệ thống theo dõi ba mảng chính: Giảng dạy (Teaching), Nghiên cứu khoa học (Research), và các Nhiệm vụ khác (Other tasks).

## 2. Kiến trúc Dữ liệu
Module này tương tác với 3 bảng chính trong cơ sở dữ liệu:
- **`workload_individual_quotas`**: Lưu trữ định mức giờ công việc được giao cho từng giảng viên theo từng năm học.
- **`workload_annual_summaries`**: Bảng tổng kết tổng số giờ thực tế đã thực hiện so với định mức.
- **`workload_evidences`**: Các minh chứng cụ thể (bài báo, giờ dạy, đề tài...) do giảng viên nộp để được ghi nhận khối lượng.

## 3. Luồng hoạt động chính

### 3.1. Đối với Giảng viên (User)
1. **Xem thông tin cá nhân**: Giảng viên truy cập để xem định mức năm học hiện tại, tổng số giờ đã thực hiện và danh sách minh chứng của mình.
2. **Nộp minh chứng**: Khi hoàn thành một công việc (ví dụ: xuất bản bài báo), giảng viên tạo một "Evidence". 
   - Trạng thái mặc định là `pending`.
   - Hệ thống sử dụng **ABAC** để đăng ký quyền sở hữu (ownership) giúp giảng viên có thể xem/sửa minh chứng của chính mình.

### 3.2. Đối với Quản lý/Admin (Reviewer)
1. **Duyệt minh chứng**: Người quản lý cấp khoa/bộ môn xem danh sách các minh chứng `pending` thuộc đơn vị mình quản lý.
2. **Quyết định**: 
   - **Approve**: Minh chứng được chấp nhận. (Lưu ý: Logic cộng dồn giờ vào bảng `Summary` thường được xử lý sau bước này).
   - **Reject**: Từ chối minh chứng và bắt buộc phải nhập lý do từ chối (`reject_reason`).
3. **Theo dõi tổng thể**: Xem bảng tổng kết (`Summaries`) của toàn bộ nhân viên trong đơn vị để biết ai thiếu/đủ giờ.

## 4. Danh sách API (`/api/v1/workload`)

| Method | Endpoint | Quyền (Permission) | Mô tả mục đích |
|:--- |:--- |:--- |:--- |
| **GET** | `/me` | `WORKLOAD.SELF_READ` | Lấy toàn bộ thông tin workload của bản thân: định mức, tổng kết và danh sách minh chứng. |
| **POST** | `/evidences` | `WORKLOAD.WRITE` | Giảng viên nộp một minh chứng mới. Yêu cầu: năm học, loại minh chứng, tiêu đề, số giờ dự kiến. |
| **GET** | `/evidences` | `WORKLOAD.READ` | Quản lý xem danh sách minh chứng cần duyệt. Hỗ trợ lọc theo `unitId`, `status`, `academicYear`. |
| **POST** | `/evidences/:id/approve`| `WORKLOAD.APPROVE` | Chấp nhận minh chứng. Chỉ người có quyền quản lý đơn vị chứa minh chứng đó mới được thực hiện. |
| **POST** | `/evidences/:id/reject` | `WORKLOAD.APPROVE` | Từ chối minh chứng. Yêu cầu gửi kèm `reject_reason` trong body. |
| **GET** | `/summaries` | `WORKLOAD.READ` | Xem danh sách tổng kết khối lượng (summary) của nhân viên trong tầm quản lý. |

## 5. Các điểm kỹ thuật đáng chú ý

- **Phân quyền ABAC**: Module này tích hợp sâu với `abacService`. Khi giảng viên nộp minh chứng, một "scope" được đăng ký để đảm bảo tính riêng tư và phân quyền theo đơn vị (Unit-based access control).
- **Validation**: Sử dụng `Zod` để validate dữ liệu đầu vào (ví dụ: `academic_year` phải đúng định dạng `YYYY-YYYY`).
- **Audit Log**: Mọi hành động thay đổi dữ liệu (tạo mới, duyệt, từ chối) đều được ghi lại vào nhật ký hệ thống (`logAction`) để theo dõi ai đã thực hiện thay đổi.
- **Drizzle ORM**: Sử dụng `workloadRepo` để thực hiện các truy vấn phức tạp, join giữa bảng `profile` và `workload` để lọc dữ liệu theo đơn vị công tác.

## 6. Quy ước chuyển đổi dữ liệu
- **Request (Client)**: Sử dụng `snake_case` (ví dụ: `hours_claimed`, `evidence_type`).
- **Internal/Database**: Chuyển đổi sang `camelCase` (ví dụ: `hoursClaimed`, `evidenceType`) trong lớp Service trước khi gọi Repository.
