import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/authContext";
import { orderService } from "@/services/api/client/orderService";

export function useCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const { cartItems, cartTotal } = location.state || {};
  const isInvalidCart = !cartItems || !cartTotal || !isAuthenticated;

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
  const checkoutSession = useRef(null);

  useEffect(() => {
    if (isInvalidCart && !authLoading) {
      navigate("/cart", { replace: true });
    }
  }, [authLoading, isInvalidCart, navigate]);

  useEffect(() => {
    const controller = new AbortController();
    checkoutSession.current = controller;
    return () => controller.abort();
  }, [isAuthenticated, user?.id]);

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
    cartItems: cartItems || [],
    cartTotal: cartTotal || 0,
    isInvalidCart,
    formData,
    updateField,
    isSubmitting,
    error,
    handleSubmit,
  };
}
