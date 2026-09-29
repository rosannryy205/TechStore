const variantAttributeService = require("../../services/admin/variantAttributeService");

const getAllAttributes = async (req, res, next) => {
  try {
    const attributes = await variantAttributeService.getAllAttributes();
    return res.status(200).json({ success: true, data: attributes });
  } catch (error) {
    next(error);
  }
};

const createAttribute = async (req, res, next) => {
  try {
    const attr = await variantAttributeService.createAttribute(req.body);
    return res
      .status(201)
      .json({ message: "Tạo thuộc tính thành công", data: attr });
  } catch (error) {
    next(error);
  }
};

const updateAttribute = async (req, res, next) => {
  try {
    const attr = await variantAttributeService.updateAttribute(
      req.params.id,
      req.body,
    );
    return res
      .status(200)
      .json({ message: "Cập nhật thuộc tính thành công", data: attr });
  } catch (error) {
    next(error);
  }
};

const deleteAttribute = async (req, res, next) => {
  try {
    const result = await variantAttributeService.deleteAttribute(req.params.id);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const addOption = async (req, res, next) => {
  try {
    const option = await variantAttributeService.addOption(
      req.params.id,
      req.body,
    );
    return res
      .status(201)
      .json({ message: "Thêm tùy chọn thành công", data: option });
  } catch (error) {
    next(error);
  }
};

const updateOption = async (req, res, next) => {
  try {
    const option = await variantAttributeService.updateOption(
      req.params.optionId,
      req.body,
    );
    return res
      .status(200)
      .json({ message: "Cập nhật tùy chọn thành công", data: option });
  } catch (error) {
    next(error);
  }
};

const deleteOption = async (req, res, next) => {
  try {
    const result = await variantAttributeService.deleteOption(
      req.params.optionId,
    );
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAttributes,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  addOption,
  updateOption,
  deleteOption,
};
