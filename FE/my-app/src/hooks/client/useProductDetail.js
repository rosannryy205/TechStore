import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/authContext";
import { useAuthModal } from "@/contexts/authModalContext";
import { productService } from "@/services/api/client/productService";
import { cartService } from "@/services/api/client/cartService";
import defaultProductImage from "@/assets/product.jpg";

export function useProductDetail() {
  const [searchParams] = useSearchParams();
  const productIdFromQuery = searchParams.get("id");
  const navigate = useNavigate();

  const { isAuthenticated, loading: authLoading, refreshMe } = useAuth();
  const { openLogin } = useAuthModal();

  const [product, setProduct] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(Boolean(productIdFromQuery));
  const [fetchError, setFetchError] = useState(null);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedError, setRelatedError] = useState(null);

  const [selected, setSelected] = useState({});
  const [inCart, setInCart] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notification, setNotification] = useState(null);

  const isPostingRef = useRef(false);

  const productVariants = useMemo(() => product?.variants ?? [], [product]);

  // Lọc danh sách option theo attributeValues
  const variantOptions = useMemo(() => {
    const attributeMap = new Map();

    for (const v of productVariants) {
      if (v?.attributeValues) {
        for (const av of v.attributeValues) {
          const attrKey = av.attribute?.name;
          const attrLabel = av.attribute?.display_name || attrKey;
          if (!attrKey) continue;

          if (!attributeMap.has(attrKey)) {
            attributeMap.set(attrKey, { label: attrLabel, options: new Map() });
          }
          const attrData = attributeMap.get(attrKey);
          if (!attrData.options.has(av.value)) {
            attrData.options.set(av.value, av.value);
          }
        }
      }
    }

    return Array.from(attributeMap.entries()).map(([key, data]) => ({
      key,
      label: data.label,
      options: Array.from(data.options.values()).map((val) => ({
        id: val,
        label: val,
      })),
    }));
  }, [productVariants]);

  // Variant phù hợp nhất
  const selectedVariant = useMemo(() => {
    if (!productVariants.length) return null;

    const found = productVariants.find((v) => {
      if (v.attributeValues && v.attributeValues.length > 0) {
        for (const [key, value] of Object.entries(selected)) {
          const match = v.attributeValues.some(
            (av) => av.attribute?.name === key && av.value === value
          );
          if (!match) return false;
        }
        return true;
      }
      for (const [key, value] of Object.entries(selected)) {
        if (v[key] !== value) return false;
      }
      return true;
    });

    return found ?? null;
  }, [productVariants, selected]);

  // Fetch product data
  useEffect(() => {
    let ignore = false;

    if (!productIdFromQuery) {
      return;
    }

    const loadData = async () => {
      try {
        setFetchLoading(true);
        setFetchError(null);

        const productData = await productService.getProductDetail(productIdFromQuery);

        if (!ignore) {
          setProduct(productData);

          if (productData?.variants?.length > 0) {
            const firstVariant = productData.variants[0];
            const initialSelected = {};
            if (firstVariant.attributeValues) {
              firstVariant.attributeValues.forEach((av) => {
                if (av.attribute?.name) {
                  initialSelected[av.attribute.name] = av.value;
                }
              });
            }
            setSelected(initialSelected);
          }
        }
      } catch (err) {
        if (!ignore) {
          setFetchError(err?.message || "Failed to load product.");
          setProduct(null);
        }
      } finally {
        if (!ignore) {
          setFetchLoading(false);
        }
      }
    };

    const loadRelated = async () => {
      try {
        setRelatedError(null);
        const related = await productService.getRelatedProducts(productIdFromQuery);
        if (!ignore) {
          const normalized = (related ?? []).map((p) => ({
            id: p.id,
            name: p.name,
            tagline: p.description || "",
            href: `/product_detail?id=${p.id}`,
            image:
              p.images?.[0]?.img_url ||
              p.images?.[0]?.image_url ||
              defaultProductImage,
            cta: "Xem ngay",
          }));
          setRelatedProducts(normalized);
        }
      } catch {
        if (!ignore) {
          setRelatedError("Không thể tải sản phẩm liên quan.");
          setRelatedProducts([]);
        }
      }
    };

    loadData();
    loadRelated();

    return () => {
      ignore = true;
    };
  }, [productIdFromQuery]);

  // Main image resolver
  const mainImage = useMemo(() => {
    const images = product?.images ?? [];
    if (!images.length) return defaultProductImage;

    if (selectedVariant?.id) {
      const matched = images.find(
        (img) => String(img.variant_id) === String(selectedVariant.id)
      );
      if (matched) {
        return (
          matched.img_url ||
          matched.image_url ||
          matched.url ||
          matched.path ||
          defaultProductImage
        );
      }
    }

    const firstImage = images[0];
    return (
      firstImage.img_url ||
      firstImage.image_url ||
      firstImage.url ||
      firstImage.path ||
      defaultProductImage
    );
  }, [product, selectedVariant]);

  const displayPrice = useMemo(() => {
    const v = selectedVariant;
    if (!v) return null;
    const sale = Number(v.sale_price);
    const price = Number(v.price);
    if (Number.isFinite(sale) && sale > 0) return sale;
    if (Number.isFinite(price) && price > 0) return price;
    return null;
  }, [selectedVariant]);

  const closeNotification = useCallback(() => setNotification(null), []);

  const requireLogin = useCallback(() => {
    setNotification({
      type: "warning",
      message: "Bạn cần đăng nhập để tiếp tục.",
      actionLabel: "Đăng nhập",
      onAction: openLogin,
    });
  }, [openLogin]);

  const toggleSave = useCallback(() => {
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
  }, [isAuthenticated, requireLogin]);

  const handleAddToCart = async () => {
    setNotification(null);

    if (isPostingRef.current) return;
    isPostingRef.current = true;

    if (authLoading) {
      isPostingRef.current = false;
      return;
    }

    if (!isAuthenticated) {
      requireLogin();
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

      await cartService.addToCart({
        productId: product.id,
        variantId: selectedVariant.id,
        quantity: 1,
      });

      await refreshMe();
      window.dispatchEvent(new Event("cart:updated"));

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

  const selectOption = useCallback((attrKey, optionId) => {
    setSelected((prev) => ({ ...prev, [attrKey]: optionId }));
  }, []);

  const loading = !productIdFromQuery ? false : fetchLoading;
  const error = !productIdFromQuery ? "Missing product id." : fetchError;

  return {
    productId: productIdFromQuery,
    product,
    loading,
    error,
    relatedProducts,
    relatedError,
    selected,
    selectOption,
    variantOptions,
    selectedVariant,
    mainImage,
    displayPrice,
    inCart,
    isPosting,
    saved,
    notification,
    closeNotification,
    requireLogin,
    toggleSave,
    handleAddToCart,
    isAuthenticated,
  };
}
