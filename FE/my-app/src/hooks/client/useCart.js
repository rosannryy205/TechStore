import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/authContext";
import { cartService } from "@/services/api/client/cartService";
import defaultProductImage from "@/assets/product.jpg";

export function useCart() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(false);
  const [error, setError] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [hasMounted, setHasMounted] = useState(false);

  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + Number(item.price) * Number(item.quantity),
      0
    );
  }, [cartItems]);

  const fetchCart = useCallback(async () => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setCartItems([]);
      return;
    }

    try {
      setLoadingCart(true);
      setError(null);

      const items = await cartService.getCart();

      const mapped = items.map((it) => {
        const variant = it.variant ?? {};
        const product = it.product ?? {};

        const sale = Number(variant.sale_price);
        const price = Number(variant.price);
        const effectivePrice = Number.isFinite(sale) && sale > 0 ? sale : price;

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
          image:
            variant.img_url ||
            variant.image_url ||
            product.images?.[0]?.img_url ||
            product.images?.[0]?.image_url ||
            defaultProductImage,
        };
      });

      setCartItems(mapped);
    } catch (e) {
      setError(e?.message || "Failed to load cart.");
      setCartItems([]);
    } finally {
      setLoadingCart(false);
      setHasMounted(true);
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    const run = async () => {
      await fetchCart();
    };
    run();
  }, [fetchCart]);

  const handleChangeQuantity = useCallback(
    async (item, delta) => {
      const nextQty = item.quantity + delta;
      if (nextQty < 1) return;

      setCartItems((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, quantity: nextQty } : p))
      );
      setUpdatingItemId(item.id);
      setError(null);

      try {
        await cartService.updateQuantity(item.id, nextQty);
        window.dispatchEvent(new Event("cart:updated"));
      } catch (e) {
        setCartItems((prev) =>
          prev.map((p) =>
            p.id === item.id ? { ...p, quantity: item.quantity } : p
          )
        );
        setError(e?.message || "Failed to update quantity.");
      } finally {
        setUpdatingItemId(null);
      }
    },
    []
  );

  const handleRemoveItem = useCallback(async (item) => {
    setCartItems((prev) => prev.filter((p) => p.id !== item.id));
    setUpdatingItemId(item.id);
    setError(null);

    try {
      await cartService.removeFromCart(item.id);
      window.dispatchEvent(new Event("cart:updated"));
    } catch (e) {
      setCartItems((prev) => [...prev, item]);
      setError(e?.message || "Failed to remove item.");
    } finally {
      setUpdatingItemId(null);
    }
  }, []);

  const handleCheckout = useCallback(() => {
    if (cartItems.length === 0) return;
    navigate("/checkout", {
      state: {
        cartItems,
        cartTotal,
      },
    });
  }, [cartItems, cartTotal, navigate]);

  return {
    cartItems,
    cartTotal,
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
