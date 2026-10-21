import { useEffect, useState, useRef } from "react";
import { useAuthModal } from "../contexts/authModalContext";
import InlineAlert from "../components/inlineAlert";
import PasswordStrengthHints from "./passwordStrengthHints";

const SF_DISPLAY = "SF Pro Display, system-ui, -apple-system, sans-serif";
const SF_TEXT = "SF Pro Text, system-ui, -apple-system, sans-serif";

import { API_BASE_URL } from "@/constants/api";
const REGISTER_ENDPOINT = `${API_BASE_URL}/api/register`;

/**
 * Register form — rendered inside AuthModal.
 * Fields: Email, Password, Confirm Password, Verification Code.
 */
export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verifyCode, setVerifyCode] = useState("");

  const [sendCodeLoading, setSendCodeLoading] = useState(false);
  const [sendCodeCooldownSec, setSendCodeCooldownSec] = useState(0);
  const [alert, setAlert] = useState(null);

  const [showPasswordRules, setShowPasswordRules] = useState(false);

  const { openLogin } = useAuthModal();

  // Reference to the outer container for parent layout adjustment
  const containerRef = useRef(null);

  // Reference for the alert auto-dismiss timeout
  const alertTimeoutRef = useRef(null);

  // ===== Shared API functions (keep all API calls in one place) =====
  const api = {
    async sendCode({ emailToSend }) {
      const res = await fetch(`${REGISTER_ENDPOINT}/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToSend }),
        credentials: "include",
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.message || "Send code failed");
      }

      return payload;
    },

    async register({ email: regEmail, password: regPassword, code }) {
      const res = await fetch(REGISTER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regEmail, password: regPassword, code }),
        credentials: "include",
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.message || "Register failed");
      }

      return payload;
    },
  };

  const alertVariantFromError = (err) => {
    const msg = err?.message || "Error";
    if (/code|verify/i.test(msg)) return "error";
    if (/already|exists|tồn tại|used/i.test(msg)) return "error";
    if (/success|thành công/i.test(msg)) return "success";
    return "error";
  };

  // Set alert state with auto-dismiss after 6 seconds
  const setInlineAlert = (next) => {
    setAlert(next);
    if (!next) return;
    if (alertTimeoutRef.current) {
      window.clearTimeout(alertTimeoutRef.current);
    }
    alertTimeoutRef.current = window.setTimeout(() => setAlert(null), 6000);
  };

  // Clean up alert timeout on unmount
  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) {
        window.clearTimeout(alertTimeoutRef.current);
      }
    };
  }, []);

  // Dynamically adapt parent layouts so that header & footer are fixed, and only the middle content scrolls
  useEffect(() => {
    const paddingEl = containerRef.current?.parentElement;
    const cardEl = paddingEl?.parentElement;

    if (paddingEl && cardEl) {
      // 1. Convert the modal's inner padding div into a flexbox container with constrained height
      const origPaddingDisplay = paddingEl.style.display;
      const origPaddingFlexDir = paddingEl.style.flexDirection;
      const origPaddingHeight = paddingEl.style.height;
      const origPaddingMinHeight = paddingEl.style.minHeight;

      paddingEl.style.display = "flex";
      paddingEl.style.flexDirection = "column";
      paddingEl.style.height = "100%";
      paddingEl.style.minHeight = "0";

      // 2. Convert the card container into a flex container and hide its overflow so Register can handle its own internal scrolling
      const cardHadOverflowYAuto = cardEl.classList.contains("overflow-y-auto");
      if (cardHadOverflowYAuto) {
        cardEl.classList.remove("overflow-y-auto");
      }
      cardEl.classList.add("overflow-hidden", "flex", "flex-col");

      return () => {
        // Restore original parent style properties on unmount
        paddingEl.style.display = origPaddingDisplay;
        paddingEl.style.flexDirection = origPaddingFlexDir;
        paddingEl.style.height = origPaddingHeight;
        paddingEl.style.minHeight = origPaddingMinHeight;

        cardEl.classList.remove("overflow-hidden", "flex", "flex-col");
        if (cardHadOverflowYAuto) {
          cardEl.classList.add("overflow-y-auto");
        }
      };
    }
  }, []);

  // cooldown tick for resend-code button
  useEffect(() => {
    if (sendCodeCooldownSec <= 0) return;

    const id = window.setInterval(() => {
      setSendCodeCooldownSec((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => window.clearInterval(id);
  }, [sendCodeCooldownSec]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // basic client-side check
      if (password !== confirmPassword) {
        setInlineAlert({
          variant: "error",
          title: "Password mismatch",
          message: "Confirm password does not match.",
        });
        return;
      }

      await api.register({ email, password, code: verifyCode });

      setInlineAlert({
        variant: "success",
        title: "Success",
        message: "Register success.",
      });
      if (openLogin) openLogin();
    } catch (err) {
      setInlineAlert({
        variant: alertVariantFromError(err),
        title: "Register failed",
        message: err?.message || "Please try again.",
      });
    }
  };

  // Shared input className
  const inputClass =
    "h-[44px] px-4 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#1d1d1f] bg-[#f5f5f7] rounded-[8px] border border-[#e0e0e0] outline-none transition-all duration-200 placeholder:text-[#7a7a7a] focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 focus:bg-white";

  return (
    // Outer wrapper keeps header + divider pinned.
    // Only the main content area scrolls.
    <div ref={containerRef} className="flex flex-col h-full min-h-0">
      {/* Custom styled scrollbar for a cleaner, subtle appearance */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.12);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.24);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.12) transparent;
        }
      `}</style>

      {/* Header (fixed while scrolling) */}
      <div className="shrink-0">
        <h1
          className="text-[28px] sm:text-[34px] font-semibold leading-[1.07] tracking-[-0.374px] text-[#1d1d1f] text-center"
          style={{ fontFamily: SF_DISPLAY }}
        >
          Register
        </h1>
        <p
          className="mt-2 text-[14px] sm:text-[17px] leading-[1.47] tracking-[-0.374px] text-[#333333] text-center"
          style={{ fontFamily: SF_TEXT, fontWeight: 400 }}
        >
          Tham gia để khám phá sản phẩm cao cấp và ưu đãi độc quyền.
        </p>

        {/* Inline alert */}
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
      </div>

      {/* Main scrollable content (form only) with custom subtle scrollbar, active only when password rules slide down */}
      <div
        className={[
          "flex-1 overscroll-contain custom-scrollbar",
          showPasswordRules ? "overflow-y-auto" : "overflow-y-hidden",
        ].join(" ")}
      >
        {/* Form */}
        <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="flex flex-col text-left">
            <label
              htmlFor="register-email"
              className="text-[12px] font-semibold tracking-[0.5px] uppercase text-[#1d1d1f] mb-2 pl-1"
              style={{ fontFamily: SF_TEXT }}
            >
              Email
            </label>
            <input
              id="register-email"
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
              style={{ fontFamily: SF_TEXT }}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col text-left">
            <label
              htmlFor="register-password"
              className="text-[12px] font-semibold tracking-[0.5px] uppercase text-[#1d1d1f] mb-2 pl-1"
              style={{ fontFamily: SF_TEXT }}
            >
              Password
            </label>
            <input
              id="register-password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setShowPasswordRules(true)}
              onClick={() => setShowPasswordRules(true)}
              required
              className={inputClass}
              style={{ fontFamily: SF_TEXT }}
            />

            {/*
              Password rules: keep DOM in place but animate it down
              only after user clicks/focuses the password input.
            */}
            <div
              className={[
                "mt-3",
                "transition-all duration-250 ease-out",
                showPasswordRules
                  ? "opacity-100 translate-y-0 max-h-60"
                  : "opacity-0 -translate-y-1.5 max-h-0 overflow-hidden",
              ].join(" ")}
            >
              <PasswordStrengthHints password={password} />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col text-left">
            <label
              htmlFor="register-confirm-password"
              className="text-[12px] font-semibold tracking-[0.5px] uppercase text-[#1d1d1f] mb-2 pl-1"
              style={{ fontFamily: SF_TEXT }}
            >
              Confirm Password
            </label>
            <input
              id="register-confirm-password"
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={inputClass}
              style={{ fontFamily: SF_TEXT }}
            />
          </div>

          {/* Verification Code */}
          <div className="flex flex-col text-left">
            <label
              htmlFor="register-verify-code"
              className="text-[12px] font-semibold tracking-[0.5px] uppercase text-[#1d1d1f] mb-2 pl-1"
              style={{ fontFamily: SF_TEXT }}
            >
              Verification Code
            </label>
            <div className="flex gap-3">
              <input
                id="register-verify-code"
                type="text"
                placeholder="Enter verification code"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                required
                className={`${inputClass} flex-1`}
                style={{ fontFamily: SF_TEXT }}
              />
              <button
                type="button"
                onClick={async () => {
                  if (sendCodeLoading) return;
                  if (sendCodeCooldownSec > 0) return;

                  const trimmedEmail = (email || "").trim();
                  if (!trimmedEmail) {
                    setInlineAlert({
                      variant: "error",
                      title: "Missing email",
                      message: "Please enter your email first.",
                    });
                    return;
                  }

                  try {
                    setSendCodeLoading(true);
                    setSendCodeCooldownSec(30);

                    const payload = await api.sendCode({
                      emailToSend: trimmedEmail,
                    });
                    setInlineAlert({
                      variant: "success",
                      title: "Sent",
                      message:
                        payload?.message ||
                        "Verification code sent. Check your email.",
                    });
                  } catch (err) {
                    console.error("Send code error:", err);
                    setInlineAlert({
                      variant: "error",
                      title: "Send code failed",
                      message: err?.message || "Please try again.",
                    });
                    // allow retry immediately on failure
                    setSendCodeCooldownSec(0);
                  } finally {
                    setSendCodeLoading(false);
                  }
                }}
                disabled={sendCodeLoading || sendCodeCooldownSec > 0}
                className={[
                  "shrink-0 h-11 px-4 rounded-lg text-[14px] font-normal tracking-[-0.224px] border-none transition-all duration-200",
                  "cursor-pointer active:scale-[0.95]",
                  sendCodeLoading || sendCodeCooldownSec > 0
                    ? "bg-[#1d1d1f]/70 text-white/90 cursor-not-allowed"
                    : "bg-[#1d1d1f] text-white hover:bg-[#333333]",
                ].join(" ")}
                style={{ fontFamily: SF_TEXT }}
              >
                {sendCodeLoading
                  ? "Sending…"
                  : sendCodeCooldownSec > 0
                    ? `Resend in ${sendCodeCooldownSec}s`
                    : "Send Code"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mt-2 w-full h-11 rounded-full bg-[#0066cc] text-white text-[17px] font-normal tracking-[-0.374px] leading-[1.47] border-none cursor-pointer hover:bg-[#0071e3] active:scale-[0.95] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
            style={{ fontFamily: SF_TEXT }}
          >
            Register
          </button>
        </form>
      </div>

      {/* Divider + Login link (fixed while scrolling) */}
      <div className="shrink-0">
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

        <div className="mt-6 text-center">
          <span
            className="text-[14px] tracking-[-0.224px] text-[#333333]"
            style={{ fontFamily: SF_TEXT }}
          >
            Have an account ?{" "}
          </span>
          <button
            type="button"
            onClick={openLogin}
            className="text-[14px] tracking-[-0.224px] font-medium text-[#0066cc] hover:text-[#0071e3] transition-colors bg-transparent border-none cursor-pointer p-0"
            style={{ fontFamily: SF_TEXT }}
          >
            Login now
          </button>
        </div>
      </div>
    </div>
  );
}
