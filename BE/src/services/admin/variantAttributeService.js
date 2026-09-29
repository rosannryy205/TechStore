const {
  sequelize,
  VariantAttribute,
  VariantAttributeOption,
} = require("../../models");

const getAllAttributes = async () => {
  return VariantAttribute.findAll({
    where: { status: 1 },
    include: [
      {
        model: VariantAttributeOption,
        as: "options",
        where: { status: 1 },
        required: false,
      },
    ],
    order: [
      ["sort_order", "ASC"],
      [{ model: VariantAttributeOption, as: "options" }, "sort_order", "ASC"],
    ],
  });
};

const createAttribute = async ({ name, display_name, type, options }) => {
  return sequelize.transaction(async (t) => {
    const existing = await VariantAttribute.findOne({
      where: { name },
      transaction: t,
    });
    if (existing) {
      throw new Error(`Thuộc tính "${name}" đã tồn tại`);
    }

    const attr = await VariantAttribute.create(
      { name, display_name, type: type || "select", sort_order: 0, status: 1 },
      { transaction: t },
    );

    // Tạo options nếu được truyền kèm
    if (options && Array.isArray(options) && options.length > 0) {
      const optionRecords = options.map((opt, idx) => ({
        attribute_id: attr.id,
        value: typeof opt === "string" ? opt : opt.value,
        sort_order: typeof opt === "object" ? opt.sort_order ?? idx : idx,
        status: 1,
      }));
      await VariantAttributeOption.bulkCreate(optionRecords, { transaction: t });
    }

    return attr;
  });
};

const updateAttribute = async (id, data) => {
  const attr = await VariantAttribute.findByPk(id);
  if (!attr) throw new Error("Thuộc tính không tồn tại");

  const { name, display_name, type, sort_order, status } = data;
  if (name !== undefined) attr.name = name;
  if (display_name !== undefined) attr.display_name = display_name;
  if (type !== undefined) attr.type = type;
  if (sort_order !== undefined) attr.sort_order = sort_order;
  if (status !== undefined) attr.status = status;

  await attr.save();
  return attr;
};

const deleteAttribute = async (id) => {
  const attr = await VariantAttribute.findByPk(id);
  if (!attr) throw new Error("Thuộc tính không tồn tại");

  await attr.update({ status: 0 });
  return { message: "Đã xóa thuộc tính" };
};

const addOption = async (attributeId, { value, sort_order }) => {
  const attr = await VariantAttribute.findByPk(attributeId);
  if (!attr) throw new Error("Thuộc tính không tồn tại");

  return VariantAttributeOption.create({
    attribute_id: attributeId,
    value,
    sort_order: sort_order || 0,
    status: 1,
  });
};

const updateOption = async (optionId, data) => {
  const option = await VariantAttributeOption.findByPk(optionId);
  if (!option) throw new Error("Tùy chọn không tồn tại");

  if (data.value !== undefined) option.value = data.value;
  if (data.sort_order !== undefined) option.sort_order = data.sort_order;
  if (data.status !== undefined) option.status = data.status;

  await option.save();
  return option;
};

const deleteOption = async (optionId) => {
  const option = await VariantAttributeOption.findByPk(optionId);
  if (!option) throw new Error("Tùy chọn không tồn tại");

  await option.update({ status: 0 });
  return { message: "Đã xóa tùy chọn" };
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
