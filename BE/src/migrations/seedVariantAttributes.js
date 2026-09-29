/**
 * Seed script: Tạo dữ liệu ban đầu cho variant_attributes + variant_attribute_options
 * Và migrate dữ liệu hiện có từ product_variants (ram, storage, color) sang variant_attribute_values
 *
 * Chạy: node src/migrations/seedVariantAttributes.js
 */
const { sequelize } = require("../config/db");
const VariantAttribute = require("../models/variantAttributeModel");
const VariantAttributeOption = require("../models/variantAttributeOptionModel");
const VariantAttributeValue = require("../models/variantAttributeValueModel");

// Load associations
require("../models/index");

const SEED_DATA = [
  {
    name: "color",
    display_name: "Màu sắc",
    type: "text",
    sort_order: 0,
    options: [],
  },
  {
    name: "ram",
    display_name: "RAM",
    type: "select",
    sort_order: 1,
    options: ["4GB", "6GB", "8GB", "12GB", "16GB", "32GB"],
  },
  {
    name: "storage",
    display_name: "Bộ nhớ",
    type: "select",
    sort_order: 2,
    options: ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB", "2TB"],
  },
];

async function seed() {
  try {
    // Sync chỉ các bảng mới (không drop bảng cũ)
    await VariantAttribute.sync({ alter: true });
    await VariantAttributeOption.sync({ alter: true });
    await VariantAttributeValue.sync({ alter: true });

    console.log("✅ Đã sync bảng variant_attributes, variant_attribute_options, variant_attribute_values");

    // Tạo attributes + options
    for (const attr of SEED_DATA) {
      const [attribute, created] = await VariantAttribute.findOrCreate({
        where: { name: attr.name },
        defaults: {
          display_name: attr.display_name,
          type: attr.type,
          sort_order: attr.sort_order,
          status: 1,
        },
      });

      if (created) {
        console.log(`  ✅ Tạo thuộc tính: ${attr.display_name} (${attr.name})`);
      } else {
        console.log(`  ⏭️  Thuộc tính đã tồn tại: ${attr.display_name} (${attr.name})`);
      }

      // Tạo options
      for (let i = 0; i < attr.options.length; i++) {
        const [, optCreated] = await VariantAttributeOption.findOrCreate({
          where: { attribute_id: attribute.id, value: attr.options[i] },
          defaults: {
            sort_order: i,
            status: 1,
          },
        });

        if (optCreated) {
          console.log(`    ✅ Tạo tùy chọn: ${attr.options[i]}`);
        }
      }
    }

    console.log("\n✅ Seed hoàn tất!");

    // Migrate dữ liệu hiện có (nếu bảng product_variants vẫn còn cột ram/storage/color)
    console.log("\n🔄 Kiểm tra dữ liệu cần migrate...");
    try {
      const [variants] = await sequelize.query(
        "SELECT id, ram, storage, color FROM product_variants WHERE id NOT IN (SELECT DISTINCT variant_id FROM variant_attribute_values)",
      );

      if (variants.length === 0) {
        console.log("  ⏭️  Không có dữ liệu cần migrate (đã migrate hoặc bảng trống)");
      } else {
        console.log(`  📦 Tìm thấy ${variants.length} variant cần migrate`);

        // Lấy attribute IDs
        const colorAttr = await VariantAttribute.findOne({ where: { name: "color" } });
        const ramAttr = await VariantAttribute.findOne({ where: { name: "ram" } });
        const storageAttr = await VariantAttribute.findOne({ where: { name: "storage" } });

        const valuesToInsert = [];

        for (const v of variants) {
          if (v.color && colorAttr) {
            valuesToInsert.push({ variant_id: v.id, attribute_id: colorAttr.id, value: v.color });
          }
          if (v.ram && ramAttr) {
            valuesToInsert.push({ variant_id: v.id, attribute_id: ramAttr.id, value: v.ram });
          }
          if (v.storage && storageAttr) {
            valuesToInsert.push({ variant_id: v.id, attribute_id: storageAttr.id, value: v.storage });
          }
        }

        if (valuesToInsert.length > 0) {
          await VariantAttributeValue.bulkCreate(valuesToInsert);
          console.log(`  ✅ Đã migrate ${valuesToInsert.length} attribute values`);
        }
      }
    } catch (err) {
      // Nếu cột ram/storage/color đã bị xóa thì bỏ qua migration
      console.log("  ⚠️  Không thể migrate (cột ram/storage/color có thể đã bị xóa):", err.message);
    }

    console.log("\n🎉 Hoàn tất!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi:", error);
    process.exit(1);
  }
}

seed();
