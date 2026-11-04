/**
 * Master Database Seeder cho TechStore
 *
 * Cách chạy:
 *   node src/seeders/index.js           (Cập nhật/thêm mới an toàn, không trùng lặp)
 *   node src/seeders/index.js --fresh   (Xóa và tái tạo lại toàn bộ dữ liệu mẫu)
 */
require("dotenv").config();
const bcrypt = require("bcrypt");
const { sequelize } = require("../config/db");
const {
  Brand,
  Category,
  CategoryBrand,
  Product,
  ProductVariant,
  ProductImage,
  VariantAttribute,
  VariantAttributeOption,
  VariantAttributeValue,
  User,
  Cart,
} = require("../models/index");

const { seedPhysicalAssets } = require("./assetHelper");
const { CATEGORIES, BRANDS, CATEGORY_BRAND_MAP } = require("./data/categoriesAndBrands");
const { ATTRIBUTES } = require("./data/variantAttributes");
const { PRODUCTS } = require("./data/products");
const { USERS } = require("./data/users");

async function clearExistingData() {
  console.log("⚠️  Đang dọn dẹp dữ liệu cũ (chế độ --fresh)...");
  await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");
  
  const tables = [
    "cart_items",
    "carts",
    "order_items",
    "orders",
    "review_media",
    "review_replies",
    "reviews",
    "variant_attribute_values",
    "product_images",
    "product_variants",
    "products",
    "category_brands",
    "variant_attribute_options",
    "variant_attributes",
    "categories",
    "brands",
    "users",
  ];

  for (const table of tables) {
    try {
      await sequelize.query(`TRUNCATE TABLE \`${table}\`;`);
    } catch (err) {
      // Nếu TRUNCATE thất bại do foreign key, dùng DELETE
      await sequelize.query(`DELETE FROM \`${table}\`;`);
    }
  }

  await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
  console.log("✅ Đã dọn dẹp toàn bộ dữ liệu cũ thành công.\n");
}

async function runSeeder() {
  const isFresh = process.argv.includes("--fresh");
  console.log("==================================================");
  console.log("🚀 TECHSTORE DATABASE SEEDER BẮT ĐẦU...");
  console.log(`📌 Chế độ: ${isFresh ? "--fresh (Tái tạo mới hoàn toàn)" : "Idempotent Safe Seed (Cập nhật an toàn)"}`);
  console.log("==================================================\n");

  try {
    // 0. Xác thực kết nối DB và sync bảng
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    if (isFresh) {
      await clearExistingData();
    }

    // 1. Khởi tạo tài nguyên ảnh vật lý trong uploads/products/ và uploads/brands/
    console.log("📂 BƯỚC 1: Khởi tạo tài nguyên ảnh cục bộ (Local Asset Bundle)...");
    seedPhysicalAssets();
    console.log("✅ Hoàn tất Bước 1.\n");

    // 2. Seed Categories
    console.log("📂 BƯỚC 2: Khởi tạo Danh mục (Categories)...");
    const categoryMap = {}; // slug -> id
    for (const cat of CATEGORIES) {
      const [category, created] = await Category.findOrCreate({
        where: { slug: cat.slug },
        defaults: {
          name: cat.name,
          slug: cat.slug,
          status: cat.status,
        },
      });
      categoryMap[cat.slug] = category.id;
      console.log(`  ${created ? "✨ Tạo mới" : "✔️  Đã có"}: Danh mục [${cat.name}]`);
    }
    console.log("✅ Hoàn tất Bước 2.\n");

    // 3. Seed Brands
    console.log("📂 BƯỚC 3: Khởi tạo Thương hiệu (Brands)...");
    const brandMap = {}; // slug -> id
    for (const b of BRANDS) {
      const [brand, created] = await Brand.findOrCreate({
        where: { slug: b.slug },
        defaults: {
          name: b.name,
          slug: b.slug,
          logo: b.logo,
          status: b.status,
        },
      });
      // Đảm bảo logo luôn trỏ đúng đường dẫn ảnh nội bộ
      if (!created && brand.logo !== b.logo) {
        brand.logo = b.logo;
        await brand.save();
      }
      brandMap[b.slug] = brand.id;
      console.log(`  ${created ? "✨ Tạo mới" : "✔️  Đã có"}: Thương hiệu [${b.name}] (Logo: ${b.logo})`);
    }
    console.log("✅ Hoàn tất Bước 3.\n");

    // 4. Seed CategoryBrand Associations
    console.log("📂 BƯỚC 4: Khởi tạo Liên kết Danh mục - Thương hiệu (CategoryBrands)...");
    for (const [catSlug, brandSlugs] of Object.entries(CATEGORY_BRAND_MAP)) {
      const catId = categoryMap[catSlug];
      if (!catId) continue;
      for (const bSlug of brandSlugs) {
        const bId = brandMap[bSlug];
        if (!bId) continue;
        await CategoryBrand.findOrCreate({
          where: { category_id: catId, brand_id: bId },
          defaults: { category_id: catId, brand_id: bId },
        });
      }
    }
    console.log("✅ Hoàn tất Bước 4.\n");

    // 5. Seed Variant Attributes & Options
    console.log("📂 BƯỚC 5: Khởi tạo Thuộc tính biến thể (Variant Attributes & Options)...");
    const attributeMap = {}; // name -> id
    for (const attr of ATTRIBUTES) {
      const [attribute, created] = await VariantAttribute.findOrCreate({
        where: { name: attr.name },
        defaults: {
          display_name: attr.display_name,
          type: attr.type,
          sort_order: attr.sort_order,
          status: 1,
        },
      });
      attributeMap[attr.name] = attribute.id;
      console.log(`  ${created ? "✨ Tạo mới" : "✔️  Đã có"}: Thuộc tính [${attr.display_name}] (${attr.name})`);

      for (let i = 0; i < attr.options.length; i++) {
        await VariantAttributeOption.findOrCreate({
          where: { attribute_id: attribute.id, value: attr.options[i] },
          defaults: {
            sort_order: i,
            status: 1,
          },
        });
      }
    }
    console.log("✅ Hoàn tất Bước 5.\n");

    // 6. Seed Products, Variants, Attributes Values, Images
    console.log("📂 BƯỚC 6: Khởi tạo Sản phẩm, Biến thể và Hình ảnh (Products & Variants)...");
    for (const p of PRODUCTS) {
      const catId = categoryMap[p.category_slug];
      const bId = brandMap[p.brand_slug];

      if (!catId || !bId) {
        console.warn(`  ⚠️ Bỏ qua sản phẩm ${p.name} do không tìm thấy category hoặc brand.`);
        continue;
      }

      const [product, pCreated] = await Product.findOrCreate({
        where: { slug: p.slug },
        defaults: {
          category_id: catId,
          brand_id: bId,
          name: p.name,
          slug: p.slug,
          description: p.description,
          status: p.status,
          sold_count: p.sold_count,
        },
      });
      console.log(`  ${pCreated ? "✨ Tạo mới" : "✔️  Đã có"}: Sản phẩm [${p.name}]`);

      // Seed Variants
      const createdVariants = [];
      for (const v of p.variants) {
        const [variant, vCreated] = await ProductVariant.findOrCreate({
          where: { sku: v.sku },
          defaults: {
            product_id: product.id,
            sku: v.sku,
            price: v.price,
            sale_price: v.sale_price,
            stock: v.stock,
            sold_count: v.sold_count,
            status: v.status,
          },
        });
        createdVariants.push(variant);

        // Seed Variant Attribute Values (Color, Storage, RAM)
        if (v.attributes) {
          for (const [attrName, attrValue] of Object.entries(v.attributes)) {
            const attrId = attributeMap[attrName];
            if (attrId && attrValue) {
              await VariantAttributeValue.findOrCreate({
                where: { variant_id: variant.id, attribute_id: attrId },
                defaults: {
                  variant_id: variant.id,
                  attribute_id: attrId,
                  value: attrValue,
                },
              });
            }
          }
        }
      }

      // Seed Images cho Product
      const defaultVariantId = createdVariants[0]?.id || 1;
      for (const img of p.images) {
        await ProductImage.findOrCreate({
          where: { product_id: product.id, img_url: img.img_url },
          defaults: {
            product_id: product.id,
            variant_id: defaultVariantId,
            img_url: img.img_url,
            sort_order: img.sort_order,
          },
        });
      }
    }
    console.log("✅ Hoàn tất Bước 6.\n");

    // 7. Seed Users & Carts
    console.log("📂 BƯỚC 7: Khởi tạo Tài khoản mẫu (Admin, Staff, Customer)...");
    for (const u of USERS) {
      const passwordHash = await bcrypt.hash(u.plainPassword, 10);
      const [user, uCreated] = await User.findOrCreate({
        where: { email: u.email },
        defaults: {
          name: u.name,
          email: u.email,
          password: passwordHash,
          role: u.role,
          phone: u.phone,
          address: u.address,
          status: u.status,
        },
      });

      // Tạo Cart tương ứng cho user nếu chưa có
      await Cart.findOrCreate({
        where: { user_id: user.id },
        defaults: { user_id: user.id },
      });

      console.log(`  ${uCreated ? "✨ Tạo mới" : "✔️  Đã có"}: [${u.role.toUpperCase()}] ${u.email} (Mật khẩu: ${u.plainPassword})`);
    }
    console.log("✅ Hoàn tất Bước 7.\n");

    console.log("==================================================");
    console.log("🎉 SEED DỮ LIỆU TECHSTORE THÀNH CÔNG VĨ ĐẠI!");
    console.log("==================================================");
    process.exit(0);
  } catch (error) {
    console.error("❌ LỖI TRONG QUÁ TRÌNH SEED DỮ LIỆU:", error);
    process.exit(1);
  }
}

runSeeder();
