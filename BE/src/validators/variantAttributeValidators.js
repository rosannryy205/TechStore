const { body, validationResult } = require("express-validator");

const createAttributeRules = () => [
  body("name")
    .notEmpty()
    .withMessage("Tên thuộc tính không được để trống")
    .isString()
    .withMessage("Tên thuộc tính phải là chuỗi"),
  body("display_name")
    .notEmpty()
    .withMessage("Tên hiển thị không được để trống"),
  body("type")
    .optional()
    .isIn(["select", "text"])
    .withMessage("Loại phải là 'select' hoặc 'text'"),
  body("options")
    .optional()
    .isArray()
    .withMessage("Options phải là một mảng"),
];

const addOptionRules = () => [
  body("value").notEmpty().withMessage("Giá trị không được để trống"),
  body("sort_order")
    .optional()
    .isInt()
    .withMessage("Thứ tự sắp xếp phải là số nguyên"),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  createAttributeRules,
  addOptionRules,
  handleValidationErrors,
};
