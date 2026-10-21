import { useState } from "react";
import { useAuthModal } from "../contexts/authModalContext";
import { useAuth } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";
import InlineAlert from "../components/inlineAlert";

const SF_DISPLAY = "SF Pro Display, system-ui, -apple-system, sans-serif";
const SF_TEXT = "SF Pro Text, system-ui, -apple-system, sans-serif";

import { API_BASE_URL } from "@/constants/api";

/**
 * Login form — rendered inside AuthModal.
 */
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { openRegister, openForgetPassword, closeModal } = useAuthModal();
  const { refreshMe } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setAlert(null);
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // gửi cookie httpOnly
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.message || "Login failed");
      }

      // 1) đóng modal login
      closeModal();

      // 2) refresh user từ /me để cập nhật Header + user_profile
      await refreshMe();

      // 3) điều hướng theo role: admin/staff sang dashboard, customer về Home
      const role = payload?.data?.user?.role;
      if (role === "admin" || role === "staff") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setAlert({
        variant: "error",
        title: "Login failed",
        message: err?.message || "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Header */}
      <h1
        className="text-[28px] sm:text-[34px] font-semibold leading-[1.07] tracking-[-0.374px] text-[#1d1d1f] text-center"
        style={{ fontFamily: SF_DISPLAY }}
      >
        Login
      </h1>
      <p
        className="mt-2 text-[14px] sm:text-[17px] leading-[1.47] tracking-[-0.374px] text-[#333333] text-center"
        style={{ fontFamily: SF_TEXT, fontWeight: 400 }}
      >
        Đăng nhập để khám phá bộ sưu tập và ưu đãi dành riêng cho bạn.
      </p>

      {/* Alert */}
      {alert ? (
        <div className="mt-6">
          <InlineAlert
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
            onDismiss={() => setAlert(null)}
          />
        </div>
      ) : null}

      {/* Form */}
      <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit}>
        {/* Email */}
        <div className="flex flex-col text-left">
          <label
            htmlFor="login-email"
            className="text-[12px] font-semibold tracking-[0.5px] uppercase text-[#1d1d1f] mb-2 pl-1"
            style={{ fontFamily: SF_TEXT }}
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 px-4 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#1d1d1f] bg-[#f5f5f7] rounded-lg border border-[#e0e0e0] outline-none transition-all duration-200 placeholder:text-[#7a7a7a] focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 focus:bg-white"
            style={{ fontFamily: SF_TEXT }}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col text-left">
          <label
            htmlFor="login-password"
            className="text-[12px] font-semibold tracking-[0.5px] uppercase text-[#1d1d1f] mb-2 pl-1"
            style={{ fontFamily: SF_TEXT }}
          >
            Password
          </label>
          <input
            id="login-password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11 px-4 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#1d1d1f] bg-[#f5f5f7] rounded-lg border border-[#e0e0e0] outline-none transition-all duration-200 placeholder:text-[#7a7a7a] focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 focus:bg-white"
            style={{ fontFamily: SF_TEXT }}
          />
        </div>

        {/* Forget password link */}
        <div className="text-right -mt-2">
          <button
            type="button"
            onClick={openForgetPassword}
            className="text-[14px] tracking-[-0.224px] text-[#0066cc] hover:text-[#0071e3] transition-colors bg-transparent border-none cursor-pointer p-0"
            style={{ fontFamily: SF_TEXT, fontWeight: 400 }}
          >
            Forget Password?
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full h-11 rounded-full bg-[#0066cc] text-white text-[17px] font-normal tracking-[-0.374px] leading-[1.47] border-none cursor-pointer hover:bg-[#0071e3] active:scale-[0.95] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ fontFamily: SF_TEXT }}
        >
          {submitting ? "Logging in…" : "Login"}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 mt-8">
        <div className="flex-1 h-px bg-[#e0e0e0]" />
        <span
          className="text-[12px] text-[#7a7a7a] tracking-[-0.12px]"
          style={{ fontFamily: SF_TEXT }}
        >
          or
        </span>
        <div className="flex-1 h-px bg-[#e0e0e0]" />
      </div>

      {/* Register link */}
      <div className="mt-6 text-center">
        <span
          className="text-[14px] tracking-[-0.224px] text-[#333333]"
          style={{ fontFamily: SF_TEXT }}
        >
          Don't have an account?{" "}
        </span>
        <button
          type="button"
          onClick={openRegister}
          className="text-[14px] tracking-[-0.224px] font-medium text-[#0066cc] hover:text-[#0071e3] transition-colors bg-transparent border-none cursor-pointer p-0"
          style={{ fontFamily: SF_TEXT }}
        >
          Register now
        </button>
      </div>
    </>
  );
}
