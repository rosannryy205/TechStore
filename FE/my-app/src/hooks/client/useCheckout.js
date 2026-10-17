import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { orderService } from "@/services/api/client/orderService";

export function useCheckout() {
  const navigate = useNavigate();
  const location = useLocation();

  const { cartItems, cartTotal } = location.state || {};
  const isInvalidCart = !cartItems || !cartTotal;

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
    if (isInvalidCart) {
      navigate("/cart", { replace: true });
    }
  }, [isInvalidCart, navigate]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

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

      const payload = await orderService.createOrder(orderData);

      window.dispatchEvent(new Event("cart:updated"));

      navigate("/order-success", {
        state: { order: payload.data },
        replace: true,
      });
    } catch (err) {
      setError(err?.message || "Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
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
