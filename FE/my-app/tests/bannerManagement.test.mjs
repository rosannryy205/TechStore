import assert from "node:assert/strict";
import { test, describe } from "node:test";
import {
  BANNER_POSITIONS,
  BANNER_SPECS_CONFIG,
  AMBIENT_PRESETS,
  INITIAL_MOCK_BANNERS,
} from "../src/constants/bannerPresets.js";

describe("Banner Management UI Presets & Specifications", () => {
  test("BANNER_POSITIONS defines both hero_slide and trade_in", () => {
    assert.equal(BANNER_POSITIONS.length, 2);
    const posValues = BANNER_POSITIONS.map((p) => p.value);
    assert.ok(posValues.includes("hero_slide"));
    assert.ok(posValues.includes("trade_in"));
  });

  test("BANNER_SPECS_CONFIG enforces Alpha channel requirement for Hero 3D device", () => {
    const heroDeviceSpec = BANNER_SPECS_CONFIG.hero_slide.device;
    assert.ok(heroDeviceSpec);
    assert.equal(heroDeviceSpec.requireAlpha, true);
    assert.equal(heroDeviceSpec.aspectRatio, 1);
    assert.ok(heroDeviceSpec.allowedFormats.includes("image/png"));
    assert.ok(heroDeviceSpec.allowedFormats.includes("image/webp"));
    assert.ok(!heroDeviceSpec.allowedFormats.includes("image/jpeg"));
  });

  test("BANNER_SPECS_CONFIG sets correct aspect ratio for Typography Inline and Trade-in", () => {
    const inlineSpec1 = BANNER_SPECS_CONFIG.hero_slide.inline1;
    const inlineSpec2 = BANNER_SPECS_CONFIG.hero_slide.inline2;
    const tradeInSpec = BANNER_SPECS_CONFIG.trade_in.device;

    assert.equal(inlineSpec1.aspectRatio, 16 / 9);
    assert.equal(inlineSpec2.aspectRatio, 16 / 9);
    assert.equal(tradeInSpec.aspectRatio, 14 / 11);
  });

  test("AMBIENT_PRESETS contains valid rgba values and hex accents", () => {
    assert.ok(AMBIENT_PRESETS.length >= 4);
    for (const preset of AMBIENT_PRESETS) {
      assert.ok(preset.label);
      assert.ok(preset.value.startsWith("rgba("));
      assert.ok(preset.hex.startsWith("#"));
    }
  });

  test("INITIAL_MOCK_BANNERS has valid seed banners with required 3D properties", () => {
    assert.ok(INITIAL_MOCK_BANNERS.length >= 4);

    const heroSlides = INITIAL_MOCK_BANNERS.filter((b) => b.position === "hero_slide");
    assert.equal(heroSlides.length, 3);

    for (const slide of heroSlides) {
      assert.ok(slide.id);
      assert.ok(slide.title);
      assert.ok(slide.image_url);
      assert.ok(slide.ambient_color);
      assert.ok(Array.isArray(slide.specs));
      assert.equal(slide.specs.length, 3);
      assert.equal(typeof slide.display_order, "number");
      assert.equal(slide.status, 1);
    }

    const tradeIn = INITIAL_MOCK_BANNERS.find((b) => b.position === "trade_in");
    assert.ok(tradeIn);
    assert.ok(tradeIn.title);
    assert.ok(tradeIn.image_url);
  });
});
