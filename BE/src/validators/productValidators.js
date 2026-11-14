const {
  body,
  query,
  matchedData,
  validationResult,
} = require("express-validator");
const { normalizeProductKeyword } = require("../utils/productSearchQuery");

// Chỉ validate cấu trúc ở đây; ký tự cấm là kết quả rỗng theo nghiệp vụ tìm kiếm.
const listProductRules = () => [
  query("q")
    .optional()
    .isString()
    .bail()
    .customSanitizer(normalizeProductKeyword)
    .isLength({ max: 100 })
    .withMessage("Từ khóa tối đa 100 ký tự."),
  ...["category", "brand"].map((field) =>
    query(field).optional().isString().bail().isLength({ max: 255 }),
  ),
  query("price")
    .optional()
    .isString()
    .bail()
    .isIn(["all", "under-10m", "10m-20m", "20m-30m", "above-30m"]),
  query("sale").optional().isString().bail().isIn(["true", "false"]),
  query("sort")
    .optional()
    .isString()
    .bail()
    .isIn(["newest", "price_asc", "price_desc", "popular"]),
  // Query lặp (limit=1&limit=2) được Express parse thành mảng: phải từ chối
  // trước toInt, nếu không Service có thể nhận mảng thay vì số và sinh lỗi SQL.
  query("page")
    .optional()
    .isString()
    .bail()
    .isInt({ min: 1, max: Number.MAX_SAFE_INTEGER })
    .toInt(),
  query("limit")
    .optional()
    .isString()
    .bail()
    .isInt({ min: 1, max: 100 })
    .toInt(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({
        success: false,
        message:
          errors.array()[0].msg === "Invalid value"
            ? "Tham số tìm kiếm không hợp lệ."
            : errors.array()[0].msg,
        errors: errors.array(),
      });
    // Express 5 dùng getter cho req.query; lấy dữ liệu đã sanitize từ validator,
    // không gán đè req.query vì giá trị có thể bị parse lại và mất chuẩn hóa.
    res.locals.productQuery = matchedData(req, { locations: ["query"] });
    next();
  },
];

const createProductRules = () => {
  return [
    body("name").notEmpty().withMessage("Tên sản phẩm không được để trống"),
    body("category_id").isInt().withMessage("Danh mục không hợp lệ"),
    body("brand_id").isInt().withMessage("Thương hiệu không hợp lệ"),
    body("description").notEmpty().withMessage("Mô tả không được để trống"),
    body("variants")
      .optional()
      .custom((value) => {
        if (typeof value === "string") {
          try {
            JSON.parse(value);
          } catch (error) {
            throw new Error("Variants phải là chuỗi JSON hợp lệ");
          }
        }
        return true;
      }),
  ];
};

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  listProductRules,
  createProductRules,
  handleValidationErrors,
};
