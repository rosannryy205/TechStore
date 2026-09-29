const { body, validationResult } = require("express-validator");

const createProductRules = () => {
  return [
    body("name").notEmpty().withMessage("Tên sản phẩm không được để trống"),
    body("category_id").isInt().withMessage("Danh mục không hợp lệ"),
    body("brand_id").isInt().withMessage("Thương hiệu không hợp lệ"),
    body("description").notEmpty().withMessage("Mô tả không được để trống"),
    body("variants").optional().custom((value) => {
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
  createProductRules,
  handleValidationErrors,
};
