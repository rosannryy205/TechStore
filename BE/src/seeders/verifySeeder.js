/**
 * Script kiểm tra và xác thực tính toàn vẹn của dữ liệu seed và file ảnh
 * Chạy: node src/seeders/verifySeeder.js
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const {
  sequelize,
  Brand,
  Category,
  CategoryBrand,
  Product,
  ProductVariant,
  ProductImage,
  VariantAttribute,
  VariantAttributeValue,
  User,
  Cart,
} = require("../models/index");

const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads");

async function verify() {
  console.log("🔍 ĐANG KIỂM ĐỊNH TOÀN VẸN DỮ LIỆU SEEDER & HÌNH ẢNH...\n");
  let passed = true;

  try {
    await sequelize.authenticate();

    // 1. Kiểm tra Categories & Brands
    const categories = await Category.findAll();
    const brands = await Brand.findAll();
    console.log(`✅ [1/6] Danh mục: Tìm thấy ${categories.length} danh mục (Yêu cầu >= 6)`);
    console.log(`✅ [2/6] Thương hiệu: Tìm thấy ${brands.length} thương hiệu (Yêu cầu >= 6)`);

    if (categories.length < 6 || brands.length < 6) {
      console.error("❌ Số lượng Category hoặc Brand không đủ!");
      passed = false;
    }

    // 2. Kiểm tra file logo thương hiệu trên ổ đĩa
    console.log("\n🖼️  [3/6] Kiểm tra tính hợp lệ của file Logo thương hiệu trên đĩa:");
    for (const b of brands) {
      if (!b.logo) {
        console.error(`❌ Thương hiệu ${b.name} không có trường logo!`);
        passed = false;
        continue;
      }
      const logoPath = path.join(__dirname, "..", "..", b.logo);
      if (!fs.existsSync(logoPath)) {
        console.error(`❌ File logo không tồn tại trên đĩa: ${logoPath}`);
        passed = false;
      } else {
        const stat = fs.statSync(logoPath);
        if (stat.size === 0) {
          console.error(`❌ File logo bị rỗng (0 bytes): ${logoPath}`);
          passed = false;
        } else {
          console.log(`  ✔️  Logo ${b.name}: ${b.logo} (${stat.size} bytes) - TỒN TẠI VÀ HỢP LỆ`);
        }
      }
    }

    // 3. Kiểm tra Products & Variants
    const products = await Product.findAll({
      include: [
        { model: Brand, as: "brand" },
        { model: ProductVariant, as: "variants" },
        { model: ProductImage, as: "images" },
      ],
    });
    console.log(`\n📦 [4/6] Sản phẩm: Tìm thấy ${products.length} sản phẩm (Yêu cầu >= 15)`);
    if (products.length < 15) {
      console.error("❌ Số lượng sản phẩm không đủ!");
      passed = false;
    }

    // 4. Kiểm tra file ảnh sản phẩm trên ổ đĩa
    console.log("\n🖼️  [5/6] Kiểm tra tính hợp lệ của file Ảnh sản phẩm trên đĩa:");
    let verifiedImagesCount = 0;
    for (const p of products) {
      if (!p.images || p.images.length === 0) {
        console.error(`❌ Sản phẩm ${p.name} không có ảnh nào trong bảng product_images!`);
        passed = false;
        continue;
      }

      for (const img of p.images) {
        const imgPath = path.join(__dirname, "..", "..", img.img_url);
        if (!fs.existsSync(imgPath)) {
          console.error(`❌ File ảnh của [${p.name}] không tồn tại trên đĩa: ${imgPath}`);
          passed = false;
        } else {
          const stat = fs.statSync(imgPath);
          if (stat.size === 0) {
            console.error(`❌ File ảnh [${p.name}] bị rỗng: ${imgPath}`);
            passed = false;
          } else {
            verifiedImagesCount++;
          }
        }
      }
    }
    console.log(`  ✔️  Đã kiểm tra ${verifiedImagesCount} file ảnh sản phẩm: 100% TỒN TẠI VẬT LÝ VÀ ĐỦ KÍCH THƯỚC`);

    // 5. Kiểm tra tài khoản người dùng và băm mật khẩu
    console.log("\n👤 [6/6] Kiểm tra Tài khoản mẫu (Admin & Khách hàng):");
    const adminUser = await User.findOne({ where: { email: "admin@techstore.com" } });
    if (!adminUser) {
      console.error("❌ Không tìm thấy tài khoản admin@techstore.com!");
      passed = false;
    } else {
      const match = await bcrypt.compare("Admin@123456", adminUser.password);
      if (!match) {
        console.error("❌ Mật khẩu của admin@techstore.com không khớp!");
        passed = false;
      } else {
        console.log("  ✔️  Tài khoản Admin: admin@techstore.com (Bcrypt xác thực thành công)");
      }
    }

    const customerUser = await User.findOne({ where: { email: "customer@techstore.com" } });
    if (!customerUser) {
      console.error("❌ Không tìm thấy tài khoản customer@techstore.com!");
      passed = false;
    } else {
      const match = await bcrypt.compare("Customer@123456", customerUser.password);
      if (!match) {
        console.error("❌ Mật khẩu của customer@techstore.com không khớp!");
        passed = false;
      } else {
        console.log("  ✔️  Tài khoản Khách hàng: customer@techstore.com (Bcrypt xác thực thành công)");
      }
    }

    console.log("\n==================================================");
    if (passed) {
      console.log("🎉 TẤT CẢ KIỂM ĐỊNH THÀNH CÔNG: DỮ LIỆU & HÌNH ẢNH HOÀN TOÀN KHÔNG LỖI!");
      console.log("==================================================");
      process.exit(0);
    } else {
      console.error("❌ CÓ LỖI XẢY RA TRONG QUÁ TRÌNH KIỂM ĐỊNH!");
      console.log("==================================================");
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ Lỗi kiểm định:", err);
    process.exit(1);
  }
}

verify();
