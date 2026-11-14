const { Op, QueryTypes, Transaction } = require("sequelize");
const {
  sequelize,
  Product,
  ProductVariant,
  Brand,
  ProductImage,
  VariantAttributeValue,
  VariantAttribute,
} = require("../../models");
const {
  buildAttributeInclude,
  transformProducts,
} = require("../../utils/variantHelper");
const {
  normalizeProductKeyword,
  isProductKeywordAllowed,
} = require("../../utils/productSearchQuery");

const PRICE_RANGES = {
  "under-10m": [0, 10000000],
  "10m-20m": [10000000, 20000000],
  "20m-30m": [20000000, 30000000],
  "above-30m": [30000000, null],
};
const SORTS = {
  newest: "p.created_at DESC, p.id DESC",
  price_asc: "minPrice ASC, p.id DESC",
  price_desc: "minPrice DESC, p.id DESC",
  popular: "p.sold_count DESC, p.id DESC",
};
const effectivePrice = (alias) =>
  `CASE WHEN ${alias}.sale_price > 0 AND ${alias}.sale_price < ${alias}.price THEN ${alias}.sale_price ELSE ${alias}.price END`;
// Q16: ưu đãi của Variant active vẫn có ý nghĩa khi hết hàng; không lọc stock ở đây.
const hasSale =
  "EXISTS (SELECT 1 FROM product_variants sale WHERE sale.product_id = p.id AND sale.status = 1 AND sale.sale_price > 0 AND sale.sale_price < sale.price)";

/**
 * Lấy một trang Product theo toàn bộ tiêu chí Client, kèm giá và tổng sau lọc.
 * SQL chỉ dùng cấu trúc cố định/allowlist; dữ liệu khách nhập luôn qua replacements.
 * Chọn SQL qua Sequelize ở đây vì cần chọn Variant đại diện + lọc giá trước LIMIT,
 * trong khi join hasMany trực tiếp có thể nhân Product và làm sai count/phân trang.
 */
async function getProductPage({
  q = "",
  category,
  brand,
  price = "all",
  sale,
  sort = "newest",
  page = 1,
  limit = 12,
} = {}) {
  q = normalizeProductKeyword(q);
  const empty = { data: [], total: 0, page: 1, limit, totalPages: 1 };
  // Query có ký tự cấm phải rỗng, không được xóa ký tự rồi tìm một query khác.
  if (!isProductKeywordAllowed(q)) return empty;

  const conditions = ["p.status = 1", "b.status = 1", "c.status = 1"];
  const replacements = {};
  if (category) {
    conditions.push("c.slug = :category");
    replacements.category = category;
  }
  if (brand) {
    conditions.push("b.slug = :brand");
    replacements.brand = brand;
  }
  // Mỗi từ phải khớp ít nhất một trường; đ/d phải đổi riêng vì collation MySQL
  // hiện tại bỏ dấu nguyên âm nhưng không coi đ là d. CONVERT xử lý charset cũ.
  q.split(" ")
    .filter(Boolean)
    .forEach((word, index) => {
      const key = `word${index}`;
      replacements[key] = `%${word.toLowerCase().replace(/đ/g, "d")}%`;
      conditions.push(
        `(${["p.name", "b.name", "c.name"].map((field) => `REPLACE(REPLACE(CONVERT(${field} USING utf8mb4), 'đ', 'd'), 'Đ', 'D') COLLATE utf8mb4_unicode_ci LIKE :${key}`).join(" OR ")})`,
      );
    });
  const range = PRICE_RANGES[price];
  if (range) {
    conditions.push(`${effectivePrice("chosen")} >= :minPrice`);
    replacements.minPrice = range[0];
    if (range[1] !== null) {
      conditions.push(`${effectivePrice("chosen")} < :maxPrice`);
      replacements.maxPrice = range[1];
    }
  }
  if (sale === "true" || sale === true) conditions.push(hasSale);

  // Variant còn hàng được ưu tiên; khi tất cả hết hàng vẫn chọn một Variant active.
  // ID phá hòa khi giá bằng nhau để originalPrice không đổi ngẫu nhiên mỗi request.
  const from = `FROM products p
    JOIN brands b ON b.id = p.brand_id
    JOIN categories c ON c.id = p.category_id
    JOIN product_variants chosen ON chosen.id = (
      SELECT candidate.id FROM product_variants candidate
      WHERE candidate.product_id = p.id AND candidate.status = 1
      ORDER BY (candidate.stock > 0) DESC, ${effectivePrice("candidate")} ASC, candidate.id ASC LIMIT 1
    ) WHERE ${conditions.join(" AND ")}`;

  // Count, trang và hydrate cùng snapshot: dữ liệu thay đổi giữa các query không
  // được làm metadata nói có Product nhưng trang trả thiếu Product đó.
  return sequelize.transaction(
    { isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ },
    async (transaction) => {
      const select = (sql, extra = {}) =>
        sequelize.query(sql, {
          replacements: { ...replacements, ...extra },
          type: QueryTypes.SELECT,
          transaction,
        });
      const [count] = await select(`SELECT COUNT(*) AS total ${from}`);
      const total = Number(count.total);
      if (!total) return empty;
      const totalPages = Math.ceil(total / limit);
      const safePage = Math.min(page, totalPages);
      const rows = await select(
        `SELECT p.id, ${effectivePrice("chosen")} AS minPrice,
      chosen.price AS originalPrice, (chosen.stock <= 0) AS isOutOfStock, ${hasSale} AS hasSale
      ${from} ORDER BY ${SORTS[sort] || SORTS.newest} LIMIT :pageLimit OFFSET :offset`,
        { pageLimit: limit, offset: (safePage - 1) * limit },
      );
      // Chỉ nạp quan hệ của ID thuộc trang, không tải toàn bộ catalog về Node rồi slice.
      const products = await Product.findAll({
        where: { id: { [Op.in]: rows.map((row) => row.id) } },
        transaction,
        include: [
          { model: Brand, as: "brand" },
          {
            model: ProductVariant,
            as: "variants",
            where: { status: 1 },
            required: false,
            include: buildAttributeInclude({
              VariantAttributeValue,
              VariantAttribute,
            }),
          },
          { model: ProductImage, as: "images" },
        ],
        order: [[{ model: ProductImage, as: "images" }, "id", "ASC"]],
      });
      const byId = new Map(
        transformProducts(products).map((product) => [
          Number(product.id),
          product,
        ]),
      );
      const data = rows.map((row) => ({
        ...byId.get(Number(row.id)),
        minPrice: Number(row.minPrice),
        originalPrice: Number(row.originalPrice),
        hasSale: Boolean(Number(row.hasSale)),
        isOutOfStock: Boolean(Number(row.isOutOfStock)),
      }));
      return { data, total, page: safePage, limit, totalPages };
    },
  );
}

module.exports = { getProductPage };
