# 📄 Technical Documentation: Workflow & Profile Management System

## 1. Overview
Hệ thống quản lý quy trình phê duyệt (Workflow) được thiết kế để kiểm soát mọi thay đổi dữ liệu nhạy cảm trên hồ sơ giảng viên. Thay vì cập nhật trực tiếp vào cơ sở dữ liệu chính, các thay đổi được "đóng gói" vào Metadata và trải qua các bước phê duyệt của Admin/Phòng ban.

---

## 2. Workflow Engine (Core Module)

Nằm tại `src/core/workflow/`, đây là bộ máy thực thi các quy trình nghiệp vụ.

### 2.1. Cấu trúc dữ liệu chính
*   **`wf_definitions`**: Định nghĩa các loại quy trình (ví dụ: `PROFILE_UPDATE`). Chứa danh sách các bước (`steps`) và Role ID có quyền xử lý từng bước.
*   **`wf_instances`**: Một phiên chạy cụ thể của quy trình cho một tài nguyên (Resource).
    *   `status`: `pending`, `in_progress`, `approved`, `rejected`, `cancelled`.
    *   `metadata`: Chứa toàn bộ dữ liệu thay đổi dưới dạng JSONB.
*   **`wf_step_logs`**: Nhật ký chi tiết từng hành động (Ai làm, lúc nào, hành động gì, lời nhắn).

### 2.2. Các hành động cốt lõi (Core Actions)
*   **`initiate`**: Khởi tạo quy trình. Tự động chuyển sang bước 2 sau khi người dùng gửi yêu cầu.
*   **`advance`**: Chuyển bước quy trình.
    *   `approve`: Chuyển sang bước kế tiếp hoặc kết thúc (Approved).
    *   `reject`: Kết thúc quy trình ngay lập tức (Rejected), không áp dụng thay đổi.
    *   `request_revision`: **(New)** Đưa quy trình quay lại bước 1 cho người khởi tạo. Trạng thái hồ sơ chuyển về `draft` để cho phép sửa đổi.
*   **`dispatchWorkflowResult`**: Tự động gọi các Handler đăng ký theo `resourceType` khi quy trình kết thúc hoặc có yêu cầu sửa đổi.

---

## 3. Profile Workflow Integration (Module)

Nằm tại `src/modules/profile/`, tích hợp Workflow vào nghiệp vụ quản lý hồ sơ.

### 3.1. Cơ chế Metadata Batching (Atomic Merge)
Để tránh việc Admin phải duyệt quá nhiều yêu cầu lẻ tẻ, hệ thống sử dụng cơ chế gộp thay đổi:
*   Sử dụng toán tử `||` của PostgreSQL để gộp JSONB Metadata.
*   **Key Mapping**:
    *   `main`: Thay đổi thông tin chung (bảng `profile_staff`).
    *   `sub_{type}_{id}`: Thay đổi các bảng phụ (Education, Family, WorkHistory...). Ví dụ: `sub_family_10`.
*   **Ưu điểm**: Giảng viên có thể sửa nhiều tab khác nhau và tất cả sẽ nằm trong **duy nhất một Workflow** đang chờ duyệt.

### 3.2. Trạng thái hồ sơ (Profile Status)
Hệ thống điều phối trạng thái của `profile_staff` nhịp nhàng với Workflow:
*   `approved`: Hồ sơ đang hoạt động bình thường.
*   `pending`: Đang có một Workflow chờ duyệt. Mọi thay đổi mới sẽ được gộp vào Metadata của Workflow này thay vì tạo cái mới.
*   `draft`: Hồ sơ bị trả về yêu cầu sửa đổi (`request_revision`). Giảng viên có quyền sửa và gửi lại.

### 3.3. Áp dụng thay đổi (Apply Changes)
Khi Admin nhấn **Approve** bước cuối cùng:
1.  Hệ thống quét toàn bộ `metadata`.
2.  Cập nhật `profile_staff` với dữ liệu từ key `main`.
3.  Cập nhật/Thêm mới/Xóa các bảng phụ từ các key `sub_`.
4.  **Đồng bộ cột Status**: Với các bảng có cột `status` (Family, Research, WorkHistory), hệ thống sẽ:
    *   Set `status = 'approved'`.
    *   Ghi nhận `approved_by` hoặc `verified_by` là ID của Admin vừa thực hiện bước cuối.
5.  Xóa Cache Redis để đảm bảo dữ liệu mới nhất được hiển thị.

---

## 4. API Reference (Workflow Operations)

### 4.1. Xem danh sách việc cần làm
*   **Endpoint**: `GET /api/v1/profile/tasks`
*   **Logic**: Trả về các Workflow mà người dùng hiện tại có Role trùng với `role_id` của bước hiện tại.

### 4.2. Xử lý một bước (Approve/Reject/Revision)
*   **Endpoint**: `POST /api/v1/profile/tasks/:instanceId`
*   **Body**:
    ```json
    {
      "action": "approve" | "reject" | "request_revision",
      "comment": "Lý do hoặc phản hồi của Admin"
    }
    ```

---

## 5. Sequence Diagram (Luồng Revision)

1.  **User**: Gửi yêu cầu cập nhật hồ sơ -> Profile Status = `pending`, Workflow = `in_progress`.
2.  **Admin**: Xem Metadata, thấy sai sót -> Chọn `request_revision`.
3.  **System**: 
    *   Workflow Reset Step = 1.
    *   Profile Status = `draft`.
    *   Dispatcher gọi `handleRevisionFromWorkflow` để xóa Cache.
4.  **User**: Nhận thông báo, vào sửa lại dữ liệu và nhấn Lưu -> Dữ liệu gộp vào Metadata cũ, Profile Status quay lại `pending`.
5.  **Admin**: Thấy dữ liệu đã sửa -> Chọn `approve`.
6.  **System**: 
    *   Cập nhật toàn bộ DB chính.
    *   Profile Status = `approved`.
    *   Workflow kết thúc.

---

## 6. Lưu ý cho Lập trình viên
*   **Atomic Locking**: Luôn sử dụng `setPendingAtomically` trong Repo để tránh Race Condition khi 2 người cùng sửa hồ sơ một lúc.
*   **Validation**: Dữ liệu trong Metadata khi Apply phải được validate lại một lần nữa bằng Zod Schema (đã triển khai trong `applyChangesFromWorkflow`).
*   **Cache**: Luôn sử dụng `rDel(CacheKey.profileFull(id))` sau mỗi bước thay đổi trạng thái quan trọng.

---
*Tài liệu này được cập nhật vào ngày 24/03/2026. Mọi thay đổi về cấu trúc Database workflow cần cập nhật lại sơ đồ metadata.*
