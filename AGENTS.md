# Quy tắc Agent cho dự án TechStore

Tài liệu này phác thảo các nguyên tắc cốt lõi, công nghệ sử dụng và các quy ước cần tuân thủ khi đóng góp hoặc quản lý dự án TechStore.

## 1. Tổng quan Công nghệ (Tech Stack)

### Frontend (FE/my-app)
- **Thư viện lõi**: React (v19)
- **Công cụ Build**: Vite (v8)
- **Styling**: Tailwind CSS (v4)
- **Routing (Điều hướng)**: React Router DOM (v7)
- **Gọi API/HTTP**: Fetch API (native)
- **Icons**: Heroicons (`@heroicons/react`)
- **Linting**: ESLint (v10) với các plugin cho React

### Backend (BE)
- **Môi trường chạy (Runtime)**: Node.js
- **Framework**: Express (v5)
- **Cơ sở dữ liệu & ORM**: MySQL với Sequelize
- **Xác thực (Authentication)**: JWT (`jsonwebtoken`) & `bcrypt` để mã hóa mật khẩu
- **Upload file**: Multer
- **Dịch vụ Email**: Nodemailer
- **Xác thực dữ liệu (Validation)**: `express-validator`
- **Bảo mật/Middleware**: CORS, Cookie Parser, `express-rate-limit`, `dotenv`
- **Vùng xử lý**: Router chỉ xử lý đường dẫn, Validation thực hiện tại validators, Service phụ trách thiết kế logic chính của các chức năng, Controller chỉ nhận request -> gọi Service tương ứng -> trả Response

---

## 2. Tiêu chuẩn & Nguyên tắc Lập trình

### Nguyên tắc Frontend
- **Thiết kế & Công cụ**: Phải tuân thủ chặt chẽ các nguyên tắc thiết kế được định nghĩa trong `FE/my-app/DESIGN.md`. Đồng thời, tận dụng tối đa các skills đã được thiết lập trong `FE/my-app/skills-lock.json` để đồng bộ công cụ và workflow.
- **Tuân thủ ESLint**: Tất cả code phải vượt qua các quy tắc ESLint được định nghĩa trong `eslint.config.js`. Tránh việc bỏ qua các lỗi linting bằng comment nội tuyến (inline comments) trừ khi thực sự cần thiết.
- **Tailwind CSS & IntelliSense**:
  - Luôn sử dụng các utility class của Tailwind để tạo kiểu (styling).
  - Sắp xếp các utility class một cách có logic. Dựa vào các extension Tailwind IntelliSense để duy trì cú pháp chính xác và tránh gõ sai.
  - Tránh tạo các file CSS riêng lẻ trừ trường hợp các hiệu ứng chuyển động (animations) toàn cục phức tạp hoặc các base style không được hỗ trợ tốt bởi các utility.
- **Cấu trúc Component**: Tập trung vào functional component và React Hooks. Giữ cho các component nhỏ gọn, có thể tái sử dụng và đảm nhận một mục đích duy nhất.
- **Routing**: Sử dụng các tính năng mới của React Router (ví dụ: các hook như `useNavigate`, `useParams`).
- **Responsive**: Responsive đầy đủ trên các giao diện desktop, tablet và đặc biệt là mobile.

### Nguyên tắc Backend
- **Cấu trúc Dự án**: Tuân thủ sự phân tách các thành phần rõ ràng, theo kiến trúc 3 lớp (Controller - Service - Model):
  - `routes/`: Định nghĩa các endpoint của API.
  - `controllers/`: Chỉ đảm nhận việc tiếp nhận HTTP request, gọi tới các service tương ứng và trả về HTTP response. Tuyệt đối không viết logic nghiệp vụ (business logic) ở đây.
  - `services/`: Nơi chứa toàn bộ logic nghiệp vụ (business logic). Nhận dữ liệu từ controller, xử lý nghiệp vụ, tương tác với database thông qua model và trả kết quả về cho controller.
  - `models/`: Định nghĩa các model của Sequelize và các mối quan hệ (relationships).
  - `middlewares/`: Logic tùy chỉnh cho việc xác thực (authentication), kiểm tra dữ liệu (validation), v.v.
- **Thao tác Cơ sở dữ liệu**: Ưu tiên sử dụng các phương thức ORM tích hợp của Sequelize thay vì viết câu lệnh SQL thuần (raw SQL) để đảm bảo tính bảo mật và dễ bảo trì. Luôn định nghĩa rõ ràng các mối quan hệ (relationships).
- **Kiểm tra dữ liệu (Validation)**: Xác thực kỹ lưỡng tất cả các dữ liệu payload từ API request bằng `express-validator` trước khi chuyển dữ liệu xuống tầng database.
- **Bảo mật**: 
  - Đảm bảo mật khẩu không bao giờ được lưu trữ hoặc in ra console dưới dạng văn bản thuần túy (plain text).
  - Triển khai luồng xác thực JWT chặt chẽ.
  - Duy trì rate limiter để ngăn chặn các cuộc tấn công brute-force.

---

### 2.1. Áp dụng coding conventions trước khi viết code

**Bắt buộc trước mỗi lần tạo hoặc chỉnh sửa mã nguồn**: đọc `AGENTS.md`, sau đó đọc ít nhất hai file cùng loại trong khu vực chức năng đang làm (nếu chỉ có một file thì đọc file đó). Đọc thêm nơi import/gọi chúng để xác định chữ ký hàm, kiểu export, dữ liệu đầu vào/đầu ra và cách chuyển lỗi. Với frontend, đọc thêm tài liệu thiết kế/công cụ nêu ở phần Nguyên tắc Frontend nếu có trong worktree; nếu thiếu, báo rõ giới hạn và tham khảo giao diện cùng khu vực.

- Các mục dưới đây cụ thể hóa nguyên tắc Frontend, Backend và Mục 3; trách nhiệm các tầng vẫn theo phần Nguyên tắc Backend.
- Khi sửa file, giữ formatting và giao diện module của file đó; áp dụng quy tắc cho phần code liên quan đến task. Khi tạo file, dùng mẫu cùng loại và các mặc định dưới đây. Không format toàn file, đổi tên file hoặc đổi export ngoài phạm vi chỉ để đồng bộ phong cách.
- Nếu file cũ có nhiều kiểu, dùng kiểu nhất quán của các file cùng loại gần nhất phù hợp với tài liệu này. Riêng middleware CommonJS viết mới hoặc sửa phần khai báo/export phải theo Mục 2.4.
- Tuân thủ cấu hình lint/build hiện có. Sai lệch trong code cũ không mặc nhiên trở thành convention; không tự thêm formatter, thư viện hoặc đổi cấu hình công cụ để áp đặt phong cách.

### 2.2. Khai báo và đặt tên

- Dùng `const` mặc định; chỉ dùng `let` khi cần gán lại, không khai báo mới bằng `var`. Biến tham chiếu object/array vẫn dùng `const` nếu không gán lại tham chiếu.
- Biến và hàm dùng tiếng Anh, `camelCase`, tên thể hiện ý nghĩa nghiệp vụ. Hàm dùng động từ như `getOrders`, `createCategory`, `normalizeProductKeyword`; boolean dùng tên như `isOpen`, `hasSale`, `canSearch`.
- Hằng cấu hình, danh sách/map dùng chung ở cấp module dùng `UPPER_SNAKE_CASE`, như `API_BASE_URL`, `ORDER_STATUS_MAP`, `PRICE_RANGES`. Không viết hoa mọi biến chỉ vì khai báo bằng `const`.
- Component, context/provider và định danh model dùng `PascalCase`, như `OrderManagement`, `AuthContext`, `CategoryModel`. Custom hook dùng `use` + tên nghiệp vụ, như `useProductSearch`.
- Event handler nội bộ React dùng `handleX`; callback prop dùng `onX`; state/setter đi theo cặp như `isOpen`/`setIsOpen`.
- Tên file mới tuân thủ `camelCase` tại Mục 3: `orderController.js`, `categoryService.js`, `categoryModel.js`, `orderRoutes.js`, `adminOrderValidators.js`, `requireCatalogOperator.js`, `orderStatusTabs.jsx`, `useProductSearch.js`. File chứa JSX dùng `.jsx`, logic JavaScript không chứa JSX dùng `.js`.
- Tên component export vẫn là `PascalCase` dù tên file là `camelCase`. Giữ nguyên các file `PascalCase` đã có như `BrandTable.jsx`, cùng tên file do công cụ/entry point quy định như `App.jsx`, `main.jsx`, `index.js`, `vite.config.js`, `eslint.config.js`; không tự đổi tên chúng. Import phải đúng chữ hoa/thường của file thực tế.
- Giữ nguyên tên trường database/API đã công bố, kể cả `snake_case` như `order_status`, `expected_status`, `created_at`. Chỉ ánh xạ sang biến nội bộ `camelCase` ở ranh giới phù hợp; không đổi contract để thỏa quy tắc đặt tên.

### 2.3. Import/export, tổ chức file và formatting

**Backend — CommonJS**:

- Dùng `require()` và `module.exports`; không trộn `import`/`export` vào các module Backend hiện có.
- Đặt dependency ở đầu file: thư viện/Node.js trước, module nội bộ sau. Giữ thứ tự import có side effect hoặc phụ thuộc trình tự khởi tạo.
- Module một thành phần xuất trực tiếp ở cuối file: `module.exports = requireCatalogOperator;` hoặc `module.exports = CategoryModel;`. Module nhiều hàm/hằng xuất một object: `module.exports = { getOrders, getOrderDetail };`.
- Ưu tiên khai báo hàm bằng `const name = (...) => { ... };` hoặc `const name = async (...) => { ... };`, tách export ra cuối file. Các service/helper cũ có `function`/`async function` được giữ theo ngữ cảnh tại Mục 2.1; không chuyển đổi hàng loạt. Giữ function thường khi cần ngữ nghĩa `this`, `arguments` hoặc hoisting.
- Giữ public export mà nơi gọi đang sử dụng, kể cả alias như `module.exports = { getAllProducts: getAllProductsController };`.

**Frontend — ES modules**:

- Dùng `import`/`export`. Component chính thường dùng `export default function ComponentName(...)`; hook/helper dùng named export như `export function useProducts(...)`, `export function formatVnd(...)`; API service/constants dùng `export const`.
- Tiếp tục mẫu service object và method shorthand như `export const adminOrderService = { async getOrders(...) { ... } };`. Arrow function phù hợp cho callback và handler nội bộ; không ép frontend sang mẫu CommonJS/arrow function của Backend.
- Import thư viện trước dependency nội bộ khi tạo file. Dùng alias `@/` đã cấu hình cho đường dẫn từ `src`; dùng `./` hoặc `../` cho file gần nhau theo nhóm hiện có. Giữ side-effect import như CSS ở vị trí phù hợp và không đổi kiểu export làm hỏng nơi dùng.

**Tổ chức và định dạng**:

- Trình tự thông thường: imports/requires → hằng cấp module → helper nội bộ → hàm/component chính → exports (nếu không export tại khai báo). Giữ helper trong module khi chỉ phục vụ module đó; kiểm tra `utils/`, `constants/` và service hiện có trước khi tách tiện ích dùng chung.
- Mặc định cho file nguồn mới: thụt lề 2 dấu cách, dùng dấu `;` kết thúc câu lệnh JavaScript, chuỗi dùng nháy kép và template literal khi nội suy; thuộc tính JSX dùng nháy kép. Khi sửa file cũ, giữ kiểu đang dùng, bao gồm file cấu hình dùng nháy đơn/không có dấu `;`.
- Dùng khoảng trắng sau dấu phẩy, quanh toán tử và trong destructuring/object như `const { id } = req.params;`. Dấu `{` mở block cùng dòng với khai báo/điều kiện; ngăn cách các khối logic bằng dòng trống.
- Object, array, tham số và JSX dài nên xuống dòng theo cấu trúc, mỗi mục/prop một dòng khi cần; dùng trailing comma trong danh sách nhiều dòng theo file hiện có. JSX nhiều dòng đặt trong `return (...)`.
- Giữ encoding UTF-8, kiểu xuống dòng của file và newline cuối file; không thêm khoảng trắng cuối dòng.
- ESLint frontend hiện kiểm tra JavaScript/React Hooks/React Refresh, không quy định đầy đủ indentation, quotes hoặc semicolons; mặc định trên là convention từ mã nguồn, không phải lý do bỏ qua lint hay tự cài Prettier.

### 2.4. Cấu trúc Backend theo từng loại file

Đường dẫn middleware thực tế là **`BE/src/middleware/`** (số ít); mục `middlewares/` ở phần kiến trúc mô tả vai trò, không yêu cầu tạo thêm thư mục. Giữ phân vùng `client/` và `admin/` hiện có trong routes/controllers/services.

| Loại file | Cấu trúc áp dụng |
| --- | --- |
| Route | Khai báo `router`, import middleware/validator/controller, gắn middleware và endpoint, cuối file `module.exports = router;`. Giữ route tĩnh trước route động có thể bắt trùng; không đặt truy vấn database hoặc logic nghiệp vụ tại đây. |
| Validator | Import từ `express-validator`; khai báo rule/rule factory và bước kiểm tra `validationResult` theo mẫu cùng nhóm; export các rule và hàm validate cần dùng. Kiểm tra `params`, `query`, `body` phù hợp endpoint trước controller; dữ liệu sai trả 400 theo contract hiện có. |
| Middleware | Import dependency → khai báo hàm có tên bằng `const` → export cuối file. Dùng `(req, res, next)`, chỉ thêm `async` khi cần `await`; middleware factory hoặc instance Multer/rate limiter giữ chữ ký/API riêng của thư viện. |
| Controller | Import service → khai báo handler → export object. Handler đọc dữ liệu request đã validate, truyền dữ liệu/quyền cần thiết vào service, nhận kết quả và trả HTTP response; dùng `try/catch` cho handler async và chuyển lỗi bằng `next(error)`. |
| Service | Import model/helper → hằng và helper → hàm nghiệp vụ → export object hoặc thành phần theo contract. Nhận dữ liệu nghiệp vụ, trả dữ liệu hoặc throw lỗi; không nhận/truy cập `req`, `res`, `next` để xử lý HTTP. |
| Model | Import `DataTypes` và kết nối `sequelize` → `const XxxModel = sequelize.define(...)` → export model. Khai báo field, kiểu, null/default/constraint và options theo schema hiện có; giữ `tableName` và ánh xạ timestamps khi có. Đăng ký quan hệ/alias theo cơ chế trong `BE/src/models/index.js`, không tự đổi tên bảng/cột hoặc tạo kết nối riêng. |

Mẫu bắt buộc cho middleware CommonJS có logic bất đồng bộ (minh họa theo `requireCatalogOperator` hiện có):

```javascript
const User = require("../models/userModel");

// Chạy sau requireAuth; kiểm tra quyền hiện tại từ database.
const requireCatalogOperator = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "role", "status"],
    });

    if (!user || user.status !== 1 || !["admin", "staff"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Bạn không có quyền thực hiện thao tác này.",
      });
    }

    req.user.role = user.role;
    req.user.status = user.status;
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = requireCatalogOperator;
```

Middleware một thành phần không gộp khai báo vào `module.exports = async function ...` hoặc `module.exports = (...) => ...`. Middleware error handler phải giữ đủ bốn tham số `(error, req, res, next)` để Express nhận diện, kể cả tham số chưa dùng.

### 2.5. React component, hook và API service

- Component/page/layout: imports → hằng/helper thuần ngoài component nếu phù hợp → functional component `PascalCase`. Trong component: đọc props/context/router và gọi hooks → tính dữ liệu hiển thị/khai báo handler → trả JSX. Giữ hooks ở cấp cao nhất, trước các nhánh return có điều kiện.
- Page phối hợp hook và component trình bày; logic tải dữ liệu, form và thao tác nghiệp vụ thuộc custom hook trong `src/hooks/client/` hoặc `src/hooks/admin/` theo nhóm hiện có. Component con nhận dữ liệu/callback qua props; tránh nhúng thêm luồng Fetch trùng với service/hook.
- Custom hook thường dùng `export function useX(...)`, quản lý state/effect/handler rồi trả object có tên trường rõ nghĩa. Chỉ dùng `useCallback`/`useMemo` khi cần ổn định dependency/tham chiếu hoặc tránh tính toán tốn kém theo ngữ cảnh.
- API service nằm trong `src/services/api/client/` hoặc `admin/`, tái sử dụng `httpRequest` từ `src/services/api/httpClient.js`; giữ contract parse JSON, credentials và lỗi có `status`/`payload`. Không tự tạo HTTP wrapper song song.
- Context/provider tiếp tục theo `src/contexts/`: tạo context, provider quản lý state, hook truy cập context; giữ giao diện export đang được sử dụng.
- Khi effect gọi API có thể trả kết quả sau khi unmount/đổi bộ lọc, dùng cleanup và cơ chế hủy/bỏ qua response cũ theo hook cùng loại. Phân biệt hủy chủ động với lỗi cần hiển thị; cập nhật loading/error nhất quán.
- Quy tắc môi trường tại Mục 3 dùng `process.env` cho Backend; với frontend Vite, biến cấu hình công khai dùng `import.meta.env.VITE_*` như trong `src/constants/api.js`. Không đưa thông tin mật vào biến `VITE_*` vì chúng được đưa vào bundle trình duyệt.

### 2.6. Comment và xử lý lỗi

- Comment giải thích lý do, ràng buộc nghiệp vụ, điều kiện chạy trước/sau hoặc trường hợp biên; cập nhật cùng logic. Giữ ngôn ngữ comment của nhóm file (hiện có cả tiếng Việt và tiếng Anh), tránh comment lặp lại tên hàm hoặc mô tả thao tác hiển nhiên.
- Dùng `//` cho giải thích ngắn, `/** ... */` cho contract/hàm dùng chung khi cần mô tả tham số, kết quả hoặc điều kiện lỗi; comment trong JSX dùng `{/* ... */}`. Không giữ code đã bỏ bằng cách comment cả khối.
- Tiếp nối quy tắc lỗi ở Mục 3: middleware/controller kết thúc nhánh trả response bằng `return` và không gọi tiếp `next()` sau khi gửi response. Lỗi cần xử lý tập trung chuyển qua `next(error)`; middleware xác thực/phân quyền có thể trả trực tiếp 401/403 theo contract.
- Service throw `Error` có `statusCode` và `code` khi contract nghiệp vụ cần; giữ mã lỗi hiện có. Chỉ `catch` khi có xử lý thực sự như rollback/cleanup/chuyển lỗi, sau đó throw lại nếu tầng trên cần xử lý; không nuốt lỗi hoặc đổi mọi lỗi thành HTTP 200.
- Tái sử dụng `BE/src/middleware/errorHandler.js` cho lỗi tập trung và định dạng `{ success: false, message, code? }`; response thành công giữ contract từng endpoint (`data`, metadata phân trang...). Lỗi 5xx dùng thông báo an toàn, không trả stack trace hoặc chi tiết database.
- Frontend dùng error state, `Notification`/alert theo giao diện hiện có và cho phép thử lại khi phù hợp; log chẩn đoán không thay thế thông báo người dùng. Không ghi token, mật khẩu hoặc payload nhạy cảm vào log.

### 2.7. File tham chiếu khi áp dụng

Đây là điểm bắt đầu khảo sát, không thay thế việc đọc file cùng loại của chức năng đang làm. File cũ có thể còn khác mẫu mới, đặc biệt phần khai báo middleware ở Mục 2.4.

| Quy ước cần đối chiếu | File hiện có |
| --- | --- |
| Middleware tách khai báo/export; middleware phân quyền | [errorHandler.js](BE/src/middleware/errorHandler.js), [requireCatalogOperator.js](BE/src/middleware/requireCatalogOperator.js) |
| Controller và contract response | [orderController.js](BE/src/controllers/admin/orderController.js) |
| Service, model và quan hệ | [categoryService.js](BE/src/services/admin/categoryService.js), [categoryModel.js](BE/src/models/categoryModel.js), [models/index.js](BE/src/models/index.js) |
| Route và validator | [orderRoutes.js](BE/src/routes/admin/orderRoutes.js), [adminOrderValidators.js](BE/src/validators/adminOrderValidators.js) |
| Component, page và hook | [orderStatusTabs.jsx](FE/my-app/src/components/admin/orders/orderStatusTabs.jsx), [orderManagement.jsx](FE/my-app/src/pages/admin/orders/orderManagement.jsx), [useProductSearch.js](FE/my-app/src/hooks/client/useProductSearch.js) |
| Frontend service và helper | [httpClient.js](FE/my-app/src/services/api/httpClient.js), [orderService.js](FE/my-app/src/services/api/admin/orderService.js), [formatCurrency.js](FE/my-app/src/utils/formatCurrency.js) |
| Cấu hình lint và alias | [eslint.config.js](FE/my-app/eslint.config.js), [vite.config.js](FE/my-app/vite.config.js), [jsconfig.json](FE/my-app/jsconfig.json) |

---

## 3. Quy tắc chung dành cho Agent

- **Ngữ cảnh Đường dẫn (Path Context)**: Chú ý kỹ đến ngữ cảnh thư mục. Chạy các tác vụ frontend tuyệt đối trong `FE/my-app` và tác vụ backend tuyệt đối trong `BE`.
- **Tính Nhất quán**: Trước khi tạo ra một cấu trúc hoặc tiện ích mới, hãy kiểm tra codebase hiện tại để đảm bảo bạn không làm trùng lặp công việc hoặc đi chệch khỏi các quy ước đã được thiết lập.
- **Xử lý Lỗi (Error Handling)**: 
  - **Backend**: Triển khai các khối try-catch trong các async controller. Trả về các phản hồi lỗi có cấu trúc cùng với các mã trạng thái HTTP phù hợp (400, 401, 403, 404, 500).
  - **Frontend**: Xử lý các lỗi gọi API một cách khéo léo. Hiển thị thông báo lỗi thân thiện với người dùng (ví dụ: sử dụng thông báo dạng toast) thay vì làm ứng dụng bị đứng hoặc vỡ giao diện.
- **Biến Môi trường (Environment Variables)**: Không bao giờ hardcode các thông tin mật. Luôn sử dụng `process.env` và ghi chép lại các biến môi trường mới cần thiết vào file `.env.example` nếu có.
- **Đặt tên file mã nguồn**: Đặt tên file mã nguồn (code) theo dạng camelCase (riêng file tài liệu trong `docs/`, bắt buộc tuân theo quy tắc đặt tên tại Mục 4).
- **Phong cách code**: Ưu tiên xử lý logic đơn giản dễ hiểu dễ mở rộng hệ thống sau này, hạn chế xử lý logic phức tạp nếu thật sự không cần thiết, clean code không rườm rà gây khó hiểu.
### Quy tắc vận hành tự động
- **Lệnh tự động hóa**: `agy --dangerously-skip-permissions`

---

## 4. Documentation Management Rules (Quy tắc Quản lý Tài liệu)

Tất cả AI Agent và lập trình viên làm việc trên TechStore bắt buộc phải tuân thủ nghiêm ngặt các quy tắc quản lý tài liệu dưới đây. Quy tắc này đảm bảo hệ thống tài liệu có tính nhất quán cao, dễ quản lý, dễ đối chiếu và dễ duy trì qua nhiều lượt phát triển.

### 4.1. Cấu trúc thư mục chuẩn

```text
TechStore/
├── .agentrules.md
├── AGENTS.md
└── docs/
    ├── adr/
    ├── agents/
    ├── interviews/
    │   ├── YYYY-MM-DD-ten-task-interview.md
    │   └── ...
    ├── task-plans/
    │   ├── YYYY-MM-DD-ten-task-plan.md
    │   └── ...
    ├── code-changes/
    │   ├── YYYY-MM-DD-ten-task-change-log.md
    │   └── ...
    ├── code-reviews/
    │   ├── YYYY-MM-DD-ten-task-code-review.md
    │   └── ...
    └── [Các tài liệu tổng quan khác: ADR, Master Plan]
```

- **`docs/interviews/`**: Chuyên biệt quản lý các tài liệu phỏng vấn, làm rõ yêu cầu nghiệp vụ, cây quyết định và ranh giới giải pháp trước khi lập kế hoạch.
- **`docs/task-plans/`**: Chuyên biệt quản lý các tài liệu kế hoạch triển khai task trước khi viết mã nguồn.
- **`docs/code-changes/`**: Chuyên biệt quản lý các báo cáo phản ánh thay đổi mã nguồn đã thực sự được triển khai sau khi code.
- **`docs/code-reviews/`**: Chuyên biệt quản lý các báo cáo đánh giá mã nguồn (Code Review độc lập theo hai trục Standards & Spec, kiểm định bảo mật, chất lượng code).
- **Tài liệu khác**: Các tài liệu ADR (`docs/adr/`), tài liệu dành cho agent (`docs/agents/`), kế hoạch tổng thể (Master Plan) được lưu giữ tại các thư mục chuyên biệt phù hợp hiện có, không được tự ý ép vào bốn thư mục trên.

---

### RULE 0 — Phỏng vấn và làm rõ yêu cầu trước khi lập kế hoạch (Interview Documentation)

Khi bắt đầu một tính năng mới, nghiệp vụ phức tạp hoặc tác vụ có nhiều phương án và đánh đổi:
1. **Tiến hành phỏng vấn làm rõ**: Khảo sát hiện trạng mã nguồn, đặt câu hỏi làm rõ theo cây quyết định (tận dụng kỹ thuật grilling / interview) để chốt ranh giới, điều kiện biên và hành vi mong đợi.
2. **Lưu trữ tài liệu phỏng vấn**: Tạo tài liệu tại `docs/interviews/YYYY-MM-DD-ten-task-interview.md`.
3. **Yêu cầu nội dung của tài liệu phỏng vấn**:
   - Mục tiêu và phương pháp phỏng vấn.
   - Hiện trạng hệ thống và bằng chứng mã nguồn đã khảo sát.
   - Cây quyết định và các vòng câu hỏi – câu trả lời cụ thể (Q1, Q2...).
   - Danh sách quyết định đã chốt (ranh giới làm / không làm, quy tắc hiển thị, bảo mật, điều kiện hủy, dữ liệu truy vết...).
   - Trạng thái chốt chuyển giao sang bước lập kế hoạch.
4. **Không tạo tài liệu phỏng vấn thừa**: Không bắt buộc tạo file phỏng vấn riêng cho các tác vụ sửa lỗi nhỏ, refactor cục bộ hoặc task đã có đặc tả yêu cầu chi tiết rõ ràng.
5. **Tiền đề cho kế hoạch**: Kết quả phỏng vấn là cơ sở đầu vào trực tiếp để xây dựng kế hoạch triển khai tại `docs/task-plans/`.

---

### RULE 1 — Quản lý kế hoạch trước khi code (Task Plan Management)

Khi bắt đầu một task phát triển chức năng, sửa lỗi có thay đổi đáng kể hoặc refactor:
1. **Kiểm tra kế hoạch hiện có**: Rà soát thư mục `docs/task-plans/` để kiểm tra đã có tài liệu kế hoạch cho task này chưa.
2. **Sử dụng lại nếu đã có**: Nếu kế hoạch đã tồn tại và còn phù hợp, đọc kỹ và tiếp tục thực hiện dựa trên kế hoạch đó.
3. **Tạo kế hoạch mới nếu chưa có**: Nếu chưa có, lập tài liệu kế hoạch hoàn chỉnh tại `docs/task-plans/YYYY-MM-DD-ten-task-plan.md`.
4. **Yêu cầu nội dung của kế hoạch**:
   - Mục tiêu và vấn đề cần giải quyết.
   - Hiện trạng chức năng và mã nguồn liên quan.
   - Phạm vi thực hiện (những gì làm và những gì không làm).
   - Danh sách file dự kiến tạo mới hoặc chỉnh sửa.
   - Giải pháp kỹ thuật và lý do lựa chọn.
   - Các bước thực hiện cụ thể (lộ trình kỹ thuật).
   - Rủi ro, ràng buộc và trường hợp ngoại lệ.
   - Tiêu chí nghiệm thu có thể đo lường, kiểm chứng được.
   - Phương pháp kiểm thử dự kiến.
5. **Không tạo kế hoạch trùng lặp**: Tuyệt đối không tạo file kế hoạch mới khi file cũ cho cùng task đã tồn tại.
6. **Ngoại lệ**: Không bắt buộc tạo kế hoạch riêng cho những thao tác rất nhỏ, sửa lỗi chính tả, chỉnh sửa format không ảnh hưởng logic hoặc hành vi hệ thống, trừ khi người dùng yêu cầu.

Kế hoạch đóng vai trò là **tài liệu chuẩn để đối chiếu kết quả sau khi code**.

---

### RULE 2 — Ghi nhận thay đổi sau khi code (Code Change Documentation)

Sau khi hoàn thành việc triển khai mã nguồn:
1. **Rà soát diff thực tế**: Kiểm tra toàn bộ `git diff` (bao gồm staged, unstaged và untracked files).
2. **Tạo hoặc cập nhật báo cáo**: Tạo mới hoặc cập nhật tài liệu báo cáo tại `docs/code-changes/YYYY-MM-DD-ten-task-change-log.md`.
3. **Danh sách file chính xác**: Liệt kê đầy đủ mọi file mã nguồn đã thêm, sửa hoặc xóa.
4. **Phân tích chi tiết từng file**:
   - Nội dung thay đổi cụ thể của từng file (hàm, component, route, migration...).
   - So sánh logic trước và sau khi thay đổi.
   - Mục đích của đoạn code và tác dụng cốt lõi đối với hệ thống.
   - Lý do lựa chọn phương án triển khai.
   - Ảnh hưởng đến frontend, backend, API, database hoặc kiến trúc hệ thống.
5. **Đối chiếu với kế hoạch ban đầu**: So sánh trực tiếp kết quả triển khai với từng tiêu chí nghiệm thu đã đề ra trong kế hoạch tương ứng.
6. **Ghi nhận kết quả kiểm thử thực tế**: Trình bày rõ các ca kiểm thử đã chạy, lệnh test/lint/build và bằng chứng đạt/chưa đạt.
7. **Nêu rõ phần hoàn thành và chưa hoàn thành**: Ghi rõ những gì đã làm xong, những gì chưa xong hoặc chưa được kiểm chứng.
8. **Tuyệt đối trung thực**: Không chấp nhận mô tả chung chung như "đã tối ưu code", "đã cải thiện hệ thống" hay "đã sửa lỗi" mà không có bằng chứng mã nguồn cụ thể. Không được ghi nhận một chức năng là đã hoàn thành khi chưa có bằng chứng tương ứng.

---

### RULE 3 — Đặt tên tài liệu theo ngày tạo (Document Naming by Creation Date)

1. **Định dạng chuẩn bắt buộc**:
   - Phỏng vấn: `docs/interviews/YYYY-MM-DD-ten-task-interview.md`
   - Kế hoạch: `docs/task-plans/YYYY-MM-DD-ten-task-plan.md`
   - Báo cáo thay đổi: `docs/code-changes/YYYY-MM-DD-ten-task-change-log.md`
   - Báo cáo đánh giá (Code Review): `docs/code-reviews/YYYY-MM-DD-ten-task-code-review.md`
2. **Quy tắc ngày tháng (YYYY-MM-DD)**:
   - **Bắt buộc sử dụng ngày tạo gốc của từng tài liệu.**
   - Tuyệt đối không lấy ngày hiện tại khi AI chạy task để thay thế ngày tạo gốc.
   - Không lấy ngày di chuyển file, ngày đổi tên file, ngày sửa đổi cuối cùng hay ngày commit gần nhất làm ngày tạo.
   - Đối với tài liệu cũ, phải xác minh ngày tạo dựa trên đối chiếu đa nguồn: metadata `CreationTime`, ngày ghi trong nội dung tài liệu, lịch sử Git (commit đầu tiên thêm file), và các bằng chứng liên quan.
   - Nếu có bằng chứng mâu thuẫn hoặc không xác định được ngày đủ tin cậy: không suy đoán, giữ nguyên tên file và báo cáo người dùng xử lý.
3. **Quy tắc tên task (`ten-task`)**:
   - Sử dụng chữ thường, không dấu tiếng Việt.
   - Các từ phân cách bằng dấu gạch nối (`-`).
   - Tên ngắn gọn nhưng mô tả được chức năng cụ thể.
   - **Bắt buộc dùng cùng một tên task cho cả phỏng vấn, kế hoạch, báo cáo thay đổi và báo cáo đánh giá (code review)** của task đó (ngày tạo có thể khác nhau theo tiến độ thực tế, nhưng `ten-task` phải thống nhất xuyên suốt vòng đời task).
   - Không tự ý thêm hậu tố `final`, `new`, `latest`, `fixed`, `v2`.
   - Không tạo bản sao file chỉ để thể hiện phiên bản mới.
4. **Khi chỉnh sửa tài liệu cũ**:
   - Giữ nguyên ngày trong tên file gốc.
   - Không lấy ngày chỉnh sửa làm ngày tạo.
   - Không đổi tên task nếu không có lý do hợp lệ.
   - Nếu task kéo dài qua nhiều ngày, cập nhật nội dung file hiện có và ghi nhận lịch sử chỉnh sửa bên trong nội dung tài liệu.

---

### RULE 4 — Đồng bộ kế hoạch và kết quả (Plan & Execution Synchronization)

Kế hoạch trong `docs/task-plans/` là cơ sở nghiệm thu cho báo cáo trong `docs/code-changes/`.
1. **Báo cáo thay đổi phải chỉ rõ**:
   - Tiêu chí đã đạt (kèm bằng chứng test/code).
   - Tiêu chí chưa đạt.
   - Tiêu chí chưa được kiểm chứng (nêu rõ giới hạn môi trường/hạ tầng).
   - Các thay đổi phát sinh ngoài kế hoạch ban đầu.
   - Nguyên nhân và lý do của mọi sai lệch đáng kể.
2. **Không bóp méo tiêu chí**: Tuyệt đối không tự động chỉnh sửa tiêu chí trong file kế hoạch sau khi code chỉ để biến kết quả chưa đạt thành đạt.
3. **Truy vết thay đổi**: Khi yêu cầu nghiệp vụ thực sự thay đổi từ phía người dùng, ghi nhận rõ sự điều chỉnh và lý do trong cả kế hoạch và báo cáo thay đổi để đảm bảo khả năng truy vết hoàn chỉnh.

---

### RULE 5 — Cấu trúc thư mục cố định (Fixed Directory Structure)

1. Mọi tài liệu phỏng vấn mới bắt buộc lưu tại: `docs/interviews/`.
2. Mọi tài liệu kế hoạch task mới bắt buộc lưu tại: `docs/task-plans/`.
3. Mọi báo cáo thay đổi mã nguồn mới bắt buộc lưu tại: `docs/code-changes/`.
4. Mọi báo cáo đánh giá mã nguồn (Code Review) mới bắt buộc lưu tại: `docs/code-reviews/`.
5. Tuyệt đối không lưu bốn loại tài liệu này trực tiếp ở thư mục gốc `docs/`.
6. Không tùy tiện tạo thêm các thư mục mới ngoài bốn thư mục này nếu không có yêu cầu đặc biệt.
7. Các tài liệu khác (ADR, Agent docs, Master Plan) được duy trì tại vị trí quy định của chúng.

---

### RULE 6 — Áp dụng cho tất cả AI Agent (Universal Agent Compliance)

1. Mọi AI Agent (Gemini, Claude, GPT, Cursor, v.v.) làm việc trong repository TechStore bắt buộc tuân thủ toàn bộ các quy tắc này.
2. File `AGENTS.md` ở thư mục gốc dự án là cổng chỉ dẫn dành cho các Agent, có liên kết trỏ tới `.agentrules.md`.
3. Khi cấu hình hoặc tích hợp công cụ mới, luôn đảm bảo Agent nạp và áp dụng đúng nội dung `.agentrules.md` theo cơ chế instruction phù hợp mà công cụ đó hỗ trợ.
4. Tuyệt đối không tạo ra các hướng dẫn mâu thuẫn hoặc ghi đè các nguyên tắc chuẩn hóa tài liệu đã thiết lập.

---

### RULE 7 — An toàn với Git và Worktree (Git & Worktree Safety)

1. **Bảo vệ thay đổi chưa commit**: Không ghi đè hoặc làm mất thay đổi chưa commit của người dùng.
2. **Bảo vệ file của agent khác**: Không xóa file đang được sử dụng hoặc vừa tạo bởi agent khác.
3. **Kiểm tra Git trước và sau**: Luôn chạy `git status` trước khi bắt đầu và sau khi hoàn thành để kiểm soát phạm vi thay đổi.
4. **Không tự ý thực hiện lệnh Git nguy hiểm**: Không tự ý `git commit`, `git push`, `git merge`, `git reset`, `git checkout -f` trừ khi có chỉ thị rõ ràng từ người dùng.
5. **Giới hạn phạm vi**: Chỉ chỉnh sửa file trong phạm vi được yêu cầu; không can thiệp mã nguồn frontend, backend hay database khi thực hiện tác vụ chuẩn hóa tài liệu.
6. **Quy tắc Worktree**: Khi làm việc trong một Git worktree, tuyệt đối chỉ thao tác trên các file thuộc worktree hiện tại, không tự ý can thiệp vào worktree hoặc branch khác.

---

### 4.2. Cấu trúc chi tiết của Báo cáo thay đổi mã nguồn (`docs/code-changes/`)

Mỗi báo cáo thay đổi mã nguồn trong `docs/code-changes/YYYY-MM-DD-ten-task-change-log.md` bắt buộc tuân theo cấu trúc 6 phần:

#### A. Tổng quan chức năng
- Yêu cầu ban đầu.
- Vấn đề cần giải quyết.
- Chức năng hoặc hành vi đã triển khai thực tế.
- Kết quả đạt được và mốc đối chiếu commit/diff.

#### B. Danh sách file mã nguồn thay đổi
Bảng tổng hợp đầy đủ các file đã tạo mới, sửa hoặc xóa:
| File | Loại thay đổi | Thành phần thay đổi | Mục đích |
| --- | --- | --- | --- |
| Đường dẫn file | Tạo mới / Sửa / Xóa | Tên function, class, component... | Mục đích ngắn gọn |

#### C. Phân tích chi tiết TỪNG FILE CODE
Với mỗi file trong bảng B, trình bày đầy đủ:
1. **Thông tin file**: Đường dẫn đầy đủ, vai trò trong hệ thống, trạng thái (tạo mới/sửa/xóa).
2. **Nội dung code đã thêm hoặc chỉnh sửa**:
   - **Đã thay đổi gì?** Mô tả chính xác logic mới, logic chỉnh sửa hoặc xóa bỏ.
   - **Logic hoạt động như thế nào?** Giải thích từng bước xử lý, dữ liệu vào, điều kiện kiểm tra, dữ liệu ra.
   - **Mục đích của logic là gì?** Đoạn code giải quyết vấn đề cụ thể nào?
   - **Phục vụ chức năng nào?** Logic hỗ trợ nghiệp vụ nào?
   - **Tại sao lựa chọn phương án này?** Lý do kỹ thuật, đánh đổi giữa các phương án.
   - **Tác dụng cốt lõi là gì?** Trách nhiệm quan trọng nhất và rủi ro nếu thiếu đoạn code.
   - **Ảnh hưởng đến code khác?** Các file, API, model, component liên quan.
   - **So sánh trước/sau (đối với code sửa)**: Trước sửa hoạt động ra sao, sau sửa hoạt động thế nào.

#### D. Giải thích luồng xử lý tổng thể
Mô tả cách các file phối hợp qua các tầng: `Frontend → Route → Validator → Controller → Service → Model → Database`.

#### E. Đánh giá phương án triển khai
Đánh giá tính phù hợp kiến trúc, sự tinh giản logic, kiểm soát trùng lặp, bảo mật, hiệu năng, toàn vẹn dữ liệu và các giới hạn kỹ thuật.

#### F. Kiểm thử và nghiệm thu
- Trường hợp kiểm thử, kết quả mong đợi, kết quả thực tế.
- Các lệnh test/build/lint đã chạy.
- Các vấn đề còn tồn tại hoặc giới hạn môi trường chưa kiểm chứng.
- Đối chiếu cụ thể với từng tiêu chí trong file kế hoạch tại `docs/task-plans/`.

---

### 4.3. Cấu trúc chi tiết của Kế hoạch triển khai task (`docs/task-plans/`)

Mỗi tài liệu kế hoạch trong `docs/task-plans/YYYY-MM-DD-ten-task-plan.md` bắt buộc phải có đầy đủ 9 thành phần sau đây trước khi bắt đầu code:

1. **Mục tiêu và vấn đề cần giải quyết**: Nêu rõ bối cảnh, lỗ hổng, lỗi cần sửa hoặc chức năng cần phát triển mới.
2. **Hiện trạng chức năng và mã nguồn liên quan**: Khảo sát mã nguồn thực tế tại thời điểm lập kế hoạch, chỉ rõ các file, router, hook, component và những điểm rò rỉ, thiếu sót.
3. **Phạm vi thực hiện (Scope Boundaries)**: Phân định rõ ràng những gì nằm trong phạm vi bàn giao và những gì tuyệt đối không được tự ý mở rộng ngoài phạm vi.
4. **Danh sách file dự kiến tạo mới hoặc chỉnh sửa**: Bảng danh sách các file backend, frontend, database, test dự kiến tác động.
5. **Giải pháp kỹ thuật và lý do lựa chọn**: Kiến trúc, pattern, thuật toán và giải thích sự đánh đổi giữa các phương án.
6. **Lộ trình các bước thực hiện cụ thể**: Trình tự triển khai từng lát cắt kỹ thuật (áp dụng TDD: Red → Green → Refactor).
7. **Rủi ro, ràng buộc và trường hợp ngoại lệ**: Các tình huống lỗi mạng, quyền hạn, dữ liệu biên, xung đột concurrency và cách phòng ngừa.
8. **Tiêu chí nghiệm thu có thể đo lường (Acceptance Criteria)**: Tiêu chí cụ thể, rõ ràng, có thể kiểm chứng được (dùng làm cơ sở nghiệm thu cho bước sau khi code).
9. **Phương pháp kiểm thử dự kiến**: Các bài kiểm thử unit test, integration test, kiểm tra giao diện, lệnh test/lint/build dự kiến chạy.

---

### 4.4. Cấu trúc chi tiết của Tài liệu phỏng vấn (`docs/interviews/`)

Mỗi tài liệu phỏng vấn trong `docs/interviews/YYYY-MM-DD-ten-task-interview.md` ghi nhận quá trình làm rõ yêu cầu nghiệp vụ qua các vòng:

1. **Mục tiêu và phương pháp phỏng vấn**: Vấn đề cần làm rõ với người dùng/chủ sở hữu sản phẩm trước khi lập kế hoạch.
2. **Hiện trạng hệ thống đã khảo sát**: Bằng chứng mã nguồn, database enum/schema, hành vi giao diện trước phỏng vấn.
3. **Cây quyết định và các vòng câu hỏi – câu trả lời**: Các vòng phỏng vấn (Q1, Q2, Q3...), ghi nhận các phương án đề xuất và câu trả lời chính thức của người dùng.
4. **Bản tổng hợp quyết định đã chốt**: Danh sách toàn bộ các quyết định chính thức (phạm vi, quy tắc dữ liệu, bảo mật, điều kiện hủy, dữ liệu hiển thị...).
5. **Chuyển giao sang lập kế hoạch**: Tuyên bố hoàn tất phỏng vấn và chuyển giao làm căn cứ cho tài liệu kế hoạch tại `docs/task-plans/`.

---

### 4.5. Cấu trúc chi tiết của Báo cáo đánh giá mã nguồn / Code Review (`docs/code-reviews/`)

Mỗi báo cáo đánh giá mã nguồn trong `docs/code-reviews/YYYY-MM-DD-ten-task-code-review.md` (khi thực hiện review độc lập theo hai trục Standards & Spec hoặc kiểm định bảo mật, chất lượng code) bắt buộc có các thành phần sau:

1. **Tiêu đề và Metadata đầu trang**:
   - Tiêu đề: `# <TASK-ID> — Code Review <Tên nghiệp vụ>`.
   - Ngày tạo tài liệu (`YYYY-MM-DD`).
   - Đường dẫn liên kết nội bộ tới tài liệu đặc tả/kế hoạch (`docs/task-plans/YYYY-MM-DD-ten-task-plan.md`).
   - Đường dẫn liên kết nội bộ tới báo cáo thay đổi mã nguồn (`docs/code-changes/YYYY-MM-DD-ten-task-change-log.md`).
   - Danh sách tiêu chuẩn đối chiếu (`.agentrules.md`, `AGENTS.md`, `README.md`, các ADR liên quan).
2. **Phạm vi và mốc cố định (Scope & Baseline)**:
   - Commit hash mốc trước triển khai (fixed point), lệnh diff cụ thể (ví dụ `git diff <hash>...HEAD` hoặc diff working tree).
   - Danh sách file mã nguồn trong phạm vi đánh giá (phân biệt rõ file tracked, file mới untracked).
   - Ranh giới phạm vi: chỉ rõ những thay đổi có sẵn hoặc file ngoài task không gộp vào review.
   - Phương thức review: chạy hai trục độc lập Standards và Spec (qua subagent song song hoặc reviewer độc lập).
3. **Trục Tiêu chuẩn (Standards)**:
   - Đánh giá sự tuân thủ các quy tắc trong `.agentrules.md`, kiến trúc 3 lớp (Route - Controller - Service - Model), bảo mật, validation.
   - Rà soát các "code smells" theo baseline Martin Fowler (Mysterious Name, Duplicated Code, Feature Envy, Speculative Generality, v.v.).
   - Kiểm tra chất lượng tài liệu đi kèm (change-log đủ A–F, link Markdown nội bộ, baseline AC).
   - Số lượng findings của trục Standards và danh sách các điểm cần khắc phục (nếu có).
4. **Trục Đặc tả (Spec)**:
   - Đối chiếu từng tiêu chí nghiệm thu (Acceptance Criteria) trong kế hoạch với mã nguồn thực tế.
   - Rà soát 3 khía cạnh: (a) yêu cầu spec bị thiếu hoặc chưa hoàn thiện; (b) hành vi ngoài spec (scope creep); (c) yêu cầu trông như đã làm nhưng triển khai sai logic.
   - Nêu rõ các giới hạn kiểm chứng (Verification Limits): ví dụ môi trường test cô lập, chưa test trình duyệt/UI thật, v.v.
   - Số lượng findings của trục Spec.
5. **Bằng chứng kiểm chứng thực tế (Verification Evidence)**:
   - Kết quả chạy test tự động (số lượng test pass/fail/skip, thời gian chạy).
   - Kết quả kiểm tra cú pháp (`node --check`, lint nếu có).
   - Kết quả kiểm tra định dạng và khoảng trắng (`git diff --check`).
   - Kết quả kiểm tra liên kết Markdown nội bộ (`0 broken links`).
   - Liệt kê trung thực các giới hạn môi trường chưa kiểm chứng được.
6. **Kết luận theo hai trục**:
   - Tóm tắt độc lập kết quả hai trục: số lượng finding của Standards và Spec (không gộp chung làm lu mờ sai lệch).
   - Kết luận rõ ràng: Đạt / Cần sửa chữa / Không đạt.

---

### 4.6. Bảng kiểm nghiệm thu tài liệu bắt buộc dành cho Agent (Checklist)

Một tác vụ phát triển hoặc chỉnh sửa mã nguồn chỉ được coi là hoàn thành khi Agent xác nhận đạt đủ 8 điều kiện kiểm tra dưới đây:

- [ ] **1. Kế hoạch trước khi code**: Đã kiểm tra hoặc tạo mới tài liệu kế hoạch hoàn chỉnh tại `docs/task-plans/YYYY-MM-DD-ten-task-plan.md` (nếu là task phức tạp có phỏng vấn, đã có `docs/interviews/YYYY-MM-DD-ten-task-interview.md`).
- [ ] **2. Báo cáo thay đổi sau khi code**: Đã tạo hoặc cập nhật báo cáo thay đổi tại `docs/code-changes/YYYY-MM-DD-ten-task-change-log.md`.
- [ ] **3. Phân tích chi tiết từng file code**: Liệt kê chính xác mọi file thêm, sửa, xóa; có phân tích logic trước/sau, mục đích, lý do và tác dụng cốt lõi; không mô tả chung chung.
- [ ] **4. Đối chiếu trung thực với kế hoạch**: Báo cáo thay đổi đã đối chiếu rõ ràng từng tiêu chí nghiệm thu của kế hoạch (chỉ rõ tiêu chí đạt, chưa đạt, chưa kiểm chứng); không sửa tiêu chí kế hoạch sau khi code để tạo kết quả đạt giả.
- [ ] **5. Chuẩn hóa tên và ngày tạo gốc**: Sử dụng đúng ngày tạo gốc thực tế và dùng chung một `ten-task` chữ thường không dấu xuyên suốt các tài liệu interview, plan, change-log và code-review.
- [ ] **6. Bảo toàn liên kết tham chiếu**: Tất cả các đường link Markdown nội bộ trỏ tới file mã nguồn, file tài liệu, glossary và ADR đều tồn tại, không bị gãy link (`0 broken links`).
- [ ] **7. Lưu trữ báo cáo Code Review đúng vị trí (nếu có review)**: Mọi báo cáo đánh giá mã nguồn độc lập bắt buộc lưu tại `docs/code-reviews/YYYY-MM-DD-ten-task-code-review.md`, đánh giá đầy đủ hai trục Standards & Spec và lưu trữ trong thư mục chuyên biệt `docs/code-reviews/`.
- [ ] **8. Tuân thủ an toàn Git & Worktree**: Không tự ý `commit`, `push`, `merge`, `reset`; không can thiệp file ngoài phạm vi task; không ghi đè thay đổi chưa commit của người dùng.


