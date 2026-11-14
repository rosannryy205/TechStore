const assert = require("node:assert/strict");
const { test, describe } = require("node:test");
const { Banner, Product, Category } = require("../src/models/index.js");

describe("Banner Model & Database Relationships", () => {
  test("Banner model is properly defined with correct table name", () => {
    assert.ok(Banner);
    assert.equal(Banner.tableName, "banners");
  });

  test("Banner model contains all required 3D and media fields", () => {
    const rawAttributes = Banner.rawAttributes;

    assert.ok(rawAttributes.id);
    assert.ok(rawAttributes.position);
    assert.ok(rawAttributes.title);
    assert.ok(rawAttributes.badge);
    assert.ok(rawAttributes.description);
    assert.ok(rawAttributes.image_url);
    assert.ok(rawAttributes.inline_img_1);
    assert.ok(rawAttributes.inline_img_2);
    assert.ok(rawAttributes.primary_cta_label);
    assert.ok(rawAttributes.primary_cta_link);
    assert.ok(rawAttributes.ambient_color);
    assert.ok(rawAttributes.chip_badge);
    assert.ok(rawAttributes.metric_value);
    assert.ok(rawAttributes.metric_label);
    assert.ok(rawAttributes.specs);
    assert.ok(rawAttributes.display_order);
    assert.ok(rawAttributes.status);
    assert.ok(rawAttributes.product_id);
    assert.ok(rawAttributes.category_id);
  });

  test("Banner has clear relationship with Product (belongsTo & hasMany)", () => {
    assert.ok(Banner.associations.product, "Banner must belong to Product");
    assert.equal(Banner.associations.product.foreignKey, "product_id");

    assert.ok(Product.associations.banners, "Product must have many Banners");
    assert.equal(Product.associations.banners.foreignKey, "product_id");
  });

  test("Banner has clear relationship with Category (belongsTo & hasMany)", () => {
    assert.ok(Banner.associations.category, "Banner must belong to Category");
    assert.equal(Banner.associations.category.foreignKey, "category_id");

    assert.ok(Category.associations.banners, "Category must have many Banners");
    assert.equal(Category.associations.banners.foreignKey, "category_id");
  });
});
