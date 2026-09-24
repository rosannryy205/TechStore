const { body, validationResult } = require("express-validator");

const createCategoryRules = () => {
  return [
    body("name").trim().notEmpty().withMessage("Tên danh mục không được để trống"),
    body("slug").trim().notEmpty().withMessage("Slug không được để trống"),
    body("status").optional().isInt({ min: 0, max: 1 }).withMessage("Trạng thái phải là 0 hoặc 1"),
    body("brandIds").optional().isArray().withMessage("brandIds phải là một mảng"),
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
  createCategoryRules,
  handleValidationErrors,
};