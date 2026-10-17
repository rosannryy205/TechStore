import { useState, useEffect } from "react";

export function useContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "",
    message: "",
  });
  const [alert, setAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    document.title = "Contact Support - PJ26";

    const updateHeight = () => {
      const header = document.getElementById("global-header");
      if (header) {
        setHeaderHeight(header.offsetHeight);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    const timer = setTimeout(updateHeight, 300);

    return () => {
      window.removeEventListener("resize", updateHeight);
      clearTimeout(timer);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAlert(null);

    if (!formData.name.trim()) {
      setAlert({
        variant: "error",
        title: "Validation Error",
        message: "Please enter your name.",
      });
      return;
    }

    if (!formData.email.trim()) {
      setAlert({
        variant: "error",
        title: "Validation Error",
        message: "Please enter your email.",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setAlert({
        variant: "error",
        title: "Validation Error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    if (!formData.topic) {
      setAlert({
        variant: "error",
        title: "Validation Error",
        message: "Please select a topic.",
      });
      return;
    }

    if (!formData.message.trim()) {
      setAlert({
        variant: "error",
        title: "Validation Error",
        message: "Please enter your message.",
      });
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setAlert({
        variant: "success",
        title: "Message Sent",
        message: `Thank you, ${formData.name}! We've received your request about "${formData.topic}" and will reply to ${formData.email} shortly.`,
      });
      setFormData({
        name: "",
        email: "",
        topic: "",
        message: "",
      });
    }, 1200);
  };

  return {
    formData,
    alert,
    setAlert,
    submitting,
    headerHeight,
    handleChange,
    handleSubmit,
  };
}
