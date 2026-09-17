const { body, validationResult } = require("express-validator");

const createBrandRules = () => {
  return [
    body("name").trim().notEmpty().withMessage("Tên thương hiệu không được để trống"),
    body("slug").trim().notEmpty().withMessage("Đường dẫn (slug) không được để trống"),
    body("status").optional().isInt({ min: 0, max: 1 }).withMessage("Trạng thái phải là 0 hoặc 1"),
  ];
};

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

module.exports = {
  createBrandRules,
  handleValidationErrors,
};

