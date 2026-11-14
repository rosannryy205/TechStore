// Chuẩn hóa Unicode trước khi kiểm tra để tiếng Việt gõ bằng dấu tổ hợp vẫn hợp lệ.
const normalizeProductKeyword = (value) =>
  value.normalize("NFC").trim().replace(/\s+/gu, " ");
const isProductKeywordAllowed = (value) => /^[\p{L}\p{Nd} ]*$/u.test(value);

module.exports = { normalizeProductKeyword, isProductKeywordAllowed };
