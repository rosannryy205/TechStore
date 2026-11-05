import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthModal } from "../contexts/authModalContext";
import { useAuth } from "../contexts/authContext";
import { cartService } from "@/services/api/client/cartService";
import { categoryService } from "@/services/api/client/categoryService";
import { SF_DISPLAY, SF_TEXT, MONO_TEXT } from "@/constants/typography";

/* ─── SVG ICONS (Geometric & Restrained, 1.8px stroke) ─── */
function SearchIcon({ className = "" }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function BagIcon({ className = "" }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function UserIcon({ className = "" }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronDown({ className = "" }) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/* ─── SEARCH OVERLAY (White Canvas / Gallery-Airy Architectural Glass Modal) ─── */
function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    navigate(`/products?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div
      className={`fixed inset-0 z-60 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Soft Dimmed Backdrop */}
      <div
        className="absolute inset-0 bg-[#18181B]/40 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Pure Surface Modal Card - Rule 56: 2.5rem radius, whisper border, diffused shadow */}
      <div
        className={`relative z-10 max-w-[720px] mx-auto mt-24 px-4 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "translate-y-0 opacity-100 scale-100" : "-translate-y-6 opacity-0 scale-98"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.12)]">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-3.5 pb-4 border-b border-zinc-100"
          >
            <SearchIcon className="text-[#3B82F6] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm, phụ kiện hoặc công nghệ..."
              className="w-full bg-transparent text-[#18181B] text-[16px] placeholder:text-[#94A3B8] outline-none border-none font-normal"
              style={{ fontFamily: SF_TEXT }}
            />
            <button
              type="button"
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-[#71717A] hover:text-[#18181B] hover:bg-zinc-100 transition-colors cursor-pointer"
              aria-label="Đóng tìm kiếm"
            >
              <CloseIcon />
            </button>
          </form>

          {/* Quick Filter Tags */}
          <div className="mt-6 text-left">
            <p
              className="text-[#71717A] text-[12px] font-medium tracking-wide mb-3"
              style={{ fontFamily: SF_TEXT }}
            >
              Gợi ý tìm kiếm phổ biến
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "iPhone 16 Pro Max",
                "MacBook Pro M3 Max",
                "iPad Pro M4",
                "Apple Watch Ultra 2",
                "AirPods Max",
              ].map((term) => (
                <Link
                  key={term}
                  to={`/products?q=${encodeURIComponent(term)}`}
                  onClick={onClose}
                  className="inline-flex items-center px-4 py-2 rounded-full bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200/60 text-[13px] text-[#3F3F46] hover:text-[#18181B] transition-all no-underline"
                  style={{ fontFamily: SF_TEXT }}
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MOBILE ACCORDION ITEM ─── */
function MobileAccordion({ item, onNavigate }) {
  const [open, setOpen] = useState(false);

  if (!item.children || item.children.length === 0) {
    return (
      <Link
        to={item.href}
        onClick={onNavigate}
        className="flex items-center min-h-[44px] py-3 text-[15px] font-medium text-[#18181B] hover:text-[#3B82F6] transition-colors no-underline border-b border-zinc-100 text-left"
        style={{ fontFamily: SF_TEXT }}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="border-b border-zinc-100 text-left">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between min-h-[44px] py-3 text-[15px] font-medium text-[#18181B] hover:text-[#3B82F6] transition-colors cursor-pointer bg-transparent border-none outline-none"
        style={{ fontFamily: SF_TEXT }}
      >
        <span>{item.label}</span>
        <ChevronDown
          className={`transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            open ? "rotate-180 text-[#3B82F6]" : "text-[#71717A]"
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-96 opacity-100 pb-3" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pl-4 space-y-1 pt-1">
          {item.children.map((child) => (
            <Link
              key={child.href}
              to={child.href}
              onClick={onNavigate}
              className="flex items-center min-h-[44px] py-2 text-[14px] text-[#71717A] hover:text-[#18181B] transition-colors no-underline"
            >
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN FULL-SCREEN PURE WHITE ARCHITECTURAL HEADER ─── */
export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { openLogin } = useAuthModal();
  const { user, isAuthenticated, logout } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Số lượng sản phẩm trong giỏ hàng
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  const fetchCartCount = useCallback(async () => {
    if (!isAuthenticated) {
      setCartCount(0);
      return;
    }

    try {
      const items = await cartService.getCart();
      const total = items.reduce(
        (acc, it) => acc + Number(it.quantity ?? 0),
        0
      );
      setCartCount(total);
    } catch {
      setCartCount(0);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchCartCount();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchCartCount, location.pathname]);

  useEffect(() => {
    window.addEventListener("cart:updated", fetchCartCount);
    return () => window.removeEventListener("cart:updated", fetchCartCount);
  }, [fetchCartCount]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await categoryService.getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch {
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  /* 
   * Rule 98 Hardware Motion Rules:
   * Maintain stable height (CLS = 0), animate ONLY opacity/background via requestAnimationFrame.
   */
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════════
          FULL-SCREEN PURE WHITE ARCHITECTURAL HEADER
          - Pure Surface (#FFFFFF) / Canvas White (#F9FAFB)
          - Charcoal Ink (#18181B) typography with Steel Secondary (#71717A)
          - Generously refined human submenus (Warm cards, no robotic numbers)
          - Rule 84: Minimum 44px tap targets on all interactive triggers
          - Rule 98: Zero layout shift (stable 64px height)
      ════════════════════════════════════════════════════════════════════ */}
      <header
        id="global-header"
        className={[
          "sticky top-0 z-50 w-full left-0 right-0 h-16",
          "transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          scrolled
            ? "bg-white/95 backdrop-blur-xl border-b border-zinc-200/90 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]"
            : "bg-white/80 backdrop-blur-md border-b border-zinc-200/60 shadow-none",
        ].join(" ")}
        style={{ fontFamily: SF_TEXT }}
      >
        {/* Full-width Constrained Content Container */}
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 h-full flex items-center justify-between relative">
          
          {/* ── 1. Restrained Architectural Brand Monogram ── */}
          <Link
            to="/"
            className="flex items-center gap-3 text-[#18181B] no-underline shrink-0 group py-2"
            aria-label="Trang chủ TechStore"
          >
            <span className="relative inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] shadow-xs transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path
                  d="M13 3L4 14h7l-2 7 9-11h-7l2-7z"
                  fill="white"
                  stroke="white"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="absolute inset-0 rounded-xl border border-white/25 pointer-events-none" />
            </span>
            <div className="flex flex-col text-left">
              <span
                className="text-[15px] font-bold tracking-tight text-[#18181B] leading-none uppercase"
                style={{ fontFamily: SF_DISPLAY }}
              >
                TechStore
              </span>
              <span
                className="text-[10px] tracking-wider text-[#71717A] uppercase mt-0.5"
                style={{ fontFamily: SF_TEXT }}
              >
                Flagship Store
              </span>
            </div>
          </Link>

          {/* ── 2. Desktop Clean Horizontal Navigation & Warm Human Dropdowns ── */}
          <nav
            id="global-nav"
            className="hidden lg:flex items-center gap-2 h-full"
            aria-label="Điều hướng danh mục"
          >
            {loadingCategories ? (
              <span
                className="text-[12px] text-[#71717A] font-mono px-3 py-1"
                style={{ fontFamily: MONO_TEXT }}
              >
                Đang nạp danh mục...
              </span>
            ) : (
              categories.map((cate) => {
                const hasBrands =
                  Array.isArray(cate.category_brands) &&
                  cate.category_brands.length > 0;

                return (
                  <div
                    key={cate.id || cate.slug}
                    className="relative group h-full flex items-center"
                    aria-label={`Danh mục: ${cate.name}`}
                  >
                    {/* Level 1 Capsule Link */}
                    <Link
                      to={`/products?cate=${encodeURIComponent(cate.slug)}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium tracking-tight text-[#3F3F46] hover:text-[#18181B] hover:bg-zinc-100/80 active:scale-[0.98] transition-all duration-200 no-underline cursor-pointer group-hover:bg-zinc-100 group-hover:text-[#18181B]"
                    >
                      <span>{cate.name}</span>
                      {hasBrands && (
                        <ChevronDown className="w-2.5 h-2.5 text-[#71717A] group-hover:text-[#18181B] group-hover:rotate-180 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                      )}
                    </Link>

                    {/* Level 2: Warm & Refined Submenu (Dropdown) Panel */}
                    {hasBrands && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-50 pointer-events-auto">
                        <div className="bg-white/98 backdrop-blur-2xl rounded-3xl p-6 shadow-[0_20px_45px_-12px_rgba(0,0,0,0.08)] border border-zinc-200/80 min-w-[380px] max-w-[460px] text-left">
                          {/* Dropdown Header */}
                          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-zinc-100">
                            <span
                              className="text-[13px] font-semibold text-[#18181B]"
                              style={{ fontFamily: SF_TEXT }}
                            >
                              Dòng sản phẩm {cate.name}
                            </span>
                            <Link
                              to={`/products?cate=${encodeURIComponent(cate.slug)}`}
                              className="text-[12px] text-[#3B82F6] hover:underline font-medium"
                            >
                              Xem tất cả &rsaquo;
                            </Link>
                          </div>

                          {/* Brands Grid (Warm, Human, Non-Robotic) */}
                          <div className="grid grid-cols-2 gap-2">
                            {cate.category_brands.map((cb) => {
                              const brand = cb.brand;
                              return (
                                <Link
                                  key={brand?.slug || cb.id}
                                  to={`/products?brand=${encodeURIComponent(
                                    brand?.slug
                                  )}&cate=${encodeURIComponent(cate.slug)}`}
                                  className="group/b flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-zinc-50/70 hover:bg-zinc-100/90 border border-zinc-200/50 hover:border-zinc-300/80 text-[#27272A] hover:text-[#18181B] text-[13px] font-medium transition-all duration-200 no-underline active:scale-[0.98]"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-2 h-2 rounded-full bg-zinc-300 group-hover/b:bg-[#3B82F6] transition-colors" />
                                    <span>{brand?.name || "Chính hãng"}</span>
                                  </div>
                                  <span className="text-[12px] text-[#A1A1AA] group-hover/b:text-[#3B82F6] group-hover/b:translate-x-0.5 transition-all">
                                    &rarr;
                                  </span>
                                </Link>
                              );
                            })}
                          </div>

                          {/* Dropdown Footer (Contextual note) */}
                          <div className="mt-4 pt-3.5 border-t border-zinc-100 flex items-center justify-between text-[12px] text-[#71717A]">
                            <span className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                              Phân phối ủy quyền chính hãng
                            </span>
                            <Link
                              to="/products?sale=true"
                              className="text-[#3B82F6] hover:underline font-medium"
                            >
                              Ưu đãi độc quyền
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Quick Links Divider */}
            <div className="h-4 w-[1px] bg-zinc-200 mx-2" />
            <Link
              to="/products?sale=true"
              className="px-3.5 py-2 rounded-full text-[13px] font-medium text-[#3F3F46] hover:text-[#18181B] hover:bg-zinc-100/80 active:scale-[0.98] transition-all no-underline"
            >
              Ưu đãi
            </Link>
            <Link
              to="/contact"
              className="px-3.5 py-2 rounded-full text-[13px] font-medium text-[#71717A] hover:text-[#18181B] hover:bg-zinc-100/80 active:scale-[0.98] transition-all no-underline"
            >
              Hỗ trợ
            </Link>
          </nav>

          {/* ── 3. Action Tools with Rule 84 Compliant 44px Touch Targets ── */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Search Trigger */}
            <button
              id="search-toggle"
              onClick={() => setSearchOpen(true)}
              className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-[#27272A] hover:text-[#18181B] bg-zinc-100/80 hover:bg-zinc-200/80 border border-zinc-200/60 active:scale-[0.95] transition-all cursor-pointer"
              aria-label="Tìm kiếm sản phẩm"
            >
              <SearchIcon />
            </button>

            {/* Cart Bag with Discrete Badge */}
            <Link
              to="/cart"
              className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-[#27272A] hover:text-[#18181B] bg-zinc-100/80 hover:bg-zinc-200/80 border border-zinc-200/60 active:scale-[0.95] transition-all relative no-underline cursor-pointer"
              aria-label="Giỏ hàng"
            >
              <BagIcon />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#3B82F6] text-white text-[10px] font-bold flex items-center justify-center leading-none border-2 border-white shadow-2xs"
                  style={{ fontFamily: MONO_TEXT }}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* User Profile / Login (Minimum 44px Tap Target) */}
            {isAuthenticated ? (
              <Link
                to="/user_profile"
                className="hidden sm:inline-flex items-center gap-2 h-11 px-4 rounded-full bg-zinc-100/80 hover:bg-zinc-200/80 border border-zinc-200/60 text-[#18181B] text-[13px] font-medium active:scale-[0.98] transition-all no-underline"
                aria-label="Trang cá nhân"
              >
                <UserIcon className="w-4 h-4 text-[#3B82F6]" />
                <span className="font-semibold text-[#18181B]">
                  {user?.name ? user.name.split(" ")[0] : "Tài khoản"}
                </span>
              </Link>
            ) : (
              <button
                onClick={openLogin}
                className="hidden sm:inline-flex items-center gap-2 h-11 px-5 rounded-full bg-[#18181B] text-white hover:bg-zinc-800 text-[13px] font-semibold transition-all active:scale-[0.98] shadow-sm cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span>Đăng nhập</span>
              </button>
            )}

            {/* Mobile Menu Toggle (44px target) */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="min-w-[44px] min-h-[44px] rounded-full flex lg:hidden items-center justify-center text-[#27272A] hover:text-[#18181B] bg-zinc-100/80 hover:bg-zinc-200/80 border border-zinc-200/60 transition-all cursor-pointer"
              aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
            >
              {mobileOpen ? <CloseIcon /> : <HamburgerIcon />}
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════
          MOBILE ARCHITECTURAL WHITE DRAWER
      ═══════════════════════════════════════════ */}
      {/* Dimmed Backdrop */}
      <div
        className={`fixed inset-0 bg-[#18181B]/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 pointer-events-auto ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMobile}
      />

      {/* Drawer Panel */}
      <div
        id="mobile-drawer"
        className={`fixed top-0 right-0 h-full w-84 max-w-[85vw] bg-white/98 backdrop-blur-2xl z-50 lg:hidden transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto pointer-events-auto border-l border-zinc-200/80 flex flex-col shadow-2xl ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
          <span
            className="text-[#18181B] text-[13px] font-bold tracking-wide uppercase"
            style={{ fontFamily: SF_TEXT }}
          >
            Hệ Thống Thiết Bị
          </span>
          <button
            onClick={closeMobile}
            className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer"
            aria-label="Đóng menu"
          >
            <CloseIcon />
          </button>
        </div>

        {/* User Auth Section */}
        <div className="px-6 py-5 border-b border-zinc-100">
          {isAuthenticated ? (
            <div className="flex flex-col gap-2 text-left">
              <Link
                to="/user_profile"
                onClick={closeMobile}
                className="flex items-center gap-2.5 text-[#18181B] hover:text-[#3B82F6] transition-colors no-underline"
              >
                <UserIcon className="text-[#3B82F6]" />
                <span className="text-[14px] font-semibold">
                  {user?.name ? user.name : "Tài khoản của tôi"}
                </span>
              </Link>
              <button
                onClick={async () => {
                  await logout();
                  closeMobile();
                }}
                className="text-left text-[13px] text-[#E11D48] hover:underline transition-colors bg-transparent border-none outline-none cursor-pointer pt-1"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                closeMobile();
                openLogin();
              }}
              className="flex items-center justify-center gap-2 w-full h-11 rounded-full bg-[#18181B] text-white font-semibold text-[13px] transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <UserIcon className="w-4 h-4" />
              <span>Đăng nhập / Đăng ký</span>
            </button>
          )}
        </div>

        {/* Categories Accordion */}
        <div className="px-6 py-3 flex-1 overflow-y-auto">
          {loadingCategories ? (
            <div className="py-4 text-[#71717A] text-sm">
              Đang tải danh mục...
            </div>
          ) : (
            categories.map((cat) => (
              <MobileAccordion
                key={cat.id || cat.slug}
                onNavigate={closeMobile}
                item={{
                  label: cat.name,
                  href: `/products?cate=${encodeURIComponent(cat.slug)}`,
                  children: Array.isArray(cat.category_brands)
                    ? cat.category_brands.map((cb) => ({
                        label: cb.brand?.name || "Chính hãng",
                        href: `/products?brand=${encodeURIComponent(
                          cb.brand?.slug
                        )}&cate=${encodeURIComponent(cat.slug)}`,
                      }))
                    : undefined,
                }}
              />
            ))
          )}
        </div>

        {/* Primary Explore Products CTA Button */}
        <div className="px-6 pt-4 pb-2">
          <Link
            to="/products"
            onClick={closeMobile}
            className="flex items-center justify-center w-full h-11 rounded-full bg-[#18181B] text-white font-medium text-[14px] hover:bg-zinc-800 transition-all no-underline shadow-sm active:scale-[0.98]"
          >
            Mua ngay &rsaquo;
          </Link>
        </div>

        {/* Bottom Utility Links */}
        <div className="px-6 py-4 border-t border-zinc-100 mt-auto text-left space-y-1.5">
          {[
            { label: "Giỏ hàng", href: "/cart" },
            { label: "Ưu đãi đặc quyền", href: "/products?sale=true" },
            { label: "Hỗ trợ khách hàng", href: "/contact" },
          ].map((link) => (
            <Link
              key={link.label}
              to={link.href}
              onClick={closeMobile}
              className="block py-2 text-[14px] text-[#71717A] hover:text-[#18181B] transition-colors no-underline"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Search Overlay Modal */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
