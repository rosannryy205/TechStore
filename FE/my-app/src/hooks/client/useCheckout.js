import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/authContext";
import { orderService } from "@/services/api/client/orderService";

export function useCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: isAuthLoading } = useAuth();

  const { cartItems, cartTotal, userId } = location.state || {};
  const currentUserId = user?.id;
  const isInvalidCart = !currentUserId || userId !== currentUserId || !cartItems || !cartTotal;
  const checkoutSession = useRef(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
    paymentMethod: "cod",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthLoading && isInvalidCart) {
      navigate("/cart", { replace: true });
    }
  }, [isAuthLoading, isInvalidCart, navigate]);

  useEffect(() => {
    if (isInvalidCart) return;
    const controller = new AbortController();
    checkoutSession.current = controller;
    return () => controller.abort();
  }, [currentUserId, isInvalidCart]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const signal = checkoutSession.current?.signal;
    if (isInvalidCart || isSubmitting || !signal || signal.aborted) return;

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("Please enter your first and last name");
      return;
    }
    if (!formData.phone.trim()) {
      setError("Please enter your phone number");
      return;
    }
    if (!formData.street.trim()) {
      setError("Please enter your street address");
      return;
    }
    if (!formData.city.trim()) {
      setError("Please enter your city");
      return;
    }

    setError(null);

    try {
      setIsSubmitting(true);

      const orderData = {
        receiver_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        receiver_phone: formData.phone.trim(),
        receiver_email: formData.email.trim() || undefined,
        address: `${formData.street.trim()}, ${formData.city.trim()}${
          formData.postalCode.trim() ? `, ${formData.postalCode.trim()}` : ""
        }`,
        payment_method: formData.paymentMethod,
      };

      const payload = await orderService.createOrder(orderData, { signal });
      if (signal.aborted) return;

      window.dispatchEvent(new Event("cart:updated"));

      navigate("/order-success", {
        state: { order: payload.data },
        replace: true,
      });
    } catch (err) {
      if (!signal.aborted) setError(err?.message || "Failed to place order. Please try again.");
    } finally {
      if (!signal.aborted) setIsSubmitting(false);
    }
  };

  return {
    cartItems: isInvalidCart ? [] : cartItems,
    cartTotal: isInvalidCart ? 0 : cartTotal,
    isInvalidCart,
    formData,
    updateField,
    isSubmitting,
    error,
    handleSubmit,
  };
}
