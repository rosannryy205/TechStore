# Kiến trúc và Quy ước Thư mục Frontend (FE)

## Context
Frontend TechStore (`FE/my-app`) được xây dựng trên React 19, Vite 8, Tailwind CSS v4 và React Router v7. Ứng dụng quản lý hai phân hệ riêng biệt: Client (trải nghiệm người mua) và Admin (quản trị sản phẩm, tồn kho, đơn hàng). Cần chuẩn hóa cấu trúc thư mục, quy ước đặt tên và luồng giao tiếp API để tránh phân mảnh mã nguồn.

## Quyết định (Decision)
1. **Quy ước đặt tên file**: Toàn bộ file mã nguồn trong thư mục `FE` (bao gồm cả React Component `.jsx` và các file script `.js`) tuân thủ nghiêm ngặt chuẩn `camelCase` theo đúng nguyên tắc dự án.
2. **Luồng dữ liệu 3 lớp (3-tier Architecture)**: Các component giao tiếp qua Custom Hook (`src/hooks/`), Custom Hook gọi API Service (`src/services/api/`), và API Service sử dụng tiện ích bọc native `fetch` (`httpClient.js`) với `credentials: "include"`. Loại bỏ hoàn toàn dependency `axios`.
3. **Mô hình xác thực (Modal-based Auth & Cookie Session)**: Phân hệ Client sử dụng modal overlay (`AuthModal`) điều khiển bởi `AuthModalContext` cho các luồng đăng nhập, đăng ký và quên mật khẩu thay vì dùng các route trang rời. Phân hệ Admin được bảo vệ bởi guard `RequireAdmin` dựa trên session cookie của tài khoản có role `admin` hoặc `staff`.
4. **Cấu hình môi trường**: Toàn bộ endpoint và URL backend được gom về `src/constants/api.js` thông qua biến môi trường `VITE_API_URL` của Vite, cấm hardcode địa chỉ URL trong component hay context.
5. **Đồng bộ giỏ hàng**: Giỏ hàng yêu cầu xác thực người dùng; số lượng badge giỏ hàng tại Header và thao tác giỏ hàng phải đi qua `cartService.js`.

## Consequences
- Các file `.jsx` đang dùng `PascalCase` sẽ được chuyển đổi sang `camelCase` để đồng bộ.
- Xóa bỏ package `axios` khỏi `package.json`.
- Hệ thống duy trì tính nhất quán cao, dễ mở rộng và tương thích chặt chẽ với các Agent tự động hóa.
