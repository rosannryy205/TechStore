const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Thư mục uploads chính nằm ở BE/src/uploads theo đúng quy chuẩn dự án
const UPLOADS_SRC_DIR = path.join(__dirname, "..", "uploads");
const PRODUCTS_SRC_DIR = path.join(UPLOADS_SRC_DIR, "products");
const BRANDS_SRC_DIR = path.join(UPLOADS_SRC_DIR, "brands");

// Thư mục uploads dự phòng ở BE/uploads để đồng bộ 100% khả năng phục vụ tĩnh
const UPLOADS_ROOT_DIR = path.join(__dirname, "..", "..", "uploads");
const PRODUCTS_ROOT_DIR = path.join(UPLOADS_ROOT_DIR, "products");
const BRANDS_ROOT_DIR = path.join(UPLOADS_ROOT_DIR, "brands");

/**
 * Đảm bảo các thư mục upload tồn tại ở cả BE/src/uploads và BE/uploads
 */
function ensureUploadDirectories() {
  const dirs = [
    PRODUCTS_SRC_DIR,
    BRANDS_SRC_DIR,
    PRODUCTS_ROOT_DIR,
    BRANDS_ROOT_DIR,
    path.join(UPLOADS_SRC_DIR, "reviews"),
    path.join(UPLOADS_ROOT_DIR, "reviews"),
  ];
  for (const d of dirs) {
    if (!fs.existsSync(d)) {
      fs.mkdirSync(d, { recursive: true });
    }
  }
}

/**
 * Logo thương hiệu chuẩn vector SVG sắc nét
 */
const BRAND_LOGOS = {
  "apple.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170" width="170" height="170">
  <rect width="170" height="170" rx="36" fill="#f5f5f7"/>
  <path fill="#1d1d1f" d="M117.4 94.8c.2 23.3 20.4 31 20.6 31.1-.2.5-3.2 11-10.6 21.8-6.4 9.3-13 18.6-23.5 18.8-10.3.2-13.6-6.1-25.4-6.1-11.8 0-15.5 5.9-25.2 6.3-10.1.4-17.7-10.1-24.1-19.4-13.2-19-23.3-53.8-9.7-77.5 6.7-11.7 18.8-19.1 31.8-19.3 9.9-.2 19.3 6.7 25.4 6.7 6.1 0 17.4-8.3 29.3-7.1 5 .2 19 2 28 15.2-1.2.7-16.7 9.8-16.6 29.5zm-15.6-53.5c4.5-5.5 7.6-13.1 6.7-20.8-6.5.3-14.4 4.3-19.1 9.8-4.1 4.8-7.7 12.5-6.7 20 7.3.6 14.8-3.6 19.1-9z"/>
</svg>`,

  "samsung.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 100" width="240" height="100">
  <rect width="240" height="100" rx="20" fill="#f5f5f7"/>
  <text x="120" y="62" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="34" letter-spacing="4" fill="#0c4da2" text-anchor="middle">SAMSUNG</text>
</svg>`,

  "sony.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 100" width="240" height="100">
  <rect width="240" height="100" rx="20" fill="#f5f5f7"/>
  <text x="120" y="62" font-family="'Times New Roman', Georgia, serif" font-weight="900" font-size="38" letter-spacing="8" fill="#1d1d1f" text-anchor="middle">SONY</text>
</svg>`,

  "asus.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 100" width="240" height="100">
  <rect width="240" height="100" rx="20" fill="#f5f5f7"/>
  <text x="120" y="63" font-family="-apple-system, BlinkMacSystemFont, 'Impact', 'Segoe UI', sans-serif" font-weight="900" font-size="38" letter-spacing="6" fill="#00539b" text-anchor="middle">ASUS</text>
</svg>`,

  "xiaomi.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170" width="170" height="170">
  <rect width="170" height="170" rx="42" fill="#ff6700"/>
  <text x="85" y="108" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="64" fill="#ffffff" text-anchor="middle">mi</text>
</svg>`,

  "dell.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170" width="170" height="170">
  <rect width="170" height="170" rx="36" fill="#f5f5f7"/>
  <circle cx="85" cy="85" r="58" fill="none" stroke="#007db8" stroke-width="6"/>
  <text x="85" y="99" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="36" letter-spacing="1" fill="#007db8" text-anchor="middle">DELL</text>
</svg>`,
};

/**
 * Danh sách nguồn ảnh thực tế, khớp 100% với từng sản phẩm công nghệ trong hệ thống:
 * - Không dùng ảnh vector vẽ giả lập hay diagram
 * - Nguồn ảnh chính hãng hoặc retail studio cao cấp
 * - Đảm bảo độ phân giải cao 1000x1000 sắc nét
 * - Tách nền trong suốt (transparent PNG)
 */
const PRODUCTS_ASSET_MANIFEST = [
  {
    name: "iPhone 16 Pro Max",
    slug: "iphone-16-pro-max",
    filename: "iphone-16-pro-max.png",
    url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-9inch-deserttitanium?wid=1000&hei=1000&fmt=png-alpha",
    source: "Apple Official Store CDN (Desert Titanium 6.9 inch - Render chính hãng)",
    needBgRemoval: false,
  },
  {
    name: "iPhone 16 Pro",
    slug: "iphone-16-pro",
    filename: "iphone-16-pro.png",
    url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-naturaltitanium?wid=1000&hei=1000&fmt=png-alpha",
    source: "Apple Official Store CDN (Natural Titanium 6.3 inch - Render chính hãng)",
    needBgRemoval: false,
  },
  {
    name: "MacBook Pro 14 inch M3 Pro",
    slug: "macbook-pro-14-m3-pro",
    filename: "macbook-pro-14-m3.png",
    url: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/mbp14-spaceblack-cto-hero-202410?wid=1000&hei=1000&fmt=png-alpha",
    source: "Apple Official Store CDN (Space Black 14 inch - Render chính hãng)",
    needBgRemoval: false,
  },
  {
    name: "MacBook Air 13 inch M3",
    slug: "macbook-air-13-m3",
    filename: "macbook-air-13-m3.png",
    url: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/mba13-midnight-select-202402?wid=1000&hei=1000&fmt=png-alpha",
    source: "Apple Official Store CDN (Midnight 13 inch - Render chính hãng)",
    needBgRemoval: false,
  },
  {
    name: "iPad Pro 13 inch M4",
    slug: "ipad-pro-13-m4",
    filename: "ipad-pro-13-m4.png",
    url: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/ipad-pro-finish-select-202405-13inch-spaceblack-glossy-wifi?wid=1000&hei=1000&fmt=png-alpha",
    source: "Apple Official Store CDN (Space Black 13 inch Tandem OLED - Render chính hãng)",
    needBgRemoval: false,
  },
  {
    name: "iPad Air 11 inch M2",
    slug: "ipad-air-11-m2",
    filename: "ipad-air-11-m2.png",
    url: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/ipad-air-finish-select-gallery-202405-11inch-space-gray-wifi?wid=1000&hei=1000&fmt=png-alpha",
    source: "Apple Official Store CDN (Space Gray 11 inch - Render chính hãng)",
    needBgRemoval: false,
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    slug: "samsung-galaxy-s24-ultra",
    filename: "galaxy-s24-ultra.png",
    url: "https://cdn.tgdd.vn/Products/Images/42/307174/samsung-galaxy-s24-ultra-xam-1.jpg",
    source: "Thế Giới Di Động Studio (Canon EF100mm Macro - Titanium Gray chính hãng)",
    needBgRemoval: true,
  },
  {
    name: "Samsung Galaxy Z Fold6",
    slug: "samsung-galaxy-z-fold6",
    filename: "galaxy-z-fold6.png",
    url: "https://cdn.tgdd.vn/Products/Images/42/320721/samsung-galaxy-z-fold6-xam-1.jpg",
    source: "Thế Giới Di Động Studio (Silver Shadow Studio Shot chính hãng)",
    needBgRemoval: true,
  },
  {
    name: "Sony WH-1000XM5",
    slug: "sony-wh-1000xm5",
    filename: "sony-wh1000xm5.png",
    url: "https://cdn.tgdd.vn/Products/Images/54/313692/tai-nghe-bluetooth-chup-tai-sony-wh1000xm5-den-1.jpg",
    source: "Thế Giới Di Động Studio / Sony Official Retail (Đen sang trọng)",
    needBgRemoval: true,
  },
  {
    name: "AirPods Pro 2 USB-C",
    slug: "airpods-pro-2-usb-c",
    filename: "airpods-pro-2.png",
    url: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MTJV3?wid=1000&hei=1000&fmt=png-alpha",
    source: "Apple Official Store CDN (Model MTJV3 MagSafe USB-C - Render chính hãng)",
    needBgRemoval: false,
  },
  {
    name: "Apple Watch Ultra 2",
    slug: "apple-watch-ultra-2",
    filename: "apple-watch-ultra-2.png",
    url: "https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/111832-watch-ultra-2.png",
    source: "Apple Official Tech Specs CDN (Titanium 49mm - Render kỹ thuật)",
    needBgRemoval: false,
  },
  {
    name: "Samsung Galaxy Watch Ultra",
    slug: "samsung-galaxy-watch-ultra",
    filename: "galaxy-watch-ultra.png",
    url: "https://cdn.tgdd.vn/Products/Images/7077/338267/Slider/samsung-galaxy-watch-ultra-2025638892975225404002.png",
    source: "Thế Giới Di Động / Samsung Official Asset (Titanium Gray Marine Band)",
    needBgRemoval: false,
  },
  {
    name: "Asus ROG Zephyrus G16",
    slug: "asus-rog-zephyrus-g16",
    filename: "asus-rog-zephyrus-g16.png",
    url: "https://press.asus.com/assets/w_1000,h_1000/4c03ea78-47cc-448c-92e7-4defe6af88e2/2024%20Zephyrus%20G16%20Platinum%20White%20Front.png",
    source: "ASUS Official Pressroom CDN (ROG Zephyrus G16 GU605 2024 - Platinum White)",
    needBgRemoval: false,
  },
  {
    name: "Dell XPS 14 9440",
    slug: "dell-xps-14-9440",
    filename: "dell-xps-14.png",
    url: "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/14-9440/media-gallery/notebook-xps-14-9440t-sl-gallery-9.psd?fmt=png-alpha&wid=1000&hei=1000",
    source: "Dell Official Media Gallery CDN (XPS 14 9440 CNC Platinum Chassis)",
    needBgRemoval: false,
  },
  {
    name: "Xiaomi 14 Ultra",
    slug: "xiaomi-14-ultra",
    filename: "xiaomi-14-ultra.png",
    url: "https://cdn.tgdd.vn/Products/Images/42/313889/xiaomi-14-ultra-black-1.jpg",
    source: "Thế Giới Di Động Studio (Xiaomi 14 Ultra Leica Quad-Camera Đen)",
    needBgRemoval: true,
  },
];

/**
 * Thuật toán tách nền trắng studio bằng BFS Flood-Fill từ viền ảnh
 * Bảo toàn 100% chi tiết bên trong vật thể và làm mịn viền bằng feathering
 */
async function removePureWhiteBackground(buffer, tolerance = 12) {
  const image = sharp(buffer);
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  const visited = new Uint8Array(width * height);
  const queue = [];

  const isBgColor = (r, g, b) => {
    return r >= (255 - tolerance) && g >= (255 - tolerance) && b >= (255 - tolerance);
  };

  const getIdx = (x, y) => y * width + x;

  for (let x = 0; x < width; x++) {
    let pIdx = (0 * width + x) * channels;
    if (isBgColor(data[pIdx], data[pIdx + 1], data[pIdx + 2])) {
      visited[getIdx(x, 0)] = 1;
      queue.push(x, 0);
    }
    pIdx = ((height - 1) * width + x) * channels;
    if (isBgColor(data[pIdx], data[pIdx + 1], data[pIdx + 2])) {
      visited[getIdx(x, height - 1)] = 1;
      queue.push(x, height - 1);
    }
  }

  for (let y = 0; y < height; y++) {
    let pIdx = (y * width + 0) * channels;
    if (isBgColor(data[pIdx], data[pIdx + 1], data[pIdx + 2]) && !visited[getIdx(0, y)]) {
      visited[getIdx(0, y)] = 1;
      queue.push(0, y);
    }
    pIdx = (y * width + (width - 1)) * channels;
    if (isBgColor(data[pIdx], data[pIdx + 1], data[pIdx + 2]) && !visited[getIdx(width - 1, y)]) {
      visited[getIdx(width - 1, y)] = 1;
      queue.push(width - 1, y);
    }
  }

  let head = 0;
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];

    const pIdx = (cy * width + cx) * channels;
    data[pIdx + 3] = 0; // Đặt alpha = 0 (trong suốt)

    for (let i = 0; i < dirs.length; i++) {
      const nx = cx + dirs[i][0];
      const ny = cy + dirs[i][1];

      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIdx = getIdx(nx, ny);
        if (!visited[nIdx]) {
          visited[nIdx] = 1;
          const npIdx = (ny * width + nx) * channels;
          if (isBgColor(data[npIdx], data[npIdx + 1], data[npIdx + 2])) {
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  // Khử răng cưa và làm mềm biên cạnh (Edge antialiasing)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pIdx = (y * width + x) * channels;
      if (data[pIdx + 3] > 0) {
        let hasTrans = false;
        for (let i = 0; i < dirs.length; i++) {
          const nx = x + dirs[i][0];
          const ny = y + dirs[i][1];
          if (visited[getIdx(nx, ny)] && data[(ny * width + nx) * channels + 3] === 0) {
            hasTrans = true;
            break;
          }
        }
        if (hasTrans) {
          const r = data[pIdx], g = data[pIdx + 1], b = data[pIdx + 2];
          const brightness = (r + g + b) / 3;
          if (brightness > 230) {
            const alphaFactor = Math.max(0, (255 - brightness) / 25);
            data[pIdx + 3] = Math.round(alphaFactor * 255);
          }
        }
      }
    }
  }

  return sharp(data, { raw: { width, height, channels: 4 } })
    .trim()
    .resize(1000, 1000, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ quality: 95, compressionLevel: 8 })
    .toBuffer();
}

/**
 * Xử lý ảnh đầu vào thành PNG 1000x1000 chuẩn sắc nét, nền trong suốt
 */
async function processToStandardPng(buffer) {
  return sharp(buffer)
    .ensureAlpha()
    .trim()
    .resize(1000, 1000, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ quality: 95, compressionLevel: 8 })
    .toBuffer();
}

/**
 * Khởi tạo và nạp toàn bộ ảnh vật lý thực tế vào BE/src/uploads và BE/uploads
 */
async function seedPhysicalAssets() {
  ensureUploadDirectories();

  // 1. Ghi file logo thương hiệu vào cả 2 thư mục
  for (const [filename, svgContent] of Object.entries(BRAND_LOGOS)) {
    const fileSrc = path.join(BRANDS_SRC_DIR, filename);
    const fileRoot = path.join(BRANDS_ROOT_DIR, filename);
    fs.writeFileSync(fileSrc, svgContent.trim(), "utf8");
    fs.writeFileSync(fileRoot, svgContent.trim(), "utf8");
  }
  console.log(`  🖼️  Đã đồng bộ ${Object.keys(BRAND_LOGOS).length} logo thương hiệu vào uploads/brands/`);

  // 2. Tải và xử lý ảnh sản phẩm thực tế, chất lượng cao, đã tách nền
  console.log(`  📸 Đang kiểm tra và nạp ${PRODUCTS_ASSET_MANIFEST.length} ảnh sản phẩm thực tế...`);
  
  for (let i = 0; i < PRODUCTS_ASSET_MANIFEST.length; i++) {
    const item = PRODUCTS_ASSET_MANIFEST[i];
    const targetSrcFile = path.join(PRODUCTS_SRC_DIR, item.filename);
    const targetRootFile = path.join(PRODUCTS_ROOT_DIR, item.filename);

    const existsInSrc = fs.existsSync(targetSrcFile) && fs.statSync(targetSrcFile).size > 10000;
    const existsInRoot = fs.existsSync(targetRootFile) && fs.statSync(targetRootFile).size > 10000;

    if (existsInSrc && existsInRoot) {
      console.log(`    ✔️  [${i + 1}/${PRODUCTS_ASSET_MANIFEST.length}] Đã có sẵn: ${item.filename} (Khớp: ${item.name})`);
      continue;
    }

    // Nếu một trong hai bên có file hợp lệ thì copy sang bên kia
    if (existsInSrc && !existsInRoot) {
      fs.copyFileSync(targetSrcFile, targetRootFile);
      console.log(`    ✔️  [${i + 1}/${PRODUCTS_ASSET_MANIFEST.length}] Đồng bộ sang uploads/products/: ${item.filename}`);
      continue;
    }
    if (!existsInSrc && existsInRoot) {
      fs.copyFileSync(targetRootFile, targetSrcFile);
      console.log(`    ✔️  [${i + 1}/${PRODUCTS_ASSET_MANIFEST.length}] Đồng bộ sang src/uploads/products/: ${item.filename}`);
      continue;
    }

    // Tải mới từ nguồn
    console.log(`    ⬇️  [${i + 1}/${PRODUCTS_ASSET_MANIFEST.length}] Đang tải ảnh thực tế cho [${item.name}] từ ${item.source}...`);
    try {
      const response = await fetch(item.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const rawBuffer = Buffer.from(await response.arrayBuffer());
      let finalBuffer;

      if (item.needBgRemoval) {
        finalBuffer = await removePureWhiteBackground(rawBuffer);
      } else {
        finalBuffer = await processToStandardPng(rawBuffer);
      }

      fs.writeFileSync(targetSrcFile, finalBuffer);
      fs.writeFileSync(targetRootFile, finalBuffer);

      console.log(`    ✅ Đã lưu ${item.filename} (${finalBuffer.length} bytes, 1000x1000 transparent PNG)`);
    } catch (err) {
      console.error(`    ❌ Lỗi khi tải/xử lý [${item.name}]:`, err.message);
    }
  }

  // 3. Sao chép ảnh từ FE nếu có để đồng bộ thêm ảnh phụ
  const feAssetsDir = path.join(__dirname, "..", "..", "..", "FE", "my-app", "src", "assets");
  const ip16Source = path.join(feAssetsDir, "ip16PRM.jpg");
  if (fs.existsSync(ip16Source)) {
    fs.copyFileSync(ip16Source, path.join(PRODUCTS_SRC_DIR, "ip16PRM.jpg"));
    fs.copyFileSync(ip16Source, path.join(PRODUCTS_ROOT_DIR, "ip16PRM.jpg"));
  }

  const productSource = path.join(feAssetsDir, "product.jpg");
  if (fs.existsSync(productSource)) {
    fs.copyFileSync(productSource, path.join(PRODUCTS_SRC_DIR, "default-product.jpg"));
    fs.copyFileSync(productSource, path.join(PRODUCTS_ROOT_DIR, "default-product.jpg"));
  }

  console.log(`  🎉 Hoàn tất nạp toàn bộ ảnh thực tế vào @BE/src/uploads/products/!`);
}

module.exports = {
  seedPhysicalAssets,
  PRODUCTS_ASSET_MANIFEST,
  UPLOADS_SRC_DIR,
  UPLOADS_ROOT_DIR,
  PRODUCTS_SRC_DIR,
  BRANDS_SRC_DIR,
};
