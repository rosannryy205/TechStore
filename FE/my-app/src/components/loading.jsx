import React from "react";

import "./Loading.css";

/**
 * Global Loading Component (Reusable Across the Entire Project)
 *
 * Props:
 * - variant: 'fullscreen' | 'overlay' | 'inline'
 * - size: 'small' | 'medium' | 'large'
 * - text: optional label
 * - className: optional classes
 * - shouldShow: when false, loading won't appear immediately (prevents flicker)
 * - minDurationMs: ensure loading is visible at least this long
 * - maxDurationMs: safety cap — auto-hides even if shouldShow stays true
 *   (phòng trường hợp quên set shouldShow=false)
 *
 * Note:
 * - Fade in/out dùng chính transition opacity đã khai báo trong Loading.css
 *   (0.25s cho fullscreen, 0.2s cho overlay). inline không có transition nên
 *   sẽ show/hide tức thì như trước.
 * - unmount thật sự chỉ diễn ra SAU khi fade-out kết thúc (bắt bằng
 *   onTransitionEnd, có fallback timer phòng khi transitionend không bắn,
 *   ví dụ variant inline hoặc prefers-reduced-motion).
 */
export default function Loading({
  variant = "overlay",
  size = "medium",
  text = "",
  className = "",
  shouldShow = true,
  minDurationMs = 500,
  maxDurationMs = 1500,
  ...props
}) {
  const validVariants = ["fullscreen", "overlay", "inline"];
  const selectedVariant = validVariants.includes(variant) ? variant : "overlay";

  const validSizes = ["small", "medium", "large"];
  const selectedSize = validSizes.includes(size) ? size : "medium";

  // inline không có transition trong CSS -> không cần chờ fade
  const hasFade = selectedVariant !== "inline";
  const FALLBACK_FADE_MS = 300; // phòng trường hợp transitionend không bắn

  const startAtRef = React.useRef(null);
  const [mounted, setMounted] = React.useState(Boolean(shouldShow));
  const [entered, setEntered] = React.useState(Boolean(shouldShow)); // true = opacity 1

  const hideTimerRef = React.useRef(null); // đợi min/maxDuration rồi mới bắt đầu fade-out
  const fallbackUnmountRef = React.useRef(null); // an toàn nếu onTransitionEnd không chạy
  const rafRef = React.useRef(null);

  const clearAllTimers = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (fallbackUnmountRef.current) clearTimeout(fallbackUnmountRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const beginFadeOut = () => {
    setEntered(false);

    if (!hasFade) {
      setMounted(false);
      return;
    }

    // Fallback: nếu vì lý do gì đó onTransitionEnd không bắn, vẫn unmount đúng lúc
    if (fallbackUnmountRef.current) clearTimeout(fallbackUnmountRef.current);
    fallbackUnmountRef.current = setTimeout(() => {
      setMounted(false);
    }, FALLBACK_FADE_MS);
  };

  const handleTransitionEnd = (e) => {
    if (e.target !== e.currentTarget || e.propertyName !== "opacity") return;
    if (!entered) {
      if (fallbackUnmountRef.current) clearTimeout(fallbackUnmountRef.current);
      setMounted(false);
    }
  };

  React.useEffect(() => {
    const now = Date.now();

    if (shouldShow) {
      startAtRef.current = now;
      clearAllTimers();
      // Đảm bảo browser paint xong trạng thái opacity:0 trước khi bật opacity:1,
      // nếu không transition sẽ bị bỏ qua (nhảy thẳng lên 1).
      rafRef.current = requestAnimationFrame(() => {
        setMounted(true);
        setEntered(false);
        rafRef.current = requestAnimationFrame(() => setEntered(true));
      });

      // Safety cap
      hideTimerRef.current = setTimeout(beginFadeOut, maxDurationMs);

      return clearAllTimers;
    }

    // Turning OFF: giữ hiện tối thiểu minDurationMs kể từ lần bật gần nhất
    if (!mounted) return;

    const startedAt = startAtRef.current ?? now;
    const elapsed = now - startedAt;
    const remainingMin = Math.max(0, minDurationMs - elapsed);
    const remainingMax = Math.max(0, maxDurationMs - elapsed);
    const delay = Math.min(remainingMin, remainingMax);

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(beginFadeOut, delay);

    return clearAllTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShow, minDurationMs, maxDurationMs]);

  React.useEffect(() => clearAllTimers, []);

  const containerClasses = [
    `loading-wrapper-${selectedVariant}`,
    hasFade ? (entered ? "loading-visible" : "loading-hidden") : "",
    className,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  const spinnerClasses = [
    "loading-spinner",
    `loading-spinner-${selectedSize}`,
  ].join(" ");

  const textClasses = [
    "loading-text",
    selectedVariant === "inline" ? "loading-text-inline" : "",
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (!mounted) return null;

  return (
    <div
      className={containerClasses}
      role="status"
      aria-live="polite"
      aria-busy="true"
      onTransitionEnd={hasFade ? handleTransitionEnd : undefined}
      {...props}
    >
      <div className={spinnerClasses} aria-hidden="true" />
      {text ? <span className={textClasses}>{text}</span> : null}
    </div>
  );
}