import { PRICE_RANGES, SORT_OPTIONS } from "@/constants/productFilters";

export const normalizeProductKeyword = (value) =>
  value.normalize("NFC").trim().replace(/\s+/gu, " ");

/** Phân loại input trước khi gọi API, không xóa ký tự cấm để biến thành query khác. */
export function inspectProductKeyword(value) {
  const keyword = normalizeProductKeyword(value);
  return {
    keyword,
    tooLong: [...keyword].length > 100,
    allowed: /^[\p{L}\p{Nd} ]*$/u.test(keyword),
  };
}

/** Chỉ chuyển dữ liệu sang hình dạng thẻ; giá, ưu đãi, tồn kho do BE quyết định. */
export function toProductCard(product) {
  const firstImage = product.images?.[0];
  return {
    ...product,
    brand: product.brand?.name || "",
    image:
      firstImage?.img_url ||
      firstImage?.image_url ||
      firstImage?.url ||
      firstImage?.path ||
      "",
    tagline: product.description || "",
    href: `/product_detail?id=${product.id}`,
  };
}

/** Đọc tiêu chí từ URL; giá trị cấu trúc sai quay về mặc định, không đổi ý nghĩa q. */
export function readProductCriteria(params) {
  const rawPage = params.get("page") || "1";
  const page =
    /^[1-9]\d*$/.test(rawPage) && Number.isSafeInteger(Number(rawPage))
      ? Number(rawPage)
      : 1;
  const category = params.get("cate") || params.get("cat") || "";
  const brand = params.get("brand") || "";
  return {
    q: normalizeProductKeyword(params.get("q") || ""),
    category: category === "all" ? "" : category,
    brand: brand === "all" ? "" : brand,
    price: PRICE_RANGES.some((range) => range.id === params.get("price"))
      ? params.get("price")
      : "all",
    sale: params.get("sale") === "true",
    sort: SORT_OPTIONS.some((option) => option.id === params.get("sort"))
      ? params.get("sort")
      : "newest",
    page,
    limit: 12,
  };
}

/** Một dạng URL chuẩn cho chia sẻ/Back; giữ cate, nhận cả cat của link cũ. */
export function productCriteriaParams(criteria) {
  const next = new URLSearchParams();
  if (criteria.q) next.set("q", criteria.q);
  if (criteria.category) next.set("cate", criteria.category);
  if (criteria.brand) next.set("brand", criteria.brand);
  if (criteria.price !== "all") next.set("price", criteria.price);
  if (criteria.sale) next.set("sale", "true");
  if (criteria.sort !== "newest") next.set("sort", criteria.sort);
  if (criteria.page > 1) next.set("page", String(criteria.page));
  return next;
}

/** Thao tác chủ động giữ q/filter đúng phạm vi, luôn reset trang khi đổi tiêu chí. */
export function changeProductCriteria(params, key, value) {
  const criteria = readProductCriteria(params);
  if (key === "reset")
    return productCriteriaParams({
      ...readProductCriteria(new URLSearchParams()),
      q: criteria.q,
    });
  if (key === "cate") {
    criteria.category = value === "all" ? "" : value;
    criteria.brand = "";
  } else if (key === "q") criteria.q = normalizeProductKeyword(value);
  else criteria[key] = value;
  if (key === "brand" && value === "all") criteria.brand = "";
  criteria.page = key === "page" ? value : 1;
  return productCriteriaParams(criteria);
}
