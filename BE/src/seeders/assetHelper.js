const fs = require("fs");
const path = require("path");

const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads");
const PRODUCTS_DIR = path.join(UPLOADS_DIR, "products");
const BRANDS_DIR = path.join(UPLOADS_DIR, "brands");

/**
 * Đảm bảo các thư mục upload tồn tại
 */
function ensureUploadDirectories() {
  if (!fs.existsSync(PRODUCTS_DIR)) {
    fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
  }
  if (!fs.existsSync(BRANDS_DIR)) {
    fs.mkdirSync(BRANDS_DIR, { recursive: true });
  }
}

/**
 * Tạo logo thương hiệu định dạng SVG vector sắc nét
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
 * Bộ tạo hình ảnh SVG sản phẩm công nghệ cao cấp
 */
function createSmartphoneSvg({ title, modelText, bodyColor, accentColor, cameraCount = 3 }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480" width="400" height="480">
  <defs>
    <linearGradient id="bodyGrad_${title}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${accentColor}" />
      <stop offset="50%" stop-color="${bodyColor}" />
      <stop offset="100%" stop-color="#121214" />
    </linearGradient>
    <linearGradient id="screenGrad_${title}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a1c29" />
      <stop offset="50%" stop-color="#0f111a" />
      <stop offset="100%" stop-color="#05070a" />
    </linearGradient>
    <linearGradient id="glow_${title}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </linearGradient>
    <filter id="shadow_${title}" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="18" stdDeviation="20" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Device Shadow & Chassis -->
  <rect x="90" y="30" width="220" height="420" rx="42" fill="url(#bodyGrad_${title})" filter="url(#shadow_${title})" stroke="#ffffff" stroke-opacity="0.2" stroke-width="2"/>
  
  <!-- Outer Bezel -->
  <rect x="96" y="36" width="208" height="408" rx="38" fill="#0a0a0c" stroke="#1d1d1f" stroke-width="1.5"/>
  
  <!-- Active OLED Screen -->
  <rect x="100" y="40" width="200" height="400" rx="34" fill="url(#screenGrad_${title})" />
  
  <!-- Screen Wallpaper Visual Art -->
  <circle cx="200" cy="220" r="85" fill="${accentColor}" opacity="0.18" />
  <circle cx="160" cy="280" r="70" fill="${bodyColor}" opacity="0.25" />
  
  <!-- Dynamic Island / Punch Hole -->
  <rect x="165" y="48" width="70" height="20" rx="10" fill="#000000" />
  <circle cx="218" cy="58" r="4" fill="#1a1a2e" />

  <!-- Device Title and Label on Screen -->
  <text x="200" y="210" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" font-weight="800" font-size="20" fill="#ffffff" text-anchor="middle" letter-spacing="-0.5">${title}</text>
  <text x="200" y="235" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-weight="600" font-size="12" fill="${accentColor}" text-anchor="middle" letter-spacing="1.5">${modelText}</text>
  
  <!-- Home Indicator Bar -->
  <rect x="160" y="426" width="80" height="4" rx="2" fill="#ffffff" opacity="0.5"/>
</svg>`;
}

function createLaptopSvg({ title, modelText, bodyColor, accentColor }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 400" width="480" height="400">
  <defs>
    <linearGradient id="lidGrad_${title}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${bodyColor}" />
      <stop offset="100%" stop-color="#121214" />
    </linearGradient>
    <linearGradient id="laptopScreen_${title}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f2027" />
      <stop offset="50%" stop-color="#203a43" />
      <stop offset="100%" stop-color="#2c5364" />
    </linearGradient>
    <filter id="lapShadow_${title}" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="22" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Laptop Display Lid -->
  <rect x="70" y="40" width="340" height="230" rx="16" fill="url(#lidGrad_${title})" filter="url(#lapShadow_${title})" stroke="#44444a" stroke-width="1.5"/>
  <rect x="78" y="48" width="324" height="214" rx="10" fill="#000000"/>
  <rect x="82" y="52" width="316" height="206" rx="8" fill="url(#laptopScreen_${title})"/>
  
  <!-- Screen Branding Content -->
  <circle cx="240" cy="140" r="50" fill="${accentColor}" opacity="0.25"/>
  <text x="240" y="142" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" font-weight="800" font-size="22" fill="#ffffff" text-anchor="middle">${title}</text>
  <text x="240" y="168" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-weight="600" font-size="13" fill="${accentColor}" text-anchor="middle" letter-spacing="1">${modelText}</text>
  
  <!-- Notch/Camera -->
  <rect x="228" y="52" width="24" height="8" rx="4" fill="#000000"/>

  <!-- Base Keyboard Hinge & Deck -->
  <polygon points="30,290 450,290 410,274 70,274" fill="#7d7d82" opacity="0.9"/>
  <rect x="25" y="288" width="430" height="18" rx="8" fill="url(#lidGrad_${title})" stroke="#55555c" stroke-width="1.5"/>
  
  <!-- Trackpad Notch Lip -->
  <rect x="210" y="289" width="60" height="4" rx="2" fill="#2c2c2e"/>
</svg>`;
}

function createTabletSvg({ title, modelText, bodyColor, accentColor }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 440" width="420" height="440">
  <defs>
    <linearGradient id="tabScreen_${title}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141e30" />
      <stop offset="100%" stop-color="#243b55" />
    </linearGradient>
    <filter id="tabShadow_${title}">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Tablet Body -->
  <rect x="60" y="30" width="300" height="380" rx="28" fill="${bodyColor}" filter="url(#tabShadow_${title})" stroke="#ffffff" stroke-opacity="0.2" stroke-width="1.5"/>
  <rect x="66" y="36" width="288" height="368" rx="24" fill="#050508"/>
  <rect x="72" y="42" width="276" height="356" rx="20" fill="url(#tabScreen_${title})"/>
  
  <!-- Center Screen Art -->
  <circle cx="210" cy="210" r="75" fill="${accentColor}" opacity="0.25"/>
  <text x="210" y="210" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" font-weight="800" font-size="24" fill="#ffffff" text-anchor="middle">${title}</text>
  <text x="210" y="238" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-weight="600" font-size="13" fill="${accentColor}" text-anchor="middle" letter-spacing="1.2">${modelText}</text>
</svg>`;
}

function createAudioSvg({ title, modelText, accentColor }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 420" width="400" height="420">
  <defs>
    <filter id="audioShadow_${title}">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Headphone Arc -->
  <path d="M120 220 A 100 100 0 0 1 280 220" fill="none" stroke="#2c2c2e" stroke-width="26" stroke-linecap="round" filter="url(#audioShadow_${title})"/>
  <path d="M130 210 A 90 90 0 0 1 270 210" fill="none" stroke="${accentColor}" stroke-width="8" stroke-linecap="round" opacity="0.8"/>
  
  <!-- Left Ear Cup -->
  <rect x="90" y="210" width="46" height="96" rx="23" fill="#1c1c1e" stroke="${accentColor}" stroke-width="2"/>
  <rect x="100" y="222" width="26" height="72" rx="13" fill="#2c2c2e"/>
  
  <!-- Right Ear Cup -->
  <rect x="264" y="210" width="46" height="96" rx="23" fill="#1c1c1e" stroke="${accentColor}" stroke-width="2"/>
  <rect x="274" y="222" width="26" height="72" rx="13" fill="#2c2c2e"/>

  <!-- Info Label -->
  <text x="200" y="350" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" font-weight="800" font-size="20" fill="#1d1d1f" text-anchor="middle">${title}</text>
  <text x="200" y="375" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-weight="600" font-size="13" fill="${accentColor}" text-anchor="middle" letter-spacing="1">${modelText}</text>
</svg>`;
}

function createWatchSvg({ title, modelText, accentColor, strapColor = "#e65100" }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="400" height="440">
  <defs>
    <filter id="watchShadow_${title}">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Straps -->
  <rect x="155" y="20" width="90" height="90" rx="12" fill="${strapColor}"/>
  <rect x="155" y="330" width="90" height="90" rx="12" fill="${strapColor}"/>
  
  <!-- Watch Case -->
  <rect x="120" y="90" width="160" height="200" rx="42" fill="#c4c4c8" filter="url(#watchShadow_${title})" stroke="#8e8e93" stroke-width="2"/>
  
  <!-- Digital Crown & Button -->
  <rect x="276" y="125" width="12" height="40" rx="4" fill="#d1d1d6" stroke="#636366" stroke-width="1.5"/>
  <rect x="276" y="185" width="8" height="35" rx="3" fill="#8e8e93"/>
  
  <!-- Screen Bezel & Display -->
  <rect x="128" y="98" width="144" height="184" rx="34" fill="#000000"/>
  <rect x="134" y="104" width="132" height="172" rx="28" fill="#0a0a0c"/>
  
  <!-- Watchface Display -->
  <circle cx="200" cy="180" r="48" fill="none" stroke="${accentColor}" stroke-width="5" stroke-dasharray="180 50"/>
  <text x="200" y="175" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="middle">09:41</text>
  <text x="200" y="200" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-weight="700" font-size="12" fill="${accentColor}" text-anchor="middle" letter-spacing="1">78 BPM</text>

  <!-- Watch Subtitle -->
  <text x="200" y="318" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-weight="700" font-size="13" fill="#1d1d1f" text-anchor="middle">${title}</text>
</svg>`;
}

/**
 * Danh mục file ảnh sản phẩm SVG mẫu
 */
const PRODUCT_IMAGES = {
  "iphone-16-pro-max.svg": createSmartphoneSvg({
    title: "iPhone 16 Pro Max",
    modelText: "TITANIUM SA MẠC • A18 PRO",
    bodyColor: "#c2a382",
    accentColor: "#dfba8b",
  }),
  "iphone-16-pro.svg": createSmartphoneSvg({
    title: "iPhone 16 Pro",
    modelText: "TITAN TỰ NHIÊN • 6.3 INCH",
    bodyColor: "#9a968f",
    accentColor: "#bebab3",
  }),
  "macbook-pro-14-m3.svg": createLaptopSvg({
    title: "MacBook Pro 14",
    modelText: "APPLE M3 PRO • SPACE BLACK",
    bodyColor: "#2e2f33",
    accentColor: "#38bdf8",
  }),
  "macbook-air-13-m3.svg": createLaptopSvg({
    title: "MacBook Air 13",
    modelText: "APPLE M3 • MIDNIGHT",
    bodyColor: "#2c3340",
    accentColor: "#a5b4fc",
  }),
  "ipad-pro-13-m4.svg": createTabletSvg({
    title: "iPad Pro 13",
    modelText: "APPLE M4 • TANDEM OLED",
    bodyColor: "#303236",
    accentColor: "#818cf8",
  }),
  "ipad-air-11-m2.svg": createTabletSvg({
    title: "iPad Air 11",
    modelText: "APPLE M2 • LIQUID RETINA",
    bodyColor: "#394e63",
    accentColor: "#38bdf8",
  }),
  "galaxy-s24-ultra.svg": createSmartphoneSvg({
    title: "Galaxy S24 Ultra",
    modelText: "GALAXY AI • TITANIUM GRAY",
    bodyColor: "#47494f",
    accentColor: "#facc15",
  }),
  "galaxy-z-fold6.svg": createSmartphoneSvg({
    title: "Galaxy Z Fold6",
    modelText: "INFINITY FLEX • AI MULTI-WINDOW",
    bodyColor: "#334155",
    accentColor: "#60a5fa",
  }),
  "sony-wh1000xm5.svg": createAudioSvg({
    title: "Sony WH-1000XM5",
    modelText: "INDUSTRY LEADING NOISE CANCELING",
    accentColor: "#d97706",
  }),
  "airpods-pro-2.svg": createAudioSvg({
    title: "AirPods Pro 2",
    modelText: "CHIP H2 • USB-C MAGSAFE",
    accentColor: "#10b981",
  }),
  "apple-watch-ultra-2.svg": createWatchSvg({
    title: "Apple Watch Ultra 2",
    modelText: "TITANIUM 49MM • 3000 NITS",
    accentColor: "#f97316",
    strapColor: "#ea580c",
  }),
  "galaxy-watch-ultra.svg": createWatchSvg({
    title: "Galaxy Watch Ultra",
    modelText: "10ATM WATER RESIST • BIOACTIVE AI",
    accentColor: "#06b6d4",
    strapColor: "#0284c7",
  }),
  "asus-rog-zephyrus-g16.svg": createLaptopSvg({
    title: "ROG Zephyrus G16",
    modelText: "RTX 4070 • 240Hz OLED",
    bodyColor: "#1e1e24",
    accentColor: "#ef4444",
  }),
  "dell-xps-14.svg": createLaptopSvg({
    title: "Dell XPS 14 9440",
    modelText: "INFINITYEDGE 3.2K • CNC CHASSIS",
    bodyColor: "#4b5563",
    accentColor: "#0ea5e9",
  }),
  "xiaomi-14-ultra.svg": createSmartphoneSvg({
    title: "Xiaomi 14 Ultra",
    modelText: "LEICA SUMMILUX 1-INCH",
    bodyColor: "#27272a",
    accentColor: "#ef4444",
  }),
};

/**
 * Khởi tạo toàn bộ tài nguyên ảnh vật lý vào thư mục uploads
 */
function seedPhysicalAssets() {
  ensureUploadDirectories();

  // 1. Ghi file logo thương hiệu
  for (const [filename, svgContent] of Object.entries(BRAND_LOGOS)) {
    const filePath = path.join(BRANDS_DIR, filename);
    fs.writeFileSync(filePath, svgContent.trim(), "utf8");
  }
  console.log(`  🖼️  Đã nạp ${Object.keys(BRAND_LOGOS).length} logo thương hiệu vào uploads/brands/`);

  // 2. Ghi file ảnh sản phẩm SVG sắc nét
  for (const [filename, svgContent] of Object.entries(PRODUCT_IMAGES)) {
    const filePath = path.join(PRODUCTS_DIR, filename);
    fs.writeFileSync(filePath, svgContent.trim(), "utf8");
  }
  console.log(`  🖼️  Đã nạp ${Object.keys(PRODUCT_IMAGES).length} ảnh sản phẩm vào uploads/products/`);

  // 3. Sao chép ảnh hiện có từ FE nếu có để bổ sung thêm ảnh JPEG thực tế
  const feAssetsDir = path.join(__dirname, "..", "..", "..", "FE", "my-app", "src", "assets");
  const ip16Source = path.join(feAssetsDir, "ip16PRM.jpg");
  if (fs.existsSync(ip16Source)) {
    fs.copyFileSync(ip16Source, path.join(PRODUCTS_DIR, "ip16PRM.jpg"));
    fs.copyFileSync(ip16Source, path.join(PRODUCTS_DIR, "iphone-16-pro-max.jpg"));
    console.log("  📸 Đã đồng bộ ảnh thật ip16PRM.jpg vào uploads/products/");
  }

  const productSource = path.join(feAssetsDir, "product.jpg");
  if (fs.existsSync(productSource)) {
    fs.copyFileSync(productSource, path.join(PRODUCTS_DIR, "default-product.jpg"));
  }
}

module.exports = {
  seedPhysicalAssets,
  PRODUCTS_DIR,
  BRANDS_DIR,
};
