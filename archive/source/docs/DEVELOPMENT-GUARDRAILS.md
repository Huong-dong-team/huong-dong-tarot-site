# Development guardrails - chống vibe code

## Definition of Ready

Một task chỉ bắt đầu code khi có:

1. Vấn đề người dùng cần giải quyết.
2. Phạm vi có và không có.
3. Acceptance criteria kiểm chứng được.
4. Dữ liệu/source of truth.
5. Trạng thái loading, empty, error và permission nếu liên quan.

## Definition of Done

- TypeScript không lỗi, lint/build/test qua.
- Có test cho luật nghiệp vụ và regression quan trọng.
- Không có secret, dữ liệu cá nhân mẫu hoặc key thanh toán trong repo.
- Keyboard, mobile, contrast, reduced-motion và metadata được kiểm tra.
- Event analytics có tên, trigger, properties, owner và mục đích quyết định.
- Thay đổi schema có migration; thay API có contract/version note.
- Reviewer hiểu được “tại sao” từ PR/ADR, không phải đoán từ code.

## Quy tắc pull request

Mỗi PR chỉ giải quyết một lát cắt deployable. Mô tả PR gồm:

- User outcome.
- Ảnh/video trước-sau nếu đổi UI.
- Quyết định kiến trúc và trade-off.
- Cách test.
- Rủi ro, rollback và analytics ảnh hưởng.

Không merge code chỉ vì “chạy được trên máy tôi”. Không để AI tự chọn thư viện mới nếu chưa có ADR và kiểm tra maintenance/security/license.

## Cấm tuyệt đối

- Ghi giá, tổng tiền, quyền truy cập hoặc trạng thái thanh toán chỉ ở client.
- Fake success sau khi bấm nút.
- Bắt lỗi bằng `catch {}` rồi bỏ qua.
- Dùng `any` để né type hoặc tắt lint toàn file.
- Copy-paste component/logic thay vì sửa abstraction đúng chỗ.
- Viết thẳng SDK payment/email/database trong component.
- Thu PII “để sau tính” mà không có mục đích, retention và privacy notice.

## ADR

Quyết định khó đảo ngược phải có file ở `docs/decisions/`: payment provider, CMS, auth, database, analytics provider, hosting, order-state model.
