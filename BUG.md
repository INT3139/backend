# 🐞 BÁO CÁO LỖI HỆ THỐNG & LỖ HỔNG NGHIỆP VỤ (BUG.md)

Bản báo cáo này tổng hợp các lỗi logic, thiếu sót nghiệp vụ và rủi ro kỹ thuật được phát hiện trong quá trình rà soát mã nguồn các module: Workflow, Profile, Reward, Salary và Recruitment.

---

## 1. Hệ thống Quy trình (Workflow Engine) - **Mức độ: Cao**

### ❌ Mâu thuẫn Kiểu hành động (Action Type Mismatch)
*   **Mô tả:** Trong `wf_definitions.json`, quy trình `reward_ballot` và `appointment_5step` sử dụng `action_type: "ballot_submit"`. Tuy nhiên, `WorkflowEngine.advance` (`engine.ts`) chỉ chấp nhận: `approve`, `reject`, `request_revision`, `forward`.
*   **Hậu quả:** Người dùng không thể thực hiện các bước bỏ phiếu. Hệ thống trả về `ValidationError` khi gặp hành động lạ.
*   **Vị trí:** `src/core/workflow/engine.ts` & `src/wf_definitions.json`.

### ❌ Race Condition khi duyệt lẻ Metadata
*   **Mô tả:** Endpoint `PATCH /api/v1/workflow/:id/:key` thực hiện đọc-sửa-ghi Metadata của workflow. Nếu hai chuyên viên duyệt hai mục khác nhau của cùng một hồ sơ cùng lúc, dữ liệu sẽ bị ghi đè và mất mát bản ghi của người thực hiện trước.
*   **Hậu quả:** Mất dấu vết phê duyệt lẻ, sai lệch trạng thái hồ sơ cuối cùng.
*   **Vị trí:** `src/modules/workflow.routes.ts` (Logic xử lý metadata `pending`).

---

## 2. Module Khen thưởng (Reward Module) - **Mức độ: Nghiêm trọng**

### ❌ Thiếu tích hợp Workflow (Missing Workflow Integration)
*   **Mô tả:** Quy trình `reward_ballot` (ID 50) có 5 bước phê duyệt nhưng `RewardService` không gọi `workflowEngine.initiate` và cũng không đăng ký `registerWorkflowHandler`.
*   **Hậu quả:** Các chức năng tạo khen thưởng (`createCommendation`, `createTitle`) hiện tại đang ghi trực tiếp vào Database, bỏ qua toàn bộ quy trình bình xét thi đua của trường.
*   **Vị trí:** `src/modules/reward/reward.service.ts`.

---

## 3. Module Tuyển dụng (Recruitment Module) - **Mức độ: Trung bình**

### ❌ Quy trình Gia hạn hợp đồng chưa triển khai (Phantom Workflow)
*   **Mô tả:** Code `contract_renewal` tồn tại trong file cấu hình nhưng logic nghiệp vụ trong `recruitment.service.ts` chưa được viết. Hệ thống không có handler để tự động cập nhật ngày hết hạn hợp đồng mới sau khi duyệt.
*   **Hậu quả:** Tính năng gia hạn hợp đồng trên UI sẽ không có tác dụng thực tế ở Backend.
*   **Vị trí:** `src/modules/recruitment/recruitment.service.ts`.

---

## 4. Module Lương (Salary Module) - **Mức độ: Trung bình**

### ❌ Rủi ro kiểu dữ liệu (Data Type Instability)
*   **Mô tả:** Trong `applyChangesFromWorkflow`, code thực hiện `parseInt` trên `proposal.proposedGrade` từ JSON metadata. Nếu dữ liệu JSON bị sai định dạng (ví dụ `"Bậc 1"` thay vì `1`), giá trị cập nhật sẽ là `NaN`.
*   **Hậu quả:** Làm hỏng bản ghi lương của cán bộ, gây lỗi lan chuyền sang module tính lương hàng tháng.
*   **Vị trí:** `src/modules/salary/salary.service.ts` (Dòng 155).

---

## 5. Module Hồ sơ (Profile Module) - **Mức độ: Cao**

### ❌ Lỗi Nguyên tử khi Từ chối (Atomic Rejection Failure)
*   **Mô tả:** Hệ thống cho phép "duyệt lẻ" từng phần hồ sơ (ví dụ duyệt bằng cấp trước). Khi một mục được duyệt lẻ, nó được cập nhật ngay vào bảng chính. Nếu sau đó quản lý nhấn **Reject** toàn bộ Workflow, các mục đã cập nhật lẻ không bị thu hồi (rollback).
*   **Hậu quả:** Dữ liệu hồ sơ bị mâu thuẫn: Workflow trạng thái "Bị từ chối" nhưng dữ liệu thật trong hồ sơ đã bị thay đổi một phần.
*   **Vị trí:** `src/modules/profile/profile.service.ts` (Hàm `handleRejectionFromWorkflow`).

---

## 6. Phân quyền & Bảo mật (ABAC) - **Mức độ: Trung bình**

### ❌ Lỗ hổng logic UnitId Null
*   **Mô tả:** Logic kiểm tra quyền truy cập hồ sơ:
    ```typescript
    if (unitIds !== 'all' && (profile.unitId === null || !unitIds.includes(profile.unitId)))
    ```
    Nếu một giảng viên mới chưa được gán đơn vị (`unitId = null`), logic này có thể chặn nhầm cả những người quản lý có quyền `all` (Admin) tùy theo cách `abacService` xử lý mảng rỗng.
*   **Vị trí:** `salary.service.ts`, `reward.service.ts`, `recruitment.service.ts`.

---

## 💡 Đề xuất hành động (Action Plan)

1.  **Engine:** Cập nhật `engine.ts` để hỗ trợ hành động mở rộng `ballot_submit` và `ballot_data`.
2.  **Transactions:** Bọc các hàm xử lý Metadata Workflow trong Database Transaction với cơ chế `FOR UPDATE` locking.
3.  **Reward:** Chuyển đổi logic INSERT trực tiếp sang `workflowEngine.initiate`.
4.  **Rollback:** Xây dựng cơ chế "Shadow Table" hoặc "Versioning" cho Profile thay vì cập nhật trực tiếp bảng chính khi duyệt lẻ.
5.  **Validation:** Sử dụng Zod để validate lại metadata trước khi gọi hàm `applyChanges`.
