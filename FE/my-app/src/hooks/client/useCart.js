import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/authContext";
import { cartService } from "@/services/api/client/cartService";
import defaultProductImage from "@/assets/product.jpg";

const EMPTY_CART_ITEMS = [];

export function useCart() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loadingCart, setLoadingCart] = useState(false);
  const [error, setError] = useState(null);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [hasMounted, setHasMounted] = useState(false);
  const cartSession = useRef(null);

  const cartItems = userId && cart?.userId === userId ? cart.items : EMPTY_CART_ITEMS;
  const updatingItemId = updatingItem && updatingItem.userId === userId ? updatingItem.id : null;

  const updateCartItems = useCallback((updateItems) => {
    setCart((previousCart) => {
      const previousItems = previousCart && previousCart.userId === userId
        ? previousCart.items
        : EMPTY_CART_ITEMS;
      return { userId, items: updateItems(previousItems) };
    });
  }, [userId]);

  useEffect(() => {
    const controller = new AbortController();
    cartSession.current = userId ? controller : null;
    return () => controller.abort();
  }, [userId]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const p = Number(item.price);
      const q = Number(item.quantity);
      if (!Number.isFinite(p) || !Number.isFinite(q)) return acc;
      return acc + p * q;
    }, 0);
  }, [cartItems]);

  const hasUnavailableItems = useMemo(() => {
    return cartItems.some(
      (item) => item.isAvailable === false || item.stock === 0 || item.quantity > item.stock
    );
  }, [cartItems]);

  const fetchCart = useCallback(async (signal) => {
    if (authLoading) return;
    if (!userId) {
      setCart(null);
      setLoadingCart(false);
      setUpdatingItem(null);
      setError(null);
      return;
    }

    try {
      setLoadingCart(true);
      setError(null);

      const items = await cartService.getCart({ signal });
      if (signal.aborted) return;

      const mapped = items.map((it) => {
        const variant = it.variant ?? {};
        const product = it.product ?? {};

        const sale = Number(variant.sale_price);
        const price = Number(variant.price);
        let effectivePrice = Number.isFinite(sale) && sale > 0 ? sale : price;
        if (!Number.isFinite(effectivePrice) || effectivePrice < 0) {
          effectivePrice = 0;
        }

        const stock = typeof variant.stock === "number" ? variant.stock : 0;
        const isAvailable =
          it.isAvailable !== undefined
            ? it.isAvailable
            : Boolean(variant.id && stock > 0);

        return {
          id: it.variant_id,
          productId: variant.product_id,
          name: product.name ?? "Sản phẩm",
          tagline: variant.attributeValues
            ? variant.attributeValues.map((av) => av.value).join(" ")
            : [variant.color, variant.ram, variant.storage]
                .filter(Boolean)
                .join(" • "),
          price: effectivePrice,
          quantity: Number(it.quantity ?? 1),
          stock,
          isAvailable,
          image:
            variant.img_url ||
            variant.image_url ||
            product.images?.[0]?.img_url ||
            product.images?.[0]?.image_url ||
            defaultProductImage,
        };
      });

      setCart({ userId, items: mapped });
    } catch (e) {
      if (signal.aborted) return;
      setError(e?.message || "Failed to load cart.");
      setCart(null);
    } finally {
      if (!signal.aborted) {
        setLoadingCart(false);
        setHasMounted(true);
      }
    }
  }, [authLoading, userId]);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) fetchCart(controller.signal);
    });
    return () => controller.abort();
  }, [fetchCart]);

  const handleChangeQuantity = useCallback(
    async (item, delta) => {
      const signal = cartSession.current?.signal;
      if (!signal || signal.aborted) return;

      const nextQty = item.quantity + delta;
      if (nextQty < 1) return;

      if (delta > 0 && typeof item.stock === "number" && nextQty > item.stock) {
        setError(`Số lượng yêu cầu vượt quá tồn kho hiện có (${item.stock}).`);
        return;
      }

      updateCartItems((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, quantity: nextQty } : p))
      );
      setUpdatingItem({ userId, id: item.id });
      setError(null);

      try {
        await cartService.updateQuantity(item.id, nextQty, { signal });
        if (!signal.aborted) window.dispatchEvent(new Event("cart:updated"));
      } catch (e) {
        if (signal.aborted) return;
        updateCartItems((prev) =>
          prev.map((p) =>
            p.id === item.id ? { ...p, quantity: item.quantity } : p
          )
        );
        setError(e?.message || "Failed to update quantity.");
      } finally {
        if (!signal.aborted) setUpdatingItem(null);
      }
    },
    [updateCartItems, userId]
  );

  const handleRemoveItem = useCallback(async (item) => {
    const signal = cartSession.current?.signal;
    if (!signal || signal.aborted) return;

    updateCartItems((prev) => prev.filter((p) => p.id !== item.id));
    setUpdatingItem({ userId, id: item.id });
    setError(null);

    try {
      await cartService.removeFromCart(item.id, { signal });
      if (!signal.aborted) window.dispatchEvent(new Event("cart:updated"));
    } catch (e) {
      if (signal.aborted) return;
      updateCartItems((prev) => [...prev, item]);
      setError(e?.message || "Failed to remove item.");
    } finally {
      if (!signal.aborted) setUpdatingItem(null);
    }
  }, [updateCartItems, userId]);

  const handleCheckout = useCallback(() => {
    if (cartItems.length === 0 || hasUnavailableItems) return;
    navigate("/checkout", {
      state: {
        userId,
        cartItems,
        cartTotal,
      },
    });
  }, [userId, cartItems, cartTotal, hasUnavailableItems, navigate]);

  return {
    cartItems,
    cartTotal,
    hasUnavailableItems,
    loadingCart,
    authLoading,
    error,
    updatingItemId,
    hasMounted,
    handleChangeQuantity,
    handleRemoveItem,
    handleCheckout,
  };
}
