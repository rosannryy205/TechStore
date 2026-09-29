import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Notification from "../../components/Notification";
import { CommentSection } from "../../components/comments";
import { useAuth } from "../../contexts/authContext";
import { useAuthModal } from "../../contexts/authModalContext";

const API_BASE_URL = "http://localhost:3000/"; // Cấu hình URL API backend

// Nút bấm dùng lại cho CTA chính/phụ.
const ActionButton = ({ children, onClick, ariaLabel, variant }) => {
  const isPrimary = variant === "primary";
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={
        isPrimary
          ? "inline-flex items-center justify-center rounded-full bg-[#0066cc] text-white text-[17px] font-normal tracking-[-0.374px] leading-[1.47] px-5.5 py-2.75 hover:bg-[#0071e3] active:scale-95 transition-all cursor-pointer border-none outline-none"
          : "inline-flex items-center justify-center rounded-full bg-transparent text-[#0066cc] text-[17px] font-normal tracking-[-0.374px] leading-[1.47] px-5 py-2.75 border border-[#0066cc] hover:bg-[rgba(0,102,204,0.06)] active:scale-95 transition-all cursor-pointer outline-none"
      }
      style={{
        fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif",
      }}
    >
      {children}
    </button>
  );
};

// Component hiển thị các option dạng nút (radio).
const OptionGroup = ({ label, name, items, selectedId, onSelect }) => {
  return (
    <div className="w-full">
      <div className="text-[14px] font-semibold tracking-[-0.224px] leading-[1.29] text-[#1d1d1f] mb-2">
        {label}
      </div>

      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={name}>
        {items.map((it) => {
          const isSel = it.id === selectedId;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => onSelect(it.id)}
              role="radio"
              aria-checked={isSel}
              aria-label={it.label}
              className={
                isSel
                  ? "px-4 py-2.5 rounded-full border-2 border-[#0071e3] bg-white/0 text-[#1d1d1f] text-[14px] font-normal tracking-[-0.224px] leading-[1.43] active:scale-95 transition-transform cursor-pointer"
                  : "px-4 py-2.5 rounded-full border border-[rgba(0,0,0,0.08)] bg-white text-[#1d1d1f] text-[14px] font-normal tracking-[-0.224px] leading-[1.43] hover:bg-[#f5f5f7] active:scale-95 transition-transform cursor-pointer"
              }
              style={{
                fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif",
              }}
            >
              {it.id === selectedId && "• "}
              {it.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function Product_detail() {
  const [searchParams] = useSearchParams();
  const productIdFromQuery = searchParams.get("id");

  // State cho data từ API.
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State riêng cho sản phẩm liên quan (tránh làm hỏng trang chính khi lỗi).
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedError, setRelatedError] = useState(null);

  // State biến thể người dùng chọn.
  // Mặc định chọn biến thể đầu tiên (sẽ được sync sau khi fetch xong).
  const [selected, setSelected] = useState({
    color: null,
    ram: null,
    storage: null,
  });

  // Chuẩn hóa danh sách variants từ BE.
  // BE trả: product.variants là mảng các variant.
  const productVariants = useMemo(() => product?.variants ?? [], [product]);

  // Lọc các tùy chọn để render (không hard-code).
  const variantOptions = useMemo(() => {
    const colors = new Map();
    const rams = new Map();
    const storages = new Map();

    for (const v of productVariants) {
      if (v?.color && !colors.has(v.color)) colors.set(v.color, v.color);
      if (v?.ram && !rams.has(v.ram)) rams.set(v.ram, v.ram);
      if (v?.storage && !storages.has(v.storage))
        storages.set(v.storage, v.storage);
    }

    return {
      colors: Array.from(colors).map((c) => ({ id: c[0], label: c[1] })),
      rams: Array.from(rams).map((r) => ({ id: r[0], label: r[1] })),
      storages: Array.from(storages).map((s) => ({ id: s[0], label: s[1] })),
    };
  }, [productVariants]);

  // Chọn variant phù hợp theo (color, ram, storage).
  // Nếu chưa có selected hoặc không match được thì fallback variant đầu tiên.
  const selectedVariant = useMemo(() => {
    if (!productVariants.length) return null;

    const found = productVariants.find(
      (v) =>
        v.color === selected.color &&
        v.ram === selected.ram &&
        v.storage === selected.storage,
    );

    return found ?? productVariants[0];
  }, [productVariants, selected.color, selected.ram, selected.storage]);

  // Giá trị đã "chốt" theo variant khả dụng (dựa trên selectedVariant).
  // Không dùng effect để setState => tránh cascading render.
  // Các OptionGroup hiển thị dựa trên giá trị này thay vì selected thô.
  const effectiveSelected = useMemo(
    () => ({
      color: selectedVariant?.color ?? null,
      ram: selectedVariant?.ram ?? null,
      storage: selectedVariant?.storage ?? null,
    }),
    [selectedVariant],
  );

  // Fetch product theo id từ FE -> BE.
  useEffect(() => {
    const fetchProduct = async () => {
      // Nếu chưa có id thì dừng.
      if (!productIdFromQuery) {
        setError("Missing product id.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${API_BASE_URL}api/products/${productIdFromQuery}`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        // BE trả: { success: true, data: product }
        setProduct(json?.data ?? null);
      } catch {
        setError("Failed to load product.");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedProducts = async () => {
      try {
        setRelatedError(null);
        const res = await fetch(
          `${API_BASE_URL}api/products/${productIdFromQuery}/related`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        // Chuẩn hóa cấu trúc BE (Product) về shape JSX cần dùng.
        const normalized = (json?.data ?? []).map((p) => ({
          id: p.id,
          name: p.name,
          tagline: p.description || "",
          href: `/product_detail?id=${p.id}`,
          image:
            p.images?.[0]?.img_url ||
            p.images?.[0]?.image_url ||
            "/src/assets/product.jpg",
          cta: "Xem ngay",
        }));
        setRelatedProducts(normalized);
      } catch {
        // Lỗi liên quan KHÔNG làm hỏng trang chính — dùng state riêng.
        setRelatedError("Không thể tải sản phẩm liên quan.");
        setRelatedProducts([]);
      }
    };

    fetchRelatedProducts();
    fetchProduct();
  }, [productIdFromQuery]);

  // Quy đổi format tiền theo VND.
  const pricing = useMemo(
    () => ({
      format: (v) => {
        const num = Number(v);
        if (!Number.isFinite(num)) return "";
        // Giữ 0 phần thập phân cho đồng VN.
        return new Intl.NumberFormat("vi-VN").format(Math.round(num)) + " ₫";
      },
    }),
    [],
  );

  // Main image theo variant đang chọn (ưu tiên images gắn với variant_id).
  const mainImage = useMemo(() => {
    const images = product?.images ?? [];
    if (!images.length) return "/src/assets/product.jpg";

    // 1. Nếu có selectedVariant, ưu tiên tìm ảnh của biến thể đó trước
    if (selectedVariant?.id) {
      const matched = images.find(
        (img) => String(img.variant_id) === String(selectedVariant.id),
      );
      if (matched) {
        return (
          matched.img_url ||
          matched.image_url ||
          matched.url ||
          matched.path ||
          "/src/assets/product.jpg"
        );
      }
    }

    // 2. LÀM ĐIỀU NÀY NẾU TRÊN KHÔNG KHỚP: Lấy ảnh đầu tiên của mảng images làm ảnh chính
    const firstImage = images[0];
    return (
      firstImage.img_url ||
      firstImage.image_url ||
      firstImage.url ||
      firstImage.path ||
      "/src/assets/product.jpg"
    );
  }, [product, selectedVariant]); // Thêm dependency array để useMemo hoạt động đúng
  // Map text theo API (ưu tiên field có sẵn; tránh hard-code khi có data từ BE).
  const mapped = useMemo(() => {
    const name = product?.name || "Sản phẩm";
    // BE bạn đưa: không thấy product.category; fallback sang brand.name.
    const category = product?.category || product?.brand?.name || "";
    const description = product?.description || "";

    return { name, category, description };
  }, [product]);

  // Giá hiển thị theo variant đang chọn.
  // Ưu tiên sale_price nếu có và > 0, còn không thì dùng price.
  const displayPrice = useMemo(() => {
    const v = selectedVariant;
    if (!v) return null;

    const sale = Number(v.sale_price);
    const price = Number(v.price);

    if (Number.isFinite(sale) && sale > 0) return sale;
    if (Number.isFinite(price) && price > 0) return price;

    return null;
  }, [selectedVariant]);

  // Mô tả: ưu tiên description từ BE.
  const computedDescription = useMemo(
    () => mapped.description || "",
    [mapped.description],
  );

  // UI phần liên quan: giữ demo để không phụ thuộc API.
  // const relatedProducts = useMemo(
  //   () => [
  //     {
  //       id: "related-1",
  //       name: "iPhone Pro Max 512GB",
  //       tagline: "Hiệu năng cao, màn hình sống động, sẵn sàng cho mọi tác vụ.",
  //       href: "/product_detail?id=1",
  //       cta: "Xem ngay",
  //       image: "/src/assets/product.jpg",
  //     },
  //     {
  //       id: "related-2",
  //       name: "iPhone Pro 256GB",
  //       tagline: "Tối ưu tốc độ, chụp ảnh sắc nét, trải nghiệm mượt mà.",
  //       href: "/product_detail?id=1",
  //       cta: "Xem ngay",
  //       image: "/src/assets/product.jpg",
  //     },
  //     {
  //       id: "related-3",
  //       name: "iPhone Plus 128GB",
  //       tagline: "Cân bằng gọn nhẹ và hiệu năng ổn định mỗi ngày.",
  //       href: "/product_detail?id=1",
  //       cta: "Khám phá",
  //       image: "/src/assets/product.jpg",
  //     },
  //     {
  //       id: "related-4",
  //       name: "iPhone Pro 512GB",
  //       tagline: "Dung lượng lớn, lưu trữ thoải mái, hiệu năng bền bỉ.",
  //       href: "/product_detail?id=1",
  //       cta: "Xem ngay",
  //       image: "/src/assets/product.jpg",
  //     },
  //   ],
  //   [],
  // );

  const { user, isAuthenticated, loading: authLoading, refreshMe } = useAuth();
  const { openLogin } = useAuthModal();
  const navigate = useNavigate();

  // Giỏ + lưu (UI)
  const [inCart, setInCart] = useState(false);
  const [saved, setSaved] = useState(false);

  // Notification: thông báo khi cần đăng nhập / thành công / lỗi.
  // Cấu trúc: { message, type, actionLabel, onAction } | null
  const [notification, setNotification] = useState(null);

  const closeNotification = () => setNotification(null);

  const requireLogin = () =>
    setNotification({
      type: "warning",
      message: "Bạn cần đăng nhập để tiếp tục.",
      actionLabel: "Đăng nhập",
      onAction: openLogin,
    });

  const toggleSave = () => {
    // Chưa đăng nhập → yêu cầu đăng nhập.
    if (!isAuthenticated) {
      requireLogin();
      return;
    }

    setSaved((s) => {
      const next = !s;
      setNotification({
        type: "success",
        message: next ? "Đã lưu sản phẩm." : "Đã bỏ lưu sản phẩm.",
      });
      return next;
    });
  };

  // Chống double-submit khi user double-click / request bị gọi lại do re-render.
  // Dùng ref để chặn ngay trong cùng tick (không phụ thuộc setState timing).
  const isPostingRef = useRef(false);
  const [isPosting, setIsPosting] = useState(false);

  // Thêm sản phẩm vào giỏ trong database
  // - Bắt buộc đăng nhập
  // - Nếu user chưa có cart => BE tự tạo cart
  // - Sau khi thêm => render lại dữ liệu cart ở Cart.jsx
  const handleAddToCart = async () => {
    setNotification(null);

    // Chống double-submit (double-click / submit lại do re-render)
    if (isPostingRef.current) return;
    isPostingRef.current = true;

    // Nếu chưa xác định auth thì tránh gọi API
    if (authLoading) {
      isPostingRef.current = false;
      return;
    }

    // Bắt buộc đăng nhập
    if (!isAuthenticated) {
      setNotification({
        type: "warning",
        message: "Bạn cần đăng nhập để tiếp tục.",
        actionLabel: "Đăng nhập",
        onAction: openLogin,
      });
      isPostingRef.current = false;
      return;
    }

    if (!selectedVariant?.id || !product?.id) {
      setNotification({
        type: "error",
        message: "Vui lòng chọn biến thể sản phẩm hợp lệ.",
      });
      isPostingRef.current = false;
      return;
    }

    try {
      setInCart(true);
      setIsPosting(true);

      const res = await fetch(`${API_BASE_URL}api/cart/items`, {
        method: "POST",
        credentials: "include", // gửi cookie httpOnly
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariant.id,
          quantity: 1,
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.message || `HTTP ${res.status}`);
      }

      // Sync lại session user (tùy BE, nhưng giúp đảm bảo FE biết auth mới nhất)
      await refreshMe();

      // Báo cho Header cập nhật lại badge số lượng giỏ hàng
      window.dispatchEvent(new Event("cart:updated"));

      // Thành công => tắt trạng thái UI và điều hướng tới trang cart để render lại
      setTimeout(() => {
        setInCart(false);
        setIsPosting(false);
        isPostingRef.current = false;
      }, 300);
      navigate("/cart");
    } catch (e) {
      setNotification({
        type: "error",
        message: e?.message || "Không thể thêm vào giỏ.",
      });
      setTimeout(() => {
        setInCart(false);
        setIsPosting(false);
        isPostingRef.current = false;
      }, 1000);
    }
  };

  // Loading/Error UI.
  if (loading) {
    return (
      <section
        className="w-full"
        style={{
          fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif",
        }}
      >
        <div className="w-full px-4 py-16 text-center">Loading...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className="w-full"
        style={{
          fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif",
        }}
      >
        <div className="w-full px-4 py-8 bg-red-50 text-center text-red-700">
          {error}
        </div>
      </section>
    );
  }

  // Render từ API.
  return (
    <section
      aria-label="Chi tiết sản phẩm"
      className="w-full"
      style={{
        fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif",
      }}
    >
      {/* SECTION 1: Ảnh + Thông tin */}
      <div className="min-h-svh bg-[#ffffff]" style={{ overflow: "hidden" }}>
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 pt-8 sm:pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-8 lg:gap-10">
            <div className="w-full" aria-label="Ảnh sản phẩm">
              <div className="relative">
                <div className="h-[52svh] min-h-105 max-h-160 overflow-hidden">
                  <img
                    src={`../src/assets/${mainImage}`}
                    alt={mapped.name}
                    className="w-full h-full object-contain"
                    style={{ filter: "saturate(1.02)" }}
                  />
                </div>
                <div
                  className="mx-auto w-[70%] h-4.5 -mt-3.5"
                  style={{
                    boxShadow: "rgba(0, 0, 0, 0.22) 3px 5px 30px 0",
                    borderRadius: "9999px",
                    opacity: 0.08,
                  }}
                />
              </div>
            </div>

            <div className="w-full">
              <div className="pt-4 sm:pt-6 lg:pt-2">
                {/* Nhãn danh mục/brand (API hiện có thể không trả category, nên dùng brand nếu có) */}
                <div className="text-[12px] font-normal tracking-[-0.12px] leading-none text-[#7a7a7a] mb-3">
                  {mapped.category || ""}
                </div>

                <h1
                  className="text-[40px] sm:text-[44px] font-semibold tracking-[-0.374px] leading-[1.1] text-[#1d1d1f]"
                  style={{
                    fontFamily:
                      "SF Pro Display, system-ui, -apple-system, sans-serif",
                    letterSpacing: "-0.374px",
                  }}
                >
                  {mapped.name}
                </h1>

                <p className="text-[17px] font-normal tracking-[-0.374px] leading-[1.47] text-[#1d1d1f] mt-3">
                  {/* short desc: ưu tiên description BE, cắt ngắn nếu có */}
                  {computedDescription
                    ? computedDescription.slice(0, 120) +
                      (computedDescription.length > 120 ? "..." : "")
                    : ""}
                </p>

                <div className="mt-7">
                  <div className="text-[12px] font-semibold tracking-[0.231px] leading-none text-[#7a7a7a]">
                    GIÁ
                  </div>
                  <div className="text-[34px] font-semibold tracking-[-0.374px] leading-[1.47] text-[#1d1d1f] mt-2">
                    {displayPrice ? pricing.format(displayPrice) : ""}
                  </div>
                </div>

                {/* Biến thể: render option lấy từ API để dễ mở rộng */}
                <div className="mt-8">
                  <OptionGroup
                    label="Màu"
                    name="Màu"
                    items={variantOptions.colors}
                    selectedId={effectiveSelected.color}
                    onSelect={(id) => {
                      // Khi đổi màu, cố gắng giữ ram/storage nếu variant tương ứng tồn tại.
                      setSelected((s) => ({ ...s, color: id }));
                    }}
                  />

                  <div className="mt-6">
                    <OptionGroup
                      label="RAM"
                      name="RAM"
                      items={variantOptions.rams}
                      selectedId={effectiveSelected.ram}
                      onSelect={(id) => {
                        setSelected((s) => ({ ...s, ram: id }));
                      }}
                    />
                  </div>

                  <div className="mt-6">
                    <OptionGroup
                      label="Bộ nhớ"
                      name="Bộ nhớ"
                      items={variantOptions.storages}
                      selectedId={effectiveSelected.storage}
                      onSelect={(id) => {
                        setSelected((s) => ({ ...s, storage: id }));
                      }}
                    />
                  </div>

                  {/* Thông tin stock/sản phẩm theo variant được chọn (nếu backend có stock). */}
                  <div className="mt-4 text-[14px] text-[#1d1d1f]">
                    {typeof selectedVariant?.stock === "number" ? (
                      <span className="text-[#7a7a7a]">
                        Còn lại:{" "}
                        <b className="text-[#1d1d1f]">
                          {selectedVariant.stock}
                        </b>
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
                  <ActionButton
                    variant="primary"
                    ariaLabel="Thêm vào giỏ"
                    onClick={handleAddToCart}
                  >
                    {inCart
                      ? "Đã thêm ✓"
                      : isPosting
                        ? "Đang thêm..."
                        : "Thêm vào giỏ"}
                  </ActionButton>

                  <ActionButton
                    variant="secondary"
                    ariaLabel="Lưu sản phẩm"
                    onClick={toggleSave}
                  >
                    {saved ? "Đã lưu" : "Lưu sản phẩm"}
                  </ActionButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Mô tả */}
      <div className="bg-[#f5f5f7] border-t border-[#e0e0e0]">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 py-16">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div
                className="text-[12px] font-semibold tracking-[0.231px] leading-none text-[#7a7a7a] mb-3"
                style={{ letterSpacing: "0.231px" }}
              >
                MÔ TẢ SẢN PHẨM
              </div>
              <h2
                className="text-[34px] font-semibold tracking-[-0.374px] leading-[1.47] text-[#1d1d1f]"
                style={{
                  fontFamily:
                    "SF Pro Display, system-ui, -apple-system, sans-serif",
                  letterSpacing: "-0.374px",
                }}
              >
                {mapped.name}
              </h2>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-[17px] font-normal tracking-[-0.374px] leading-[1.47] text-[#1d1d1f]">
              {computedDescription}
            </p>

            {/* Specs: chưa map theo BE, nên dùng demo tạm */}
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                "Thông tin chi tiết",
                "Tính năng nổi bật",
                "Chất lượng sản phẩm",
              ].map((b) => (
                <li
                  key={b}
                  className="rounded-[11px] bg-white border border-[rgba(0,0,0,0.08)] p-4"
                >
                  <p className="text-[14px] font-semibold tracking-[-0.224px] leading-[1.43] text-[#1d1d1f]">
                    {b}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* SECTION 3: Bình luận sản phẩm */}
      <div className="bg-[#ffffff] border-t border-[#e0e0e0]">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 py-16">
          <CommentSection
            productId={productIdFromQuery}
            isAuthenticated={isAuthenticated}
            user={user}
            onRequireLogin={requireLogin}
          />
        </div>
      </div>

      {/* SECTION 4: Liên quan */}
      <div className="bg-[#ffffff]">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 py-16">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-[12px] font-semibold tracking-[0.231px] leading-none text-[#7a7a7a] mb-3">
                SẢN PHẨM LIÊN QUAN
              </div>
              <h2
                className="text-[40px] font-semibold tracking-[-0.374px] leading-[1.1] text-[#1d1d1f]"
                style={{
                  fontFamily:
                    "SF Pro Display, system-ui, -apple-system, sans-serif",
                }}
              >
                Gợi ý dành cho bạn
              </h2>
            </div>
          </div>

          {relatedError ? (
            <p className="mt-10 text-center text-[14px] text-red-600">
              {relatedError}
            </p>
          ) : relatedProducts.length === 0 ? null : (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {relatedProducts.map((p) => (
                <article
                  key={p.id}
                  className={[
                    "rounded-lg",
                    "overflow-hidden",
                    "flex flex-col items-center",
                    "text-center",
                    "border",
                    "border-transparent",
                    "transition-transform duration-300 ease-out",
                    "group",
                    "text-[#1d1d1f]",
                    "translate-y-0",
                    "relative",
                  ].join(" ")}
                >
                  <div className="w-full">
                    <img
                      src={`../src/assets/${p.image}`}
                      alt={p.name}
                      className="w-full h-55 sm:h-65 lg:h-70 object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                      style={{
                        boxShadow: "rgba(0, 0, 0, 0.22) 3px 5px 30px 0",
                        borderRadius: 18,
                      }}
                      loading="lazy"
                    />
                  </div>

                  <div className="mt-8 transition-transform duration-300 ease-out group-hover:-translate-y-1">
                    <h3
                      className="text-[17px] sm:text-[18px] font-semibold leading-[1.24] tracking-[-0.374px]"
                      style={{
                        fontFamily:
                          "SF Pro Text, system-ui, -apple-system, sans-serif",
                      }}
                    >
                      {p.name}
                    </h3>
                    <p
                      title={p.tagline}
                      className="w-full min-w-0 mt-2 text-[17px] leading-[1.47] tracking-[-0.374px] line-clamp-2 h-12.5 overflow-hidden text-ellipsis"
                      style={{
                        fontFamily:
                          "SF Pro Text, system-ui, -apple-system, sans-serif",
                        fontWeight: 400,
                        color: "#1d1d1f",
                      }}
                    >
                      {p.tagline}
                    </p>

                    <div className="mt-6">
                      <a
                        href={p.href}
                        className="inline-flex items-center justify-center rounded-full bg-[#0066cc] text-white text-[18px] font-light leading-none px-7 py-3.5 hover:bg-[#0071e3] active:scale-95 transition-all no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
                        style={{
                          fontFamily:
                            "SF Pro Text, system-ui, -apple-system, sans-serif",
                        }}
                        aria-label={`Xem ${p.name}`}
                      >
                        {p.cta}
                      </a>
                    </div>
                  </div>

                  <div
                    aria-hidden="true"
                    className={[
                      "pointer-events-none absolute inset-0 rounded-lg",
                      "border border-transparent",
                      "transition-opacity duration-300 ease-out",
                      "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
                      "ring-1 ring-[#0071e3]/20 group-hover:ring-[#0071e3]/40 group-focus-within:ring-[#0071e3]/40",
                    ].join(" ")}
                  />
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notification: hiển thị thông báo cần đăng nhập / thành công / lỗi */}
      <Notification
        isOpen={!!notification}
        type={notification?.type ?? "success"}
        message={notification?.message ?? ""}
        actionLabel={notification?.actionLabel}
        onAction={notification?.onAction}
        onClose={closeNotification}
      />
    </section>
  );
}
