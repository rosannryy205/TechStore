# AGENTS.md — Quy tắc bắt buộc cho AI Agent trong TechStore

> Phạm vi: toàn bộ repository TechStore, bao gồm các Git worktree. Đây là tài liệu hướng dẫn hành động, không phải mô tả tham khảo. **MUST** = bắt buộc; **MUST NOT** = cấm; **SHOULD** = mặc định áp dụng, chỉ ngoại lệ khi có lý do cụ thể và được ghi nhận.

## 1. Thứ tự ưu tiên và quy trình làm việc

1. Tuân thủ yêu cầu trực tiếp của người dùng, các ràng buộc an toàn và hướng dẫn có hiệu lực cao hơn. Không tự suy diễn quyền thực hiện thao tác nguy hiểm.
2. Đọc `AGENTS.md`, `.agentrules.md` (nếu tồn tại), tài liệu task và các quy định chuyên biệt áp dụng cho file cần sửa. Nếu có xung đột giữa hai tài liệu trong repository, **dừng phần công việc bị ảnh hưởng**, nêu chính xác hai quy tắc mâu thuẫn và xin quyết định; không tự chọn quy tắc thuận tiện.
3. Trước khi sửa code: chạy `git status --short`; xác định worktree hiện tại, phạm vi task và thay đổi sẵn có. Đọc ít nhất **hai file cùng loại** trong khu vực chức năng (nếu chỉ có một thì đọc một), cùng nơi import/gọi chúng. Kiểm tra API, schema, cách export và cách chuyển lỗi.
4. Tái sử dụng module, helper, validator, service và UI component hiện có trước khi tạo mới. Chỉ thay đổi file thuộc phạm vi task; không refactor/format hàng loạt để đồng bộ phong cách.
5. Sau khi sửa: kiểm tra diff (bao gồm staged/unstaged/untracked), chạy kiểm tra phù hợp, đối chiếu tiêu chí nghiệm thu, ghi rõ kết quả thực tế và giới hạn chưa kiểm chứng.
6. **Không tự ý** commit, push, merge, reset, checkout cưỡng bức, xóa file hoặc sửa worktree/branch khác. Không ghi đè thay đổi chưa commit của người dùng hoặc agent khác. Không chạy lệnh bỏ qua cơ chế phê duyệt/bảo vệ chỉ vì tài liệu có ví dụ lệnh.

## 2. Công nghệ và ranh giới kiến trúc

| Khu vực | Công nghệ và nguyên tắc |
| --- | --- |
| `FE/my-app/` | React 19, Vite 8, Tailwind CSS 4, React Router DOM 7, Fetch API, Heroicons, ESLint. **ES modules** (`import`/`export`). |
| `BE/` | Node.js, Express 5, MySQL/Sequelize, JWT, bcrypt, Multer, Nodemailer, express-validator, CORS, Cookie Parser, express-rate-limit, dotenv. **CommonJS** (`require`/`module.exports`). |

- **Backend:** `Route → Validator/Middleware → Controller → Service → Model → Database`. Route khai báo endpoint và thứ tự middleware. Validator kiểm tra đầu vào. Controller chuyển HTTP request thành dữ liệu nghiệp vụ, gọi service, trả response. Service xử lý nghiệp vụ và truy cập model. Model mô tả schema và quan hệ. Không chuyển logic nghiệp vụ sang route/controller.
- **Frontend:** Page phối hợp hook/component; hook quản lý state, side effect và luồng thao tác; API service giao tiếp HTTP; component trình bày giao diện. Không tạo HTTP wrapper song song nếu `src/services/api/httpClient.js` đã đáp ứng.
- Dùng đường dẫn thực tế `BE/src/middleware/` (**số ít**). Giữ phân vùng `client/` và `admin/` đang có. Không tự tạo cấu trúc thư mục dựa trên tên mô tả khác với repository.
- Không đổi tên bảng/cột, response shape, endpoint, public export hoặc quyền truy cập nếu task không yêu cầu. Với hợp đồng API/DB đã có, giữ nguyên `snake_case` như `order_status`, `created_at`.

## 3. Quy chuẩn viết mã nguồn — bắt buộc

### 3.1. Khai báo và đặt tên

| Đối tượng | Quy tắc | Ví dụ đúng |
| --- | --- | --- |
| Biến không gán lại | `const`; không dùng `var` | `const orderId = req.params.id;` |
| Biến cần gán lại | `let` | `let totalPrice = 0;` |
| Biến/hàm | Tiếng Anh, `camelCase`, tên rõ nghĩa; hàm bắt đầu bằng động từ | `getOrderById`, `calculateTotalPrice` |
| Boolean | Tiền tố `is`, `has`, `can`, `should` khi phản ánh đúng nghĩa | `isLoading`, `hasPermission` |
| Hằng cấu hình dùng chung cấp module | `UPPER_SNAKE_CASE`; **không** viết hoa mọi `const` | `API_BASE_URL`, `ORDER_STATUS_MAP` |
| React component/context/model | Định danh `PascalCase` | `OrderManagement`, `AuthContext`, `CategoryModel` |
| React hook | `use` + `PascalCase` phần còn lại | `useProductSearch` |
| Handler nội bộ / callback prop | `handleX` / `onX` | `handleSubmit`, `onClose` |
| State và setter | `name` / `setName` | `isOpen`, `setIsOpen` |
| File nguồn **mới** | `camelCase`, `.jsx` nếu chứa JSX, `.js` nếu không | `orderController.js`, `orderStatusTabs.jsx` |

- Giữ nguyên tên file có sẵn (kể cả `BrandTable.jsx`, `App.jsx`, `main.jsx`, `index.js` và file cấu hình do công cụ yêu cầu). Không đổi tên file chỉ vì khác convention mới.
- Tên import phải khớp chính xác chữ hoa/thường trên đĩa. Tên export công khai phải tương thích mọi nơi đang import.
- Tránh tên mơ hồ: `data`, `temp`, `handle`, `process` khi có thể đặt tên cụ thể hơn; tránh viết tắt không phổ biến.

### 3.2. Khai báo hàm và export — Backend CommonJS

**Mặc định cho hàm mới:** `const functionName = (...) => { ... };`, hoặc `const functionName = async (...) => { ... };` khi có `await`. **Tách khai báo khỏi export**, đặt `module.exports` cuối file. Không viết middleware mới theo kiểu gộp hàm ẩn danh vào `module.exports`.

```js
// ĐÚNG — middleware CommonJS
const requireCatalogOperator = async (req, res, next) => {
  try {
    // Kiểm tra quyền và dữ liệu cần thiết.
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = requireCatalogOperator;
```

```js
// SAI — không dùng cho middleware mới
module.exports = async function requireCatalogOperator(req, res, next) {
  // ...
};
```

```js
// ĐÚNG — nhiều hàm được export
const getOrders = async (filters) => { /* ... */ };
const getOrderDetail = async (orderId) => { /* ... */ };

module.exports = { getOrders, getOrderDetail };
```

- Module một thành phần: `module.exports = functionName;`. Module nhiều thành phần: `module.exports = { functionA, functionB };`.
- Khi chỉnh sửa module cũ, **giữ nguyên public export** (kể cả alias `getAllProducts: getAllProductsController`) trừ khi task yêu cầu thay đổi contract và đã sửa mọi nơi gọi.
- `function`/`async function` trong code cũ được giữ nếu không cần sửa phần khai báo; chỉ dùng khai báo `function` mới khi có yêu cầu kỹ thuật thực sự về hoisting, `this` hoặc `arguments`, và giải thích trong báo cáo.
- Import bằng `require()` ở đầu file: Node.js/thư viện ngoài trước, module nội bộ sau; không phá thứ tự các import có side effect. **Không trộn** ESM vào module Backend CommonJS hiện có.
- Middleware Express xử lý lỗi phải có chữ ký **bốn tham số** `(error, req, res, next)`; middleware thông thường `(req, res, next)`. Middleware factory/Multer/rate limiter tuân theo API riêng của thư viện.

### 3.3. Import/export — Frontend ES modules

- Dùng `import`/`export`, **không dùng `require`/`module.exports` trong source React**.
- Component chính có thể dùng `export default function ComponentName(...)` theo file cùng loại; hook/helper dùng named export `export function useProducts(...)`, `export function formatVnd(...)`; service/constants dùng `export const` theo convention hiện có.
- Giữ mẫu object service đang dùng, ví dụ `export const adminOrderService = { async getOrders() { /* ... */ } };`. Không ép Frontend theo quy tắc arrow function của Backend.
- Import thư viện ngoài trước, module nội bộ sau. Dùng alias `@/` **chỉ nếu** cấu hình hiện tại hỗ trợ; file gần nhau có thể dùng `./` và `../`. Không đổi kiểu export làm hỏng import hiện tại.

### 3.4. Formatting — mã nguồn mới

- Thụt lề **2 spaces**, không dùng tab; câu lệnh JS kết thúc bằng `;`; chuỗi JS dùng `"double quotes"`; JSX attributes dùng `"double quotes"`.
- Có khoảng trắng sau dấu phẩy, quanh toán tử và trong destructuring: `const { id } = req.params;`.
- Mở `{` cùng dòng khai báo/điều kiện; dùng dòng trống giữa các nhóm logic. JSX nhiều dòng đặt trong `return (...)`.
- Với object/array/JSX dài, xuống dòng theo từng phần tử/prop; trailing comma theo convention file hiện tại. UTF-8, giữ line ending của file, có newline cuối file, không có trailing whitespace.
- **File cũ:** chỉ format dòng được chỉnh sửa, giữ phong cách lân cận khi không mâu thuẫn với quy tắc bắt buộc. Không cài Prettier, đổi ESLint config hoặc format toàn file nếu chưa được yêu cầu.

### 3.5. Cấu trúc file Backend

| Loại | Thứ tự và trách nhiệm bắt buộc |
| --- | --- |
| Route | `require` → `router` → khai báo endpoint/middleware → `module.exports = router;`. Route tĩnh trước route động có thể bắt trùng. Không query DB. |
| Validator | `express-validator` → rules cho `params/query/body` → bước xử lý `validationResult` theo mẫu dự án → export. Input không hợp lệ trả HTTP 400 theo contract. |
| Middleware | `require` → `const namedMiddleware = ...` → `module.exports = namedMiddleware;`. Không gửi response rồi gọi `next()` tiếp. |
| Controller | `require service` → `const namedHandler = async ...` → `module.exports = { ... };`. Đọc input đã validate, gọi service, trả response; lỗi async chuyển `next(error)`. |
| Service | `require model/helper` → constants/helpers → nghiệp vụ → export. Nhận dữ liệu nghiệp vụ, trả kết quả hoặc `throw`; không nhận `req/res/next` để điều khiển HTTP. |
| Model | Import Sequelize/DataTypes/kết nối hiện có → `sequelize.define(...)` → export. Khai báo fields, constraints, options đúng schema; quan hệ/alias theo `BE/src/models/index.js`. |

### 3.6. Cấu trúc file Frontend

- Component: imports → helper/hằng thuần → `PascalCase` component → đọc props/context/router và **gọi hooks ở top level** → dữ liệu tính toán/handlers → JSX. Không gọi hook trong vòng lặp, điều kiện hoặc sau early return.
- Page điều phối hook và component; UI con nhận dữ liệu/callback qua props. Logic gọi API/biến đổi nghiệp vụ đặt ở hook/service phù hợp, tránh fetch trùng lặp.
- Custom hook đặt theo nhóm hiện có `src/hooks/client/` hoặc `src/hooks/admin/`, trả object với key rõ nghĩa. Chỉ dùng `useMemo`/`useCallback` khi có lý do về hiệu năng hoặc ổn định tham chiếu/dependencies.
- API service đặt trong `src/services/api/client/` hoặc `admin/`, tái sử dụng `src/services/api/httpClient.js` và contract `status`/`payload`, credentials, JSON hiện có. Không tự tạo wrapper HTTP thứ hai.
- UI phải tuân thủ `FE/my-app/DESIGN.md` nếu có, ưu tiên Tailwind utility classes, responsive mobile/tablet/desktop, tuân thủ `FE/my-app/eslint.config.js`. Chỉ thêm CSS riêng khi utility không đáp ứng hợp lý; không tự tắt ESLint để qua kiểm tra.
- Với effect bất đồng bộ, ngăn response cũ ghi đè state sau unmount/thay đổi điều kiện bằng cleanup, abort hoặc ignore-result theo pattern hiện có. Phân biệt hủy chủ động với lỗi thật.

### 3.7. Comment, lỗi, bảo mật

- Comment giải thích **vì sao**, ràng buộc nghiệp vụ, điều kiện biên hoặc contract không hiển nhiên; không mô tả lại từng dòng code. Dùng `//`, JSDoc `/** ... */` khi cần contract, và `{/* ... */}` trong JSX. Giữ ngôn ngữ comment của module đang sửa.
- Controller async: `try/catch` và `next(error)` theo mẫu hiện có; service `throw` lỗi có `statusCode`/`code` nếu contract yêu cầu. Chỉ catch khi xử lý/cleanup/rollback/chuyển lỗi; không nuốt lỗi.
- Tái sử dụng `BE/src/middleware/errorHandler.js`. Lỗi 4xx đúng nguyên nhân; lỗi 5xx không lộ stack trace/SQL/secret. Không trả HTTP 200 cho lỗi.
- Kiểm tra dữ liệu đầu vào bằng validator trước khi gọi nghiệp vụ. Kiểm tra xác thực/phân quyền ở server, không dựa vào việc ẩn nút ở Frontend. Giữ JWT, bcrypt, rate limiter và cơ chế cookie/CORS hiện có.
- Không log hoặc commit password, JWT, API key, `.env` và dữ liệu nhạy cảm. Backend dùng `process.env`; Frontend dùng `import.meta.env.VITE_*` **chỉ cho giá trị công khai**. Khi thêm biến môi trường, cập nhật `.env.example` nếu có, không đưa giá trị thật.
- Frontend xử lý loading/error/empty state, thông báo lỗi dễ hiểu và retry khi phù hợp. Không chỉ `console.error` mà bỏ qua trải nghiệm người dùng.

## 4. Tài liệu task — quy tắc vận hành

### 4.1. Thư mục và tên file

| Loại | Vị trí bắt buộc | Mẫu tên |
| --- | --- | --- |
| Phỏng vấn yêu cầu | `docs/interviews/` | `YYYY-MM-DD-ten-task-interview.md` |
| Kế hoạch | `docs/task-plans/` | `YYYY-MM-DD-ten-task-plan.md` |
| Báo cáo thay đổi | `docs/code-changes/` | `YYYY-MM-DD-ten-task-change-log.md` |
| Code review | `docs/code-reviews/` | `YYYY-MM-DD-ten-task-code-review.md` |

- `ten-task`: chữ thường, tiếng Việt không dấu, các từ nối bằng `-`; **giữ cùng một tên** cho mọi tài liệu thuộc một task. Không dùng hậu tố `final`, `latest`, `v2` để tạo bản sao.
- `YYYY-MM-DD` là **ngày tạo gốc của từng tài liệu**, không phải ngày sửa, ngày đổi tên hay ngày chạy agent. Với file mới dùng ngày thực tế tạo; với file cũ đối chiếu nội dung, metadata và Git history. Nếu không xác minh được ngày gốc, **không đoán/đổi tên**, báo người dùng.
- Không lưu bốn loại tài liệu trên trực tiếp ở `docs/`. Giữ `docs/adr/`, `docs/agents/` và tài liệu tổng quan tại vị trí riêng đã có. Không tạo thêm thư mục tùy tiện.

### 4.2. Điều kiện tạo và nội dung bắt buộc

1. **Interview:** chỉ bắt buộc khi tính năng/nghiệp vụ phức tạp hoặc có quyết định chưa chốt. Khảo sát hiện trạng, ghi câu hỏi/đáp án, các lựa chọn, quyết định chính thức và ranh giới bàn giao. Không tạo cho sửa lỗi nhỏ hoặc task đã đủ đặc tả.
2. **Task plan:** bắt buộc cho tính năng mới, thay đổi logic đáng kể hoặc refactor. Trước khi tạo, tìm kế hoạch cùng task và cập nhật/tái sử dụng nếu phù hợp. Gồm: mục tiêu; hiện trạng có đường dẫn file; phạm vi làm/không làm; danh sách file dự kiến; phương án và lý do; bước triển khai; rủi ro/edge cases; **acceptance criteria có thể kiểm chứng**; kế hoạch test. Không cần file plan riêng cho chỉnh typo/format nhỏ không đổi hành vi trừ khi được yêu cầu.
3. **Change log:** sau task có thay đổi code, kiểm tra diff thực tế, liệt kê **từng file thêm/sửa/xóa**. Với mỗi file nêu thành phần thay đổi, logic trước/sau, input/điều kiện/output, mục đích nghiệp vụ, lý do chọn cách làm, tác dụng cốt lõi, ảnh hưởng liên tầng. Mô tả luồng tổng thể, đánh giá phương án, test thực tế và đối chiếu từng acceptance criterion: **Đạt / Chưa đạt / Chưa kiểm chứng**. Không ghi “đã tối ưu” khi không có bằng chứng.
4. **Code review độc lập:** lưu `docs/code-reviews/`, ghi task, ngày tạo, liên kết plan/change log, baseline commit/diff và file phạm vi. Đánh giá riêng **Standards** (quy tắc, kiến trúc, security, code smells, tài liệu) và **Spec** (từng acceptance criterion, thiếu/sai/thừa chức năng); liệt kê findings, test/lint/build và giới hạn; kết luận **Đạt / Cần sửa / Không đạt**.
5. **Không sửa acceptance criteria sau khi code để hợp thức hóa kết quả.** Nếu yêu cầu thực sự thay đổi, ghi rõ thay đổi và lý do trong kế hoạch lẫn change log; giữ lịch sử truy vết.

## 5. Kiểm tra trước khi bàn giao

- [ ] Đã đọc quy tắc áp dụng và file mẫu cùng loại; không phát sinh xung đột chưa xử lý.
- [ ] Không thay đổi ngoài phạm vi; giữ nguyên API/DB/export contract trừ khi task yêu cầu.
- [ ] Backend CommonJS, Frontend ESM; hàm, tên file, import/export, formatting đúng Mục 3.
- [ ] Route/validator/controller/service/model hoặc component/hook/API service đúng trách nhiệm.
- [ ] Đã kiểm tra validation, quyền truy cập, lỗi, bảo mật, loading/empty/error và edge cases liên quan.
- [ ] Đã chạy kiểm tra phù hợp: `git diff --check`; `node --check` với file JS Backend phù hợp; lint/build/test theo scripts hiện có. **Không ghi pass nếu chưa chạy**.
- [ ] Đã kiểm tra `git status --short`, staged/unstaged/untracked; không động vào worktree khác.
- [ ] Đã tạo/cập nhật tài liệu cần thiết đúng thư mục, tên, ngày gốc; liên kết nội bộ hợp lệ; đối chiếu từng acceptance criterion với bằng chứng.
- [ ] Báo cáo cuối ghi rõ: file đã thay đổi, mục đích, kiểm tra đã chạy và kết quả, điều chưa làm/chưa kiểm chứng, rủi ro còn lại.

## 6. File tham chiếu để khảo sát (không thay thế việc đọc code hiện tại)

- Backend middleware: `BE/src/middleware/errorHandler.js`, `BE/src/middleware/requireCatalogOperator.js`.
- Backend controller/service/model: `BE/src/controllers/admin/orderController.js`, `BE/src/services/admin/categoryService.js`, `BE/src/models/categoryModel.js`, `BE/src/models/index.js`.
- Backend route/validator: `BE/src/routes/admin/orderRoutes.js`, `BE/src/validators/adminOrderValidators.js`.
- Frontend component/page/hook: `FE/my-app/src/components/admin/orders/orderStatusTabs.jsx`, `FE/my-app/src/pages/admin/orders/orderManagement.jsx`, `FE/my-app/src/hooks/client/useProductSearch.js`.
- Frontend API/config: `FE/my-app/src/services/api/httpClient.js`, `FE/my-app/src/services/api/admin/orderService.js`, `FE/my-app/src/utils/formatCurrency.js`, `FE/my-app/eslint.config.js`, `FE/my-app/vite.config.js`, `FE/my-app/jsconfig.json`.

> **Giới hạn xác minh:** Danh sách công nghệ, đường dẫn và conventions ở trên được chuẩn hóa từ tài liệu người dùng cung cấp; Agent triển khai phải đối chiếu repository/worktree thực tế trước khi coi đó là sự thật hiện hành. Nếu file tham chiếu không tồn tại, nêu rõ và dùng file cùng loại đang có; không tự tạo file để khớp tài liệu.
