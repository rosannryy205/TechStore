import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { useSidebar } from "../contexts/sidebarContext";

/* ═══════════════════════════════════════════════════════════════
   HẰNG SỐ & DỮ LIỆU
   ═══════════════════════════════════════════════════════════════ */
const SF_TEXT = "SF Pro Text, system-ui, -apple-system, sans-serif";

/**
 * Menu dashboard — phân cấp BẬC 2.
 * - item có `children`       => hiển thị accordion trong sidebar
 * - item không có `children` => link trực tiếp (VD: Dashboard)
 */
const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: "grid",
  },
  {
    label: "Sản phẩm",
    icon: "box",
    children: [
      { label: "Danh sách danh mục", href: "/admin/products" },
      { label: "Danh sách thương hiệu", href: "/admin/products" },
      { label: "Danh sách sản phẩm", href: "/admin/products" },
      { label: "Danh sách tồn kho", href: "/admin/products" },
    ],
  },
  {
    label: "Đơn hàng",
    icon: "cart",
    children: [
      { label: "Tất cả đơn hàng", href: "/admin/orders" },
      { label: "Đang xử lý", href: "/admin/orders?status=processing" },
      { label: "Đang giao", href: "/admin/orders?status=shipping" },
      { label: "Đã hủy / Trả hàng", href: "/admin/orders?status=cancelled" },
      { label: "Theo dõi bản đồ (Shipper)", href: "/admin/orders/map" },
    ],
  },
  {
    label: "Khách hàng & Quyền",
    icon: "users",
    children: [
      { label: "Danh sách khách hàng", href: "/admin/customers" },
      { label: "Nhóm khách hàng", href: "/admin/customers/groups" },
      { label: "Phân quyền (Roles)", href: "/admin/customers/roles" },
    ],
  },
  { 
    label: "Nội dung (Bài viết)",
    icon: "document",
    children: [
      { label: "Tất cả bài viết", href: "/admin/posts" },
      { label: "Thêm bài viết", href: "/admin/posts/add" },
      { label: "Danh mục bài viết", href: "/admin/posts/categories" },
    ],
  },
  {
    label: "Tương tác & Hỗ trợ",
    icon: "chat",
    children: [
      { label: "Quản lý bình luận", href: "/admin/comments" },
      { label: "Thông báo hệ thống", href: "/admin/notifications" },
      { label: "Email phản hồi", href: "/admin/emails" },
    ],
  },
  {
    label: "Báo cáo",
    icon: "chart",
    children: [
      { label: "Doanh thu", href: "/admin/reports/revenue" },
      { label: "Tồn kho", href: "/admin/reports/inventory" },
      { label: "Khách hàng", href: "/admin/reports/customers" },
    ],
  },
  {
    label: "Cài đặt",
    icon: "cog",
    children: [
      { label: "Cài đặt chung", href: "/admin/settings/general" },
      { label: "Thanh toán", href: "/admin/settings/payments" },
      { label: "Vận chuyển", href: "/admin/settings/shipping" },
    ],
  },
];

/* Thông báo mẫu — sau này thay bằng dữ liệu thật từ API */
const NOTIFICATIONS = [
  {
    id: 1,
    title: "Đơn hàng mới #TS-1024",
    detail: "Khách vừa đặt hàng trị giá 25.900.000 ₫",
    time: "2 phút trước",
    unread: true,
  },
  {
    id: 2,
    title: "Tồn kho sắp hết",
    detail: "iPhone 17 Pro 256GB còn 3 chiếc",
    time: "1 giờ trước",
    unread: true,
  },
  {
    id: 3,
    title: "Khách hàng mới đăng ký",
    detail: "nguyen***@gmail.com vừa tạo tài khoản",
    time: "3 giờ trước",
    unread: false,
  },
];

/* ═══════════════════════════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════════════════════════ */
function IconBase({ size = 16, strokeWidth = 2, className = "", children }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/* Map tên icon -> SVG path */
const ICON_PATHS = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </>
  ),
  box: (
    <>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </>
  ),
  cart: (
    <>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </>
  ),
  cog: (
    <>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  document: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </>
  ),
  chat: (
    <>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>
  ),
  bell: (
    <>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </>
  ),
  chevronDown: <polyline points="6 9 12 15 18 9" />,
  chevronRight: <polyline points="9 18 15 12 9 6" />,
  chevronLeft: <polyline points="15 18 9 12 15 6" />,
  menu: (
    <>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </>
  ),
  close: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  home: (
    <>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </>
  ),
  user: (
    <>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </>
  ),
  plus: (
    <>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </>
  ),
  /* Icon toggle sidebar (panel-left style) */
  panelLeft: (
    <>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
    </>
  ),
};

function NavIcon({ name, size = 16, className = "" }) {
  return (
    <IconBase size={size} className={className}>
      {ICON_PATHS[name]}
    </IconBase>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HOOK: click bên ngoài để đóng dropdown
   ═══════════════════════════════════════════════════════════════ */
function useClickOutside(onOutside) {
  const ref = useRef(null);
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) onOutside();
    }
    document.addEventListener("mousedown", handle);
    document.addEventListener("touchstart", handle);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("touchstart", handle);
    };
  }, [onOutside]);
  return ref;
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENT: SIDEBAR ITEM
   Hỗ trợ 2 dạng: link trực tiếp và accordion có sub-items
   ═══════════════════════════════════════════════════════════════ */
function SidebarItem({ item, active, activeHref, collapsed, onNavigate, onExpandSidebar }) {
  /* Tự mở accordion khi route đang active */
  const [open, setOpen] = useState(() => active && !!item.children);

  /* Class chung cho mỗi item */
  const itemCls = [
    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer",
    collapsed ? "justify-center" : "",
    active
      ? "bg-[#0066cc]/20 text-[#2997ff] font-semibold"
      : "text-[#d2d2d7] hover:text-white hover:bg-[#2a2a2c]",
  ]
    .filter(Boolean)
    .join(" ");

  /* ── Link trực tiếp (không có sub-items) ── */
  if (!item.children) {
    return (
      <Link
        to={item.href}
        onClick={onNavigate}
        title={collapsed ? item.label : undefined}
        className={`${itemCls} no-underline`}
        style={{ fontFamily: SF_TEXT }}
      >
        <NavIcon name={item.icon} size={18} className="shrink-0" />
        {!collapsed && (
          <span className="text-[14px] tracking-[-0.12px] leading-none truncate">
            {item.label}
          </span>
        )}
      </Link>
    );
  }

  /* ── Accordion (có sub-items) ── */
  const handleToggle = () => {
    if (collapsed) {
      /* Khi sidebar đã collapse: click icon => mở rộng sidebar trước */
      onExpandSidebar?.();
      return;
    }
    setOpen((prev) => !prev);
  };

  return (
    <div>
      {/* Level 1 — trigger */}
      <button
        onClick={handleToggle}
        aria-expanded={!collapsed && open}
        title={collapsed ? item.label : undefined}
        className={`${itemCls} w-full bg-transparent border-none outline-none ${
          collapsed ? "" : "justify-between"
        }`}
        style={{ fontFamily: SF_TEXT }}
      >
        <span className="flex items-center gap-3 min-w-0">
          <NavIcon name={item.icon} size={18} className="shrink-0" />
          {!collapsed && (
            <span className="text-[14px] tracking-[-0.12px] leading-none truncate">
              {item.label}
            </span>
          )}
        </span>
        {!collapsed && (
          <IconBase
            size={13}
            className={`transition-transform duration-200 shrink-0 ${
              open ? "rotate-180" : ""
            }`}
          >
            {ICON_PATHS.chevronDown}
          </IconBase>
        )}
      </button>

      {/* Level 2 — accordion content */}
      {!collapsed && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="ml-7 pl-3 border-l border-[#2a2a2c] mt-1 mb-1 flex flex-col gap-0.5">
            {item.children.map((child) => (
              <Link
                key={child.href + child.label}
                to={child.href}
                onClick={onNavigate}
                className={`px-3 py-2 text-[13px] rounded-lg no-underline transition-colors ${
                  activeHref === child.href
                    ? "text-white bg-[#2a2a2c]"
                    : "text-[#86868b] hover:text-white hover:bg-[#2a2a2c]"
                }`}
                style={{ fontFamily: SF_TEXT }}
              >
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LOGO SVG (dùng lại nhiều chỗ)
   ═══════════════════════════════════════════════════════════════ */
function LogoIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M13 3L4 14h7l-2 7 9-11h-7l2-7z"
        fill="white"
        stroke="white"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HEADER ADMIN
   Render cả Topbar (sticky, full-width) + Sidebar (fixed, trái)
   ─────────────────────────────────────────────────────────────
   Desktop (≥ lg / 1024px):
     • Sidebar hiển thị cố định bên trái, width 240px (expanded) hoặc 64px (collapsed)
     • Topbar full-width, nút panelLeft để toggle collapse sidebar
   Tablet (768–1023px) & Mobile (< 768px):
     • Sidebar ẩn mặc định, mở dạng overlay drawer từ trái sang
     • Topbar có nút hamburger để mở drawer
   ═══════════════════════════════════════════════════════════════ */
export default function HeaderAdmin() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const userMenuRef = useClickOutside(() => setUserMenuOpen(false));
  const notifRef = useClickOutside(() => setNotifOpen(false));

  const pathname = location.pathname;

  /* Trạng thái active cho từng nav item */
  const navState = NAV_ITEMS.map((item) => {
    if (item.href) {
      return { item, active: pathname.startsWith(item.href) };
    }
    const activeChild = item.children.find((c) => pathname.startsWith(c.href));
    return { item, active: !!activeChild, activeHref: activeChild?.href };
  });

  /* Khoá scroll body khi mobile drawer mở */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);
  const expandSidebar = () => setCollapsed(false);

  /* Avatar initials */
  const initials = (user?.name || "A")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const firstName = (user?.name || "Admin").split(" ")[0];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  /* Số thông báo chưa đọc */
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <>
      {/* ═══════════════════════════════════════════
          TOPBAR — fixed, full-width, z-50
          Hiển thị trên cả sidebar (z-30/z-40)
      ═══════════════════════════════════════════ */}
      <header
        id="admin-topbar"
        className="fixed top-0 left-0 right-0 h-14 z-50 bg-[#1d1d1f]"
        style={{
          fontFamily: SF_TEXT,
          borderBottom: "1px solid #2a2a2c",
        }}
      >
        <div className="flex items-center h-full px-3 sm:px-4 gap-2 sm:gap-3">

          {/* ── Hamburger: mobile / tablet ── */}
          <button
            id="admin-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg
              text-[#d2d2d7] hover:text-white hover:bg-[#2a2a2c]
              transition-colors bg-transparent border-none outline-none cursor-pointer shrink-0"
          >
            <IconBase size={18}>
              {ICON_PATHS[mobileOpen ? "close" : "menu"]}
            </IconBase>
          </button>

          {/* ── Panel toggle: desktop — thu gọn / mở rộng sidebar ── */}
          <button
            id="admin-sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            className="hidden lg:inline-flex items-center justify-center w-9 h-9 rounded-lg
              text-[#d2d2d7] hover:text-white hover:bg-[#2a2a2c]
              transition-colors bg-transparent border-none outline-none cursor-pointer shrink-0"
          >
            <NavIcon name="panelLeft" size={18} />
          </button>

          {/* ── Logo / brand ── */}
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-2 no-underline shrink-0"
            aria-label="TechStore Admin — Trang chủ"
          >
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#0066cc]">
              <LogoIcon size={15} />
            </span>
            <span className="hidden sm:flex items-center gap-1.5 leading-none">
              <span className="text-white text-[13px] font-semibold tracking-[0.3px] uppercase">
                TechStore
              </span>
              <span className="inline-block rounded-full bg-[#0066cc] text-white text-[10px] font-semibold tracking-[0.2px] px-2 py-0.5 leading-none">
                ADMIN
              </span>
            </span>
          </Link>

          {/* ── Search bar: tablet / desktop ── */}
          <div className="hidden md:block flex-1 max-w-96 mx-auto">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b] flex pointer-events-none">
                <NavIcon name="search" size={15} />
              </span>
              <input
                id="admin-search"
                type="search"
                placeholder="Tìm kiếm đơn hàng, khách hàng, sản phẩm..."
                className="w-full rounded-full bg-[#333336] text-white text-[13px] tracking-[-0.12px]
                  py-2.5 pl-9 pr-4 border border-transparent
                  placeholder:text-[#86868b]
                  focus:bg-[#1d1d1f] focus:border-[#0066cc] focus:outline-none
                  transition-all"
                style={{ fontFamily: SF_TEXT }}
              />
            </div>
          </div>

          {/* ── Right: notifications + user ── */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2">

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                id="admin-notif-btn"
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setUserMenuOpen(false);
                }}
                aria-label="Thông báo"
                aria-expanded={notifOpen}
                className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg
                  text-[#d2d2d7] hover:text-white hover:bg-[#2a2a2c]
                  transition-colors bg-transparent border-none outline-none cursor-pointer"
              >
                <NavIcon name="bell" size={18} />
                {/* Badge */}
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full
                    bg-[#ff3b30] text-white text-[9px] font-bold
                    flex items-center justify-center leading-none ring-[1.5px] ring-[#1d1d1f] shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {notifOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-80 max-w-[calc(100vw-16px)]">
                  <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-[#e5e5ea]
                    shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#f0f0f0] bg-white/50">
                      <span className="text-[15px] font-semibold tracking-[-0.24px] text-[#1d1d1f]">
                        Thông báo
                      </span>
                      <button className="text-[13px] font-medium text-[#0066cc] hover:text-[#0071e3] transition-colors bg-transparent border-none cursor-pointer p-0"
                        style={{ fontFamily: SF_TEXT }}>
                        Đánh dấu đã đọc
                      </button>
                    </div>
                    <div className="max-h-90 overflow-y-auto">
                      {NOTIFICATIONS.map((n) => (
                        <div
                          key={n.id}
                          className={`flex gap-3 px-4 py-3.5 border-b border-[#f0f0f0] last:border-b-0
                            cursor-pointer transition-colors hover:bg-[#f5f5f7] ${
                              n.unread ? "bg-[#f2f8ff]" : ""
                            }`}
                        >
                          <span
                            className={`mt-1.5 w-2 h-2 rounded-full shrink-0 shadow-sm ${
                              n.unread ? "bg-[#0066cc]" : "bg-[#d2d2d7]"
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-medium tracking-[-0.16px] text-[#1d1d1f] truncate mb-0.5">
                              {n.title}
                            </p>
                            <p className="text-[13px] text-[#515154] leading-[1.4] line-clamp-2">
                              {n.detail}
                            </p>
                            <p className="text-[11px] font-medium text-[#86868b] mt-1.5 tracking-wide">
                              {n.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-3.5 text-center border-t border-[#f0f0f0] bg-[#f5f5f7]/50 hover:bg-[#f5f5f7] transition-colors cursor-pointer">
                      <Link to="/admin/notifications" className="text-[13px] font-medium text-[#0066cc] no-underline block w-full"
                        style={{ fontFamily: SF_TEXT }}>
                        Xem tất cả thông báo
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <span className="hidden sm:block w-px h-5 bg-[#333336] mx-0.5" />

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                id="admin-user-menu-btn"
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setNotifOpen(false);
                }}
                aria-expanded={userMenuOpen}
                aria-label="Menu tài khoản"
                className="flex items-center gap-2 py-1 pl-1 pr-2 rounded-lg
                  hover:bg-[#2a2a2c] transition-colors
                  bg-transparent border-none outline-none cursor-pointer"
              >
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full
                  bg-[#0066cc] text-white text-[12px] font-semibold leading-none shrink-0">
                  {initials}
                </span>
                <span className="hidden lg:flex flex-col items-start leading-none gap-0.5">
                  <span className="text-white text-[13px] font-medium tracking-[-0.12px]">
                    {firstName}
                  </span>
                  <span className="text-[#86868b] text-[11px] tracking-[-0.12px]">
                    Quản trị viên
                  </span>
                </span>
                <IconBase
                  size={13}
                  className={`text-[#86868b] transition-transform duration-200 ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                >
                  {ICON_PATHS.chevronDown}
                </IconBase>
              </button>

              {/* User dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full pt-2 z-50 w-60">
                  <div className="rounded-xl bg-white border border-[#e0e0e0]
                    shadow-[0_16px_40px_rgba(0,0,0,0.13)] overflow-hidden">
                    {/* Summary */}
                    <div className="px-4 py-3.5 border-b border-[#f0f0f0] flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-full
                        bg-[#0066cc] text-white text-[13px] font-semibold leading-none shrink-0">
                        {initials}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold tracking-[-0.224px] text-[#1d1d1f] truncate">
                          {user?.name || "Admin"}
                        </p>
                        <p className="text-[12px] text-[#7a7a7a] truncate">
                          {user?.email || "admin@techstore.vn"}
                        </p>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="py-1.5">
                      <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-2.5 text-[14px]
                          text-[#333333] hover:text-[#0066cc] hover:bg-[#f5f5f7]
                          transition-colors no-underline"
                        style={{ fontFamily: SF_TEXT }}
                      >
                        <NavIcon name="home" size={15} className="shrink-0" />
                        Về trang chủ
                      </Link>
                      <Link
                        to="/user_profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-[14px]
                          text-[#333333] hover:text-[#0066cc] hover:bg-[#f5f5f7]
                          transition-colors no-underline"
                        style={{ fontFamily: SF_TEXT }}
                      >
                        <NavIcon name="user" size={15} className="shrink-0" />
                        Tài khoản
                      </Link>
                    </div>
                    <div className="border-t border-[#f0f0f0] py-1.5">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-[14px]
                          text-[#e30000] hover:bg-[#fff0f0]
                          transition-colors bg-transparent border-none outline-none cursor-pointer text-left"
                        style={{ fontFamily: SF_TEXT }}
                      >
                        <NavIcon name="logout" size={15} className="shrink-0" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════
          BACKDROP — mobile / tablet
          Phủ nền khi drawer mở, click để đóng
      ═══════════════════════════════════════════ */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 bg-black/50 lg:hidden z-45 transition-opacity duration-300 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMobile}
      />

      {/* ═══════════════════════════════════════════
          SIDEBAR
          Desktop  : fixed bên trái, z-30 (dưới topbar z-50)
          Mobile   : overlay drawer, z-[55] (trên topbar)
          Width    : 240px (expanded) / 64px (collapsed)
          Transition: translate-x + width smooth
      ═══════════════════════════════════════════ */}
      <aside
        id="admin-sidebar"
        aria-label="Menu quản trị"
        style={{ fontFamily: SF_TEXT, borderRight: "1px solid #2a2a2c" }}
        className={[
          "fixed top-0 left-0 h-screen flex flex-col bg-[#1d1d1f]",
          "transition-all duration-300 ease-out overflow-hidden",
          /* z-index: mobile drawer nổi trên topbar; desktop dưới topbar */
          mobileOpen ? "z-55" : "z-30",
          /* Width */
          collapsed ? "lg:w-16" : "lg:w-60",
          "w-60 max-w-[85vw]",
          /* Translate: ẩn trên mobile, hiện trên desktop */
          mobileOpen ? "translate-x-0 shadow-[4px_0_32px_rgba(0,0,0,0.5)]" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* ── Sidebar Header (h-14 = đồng bộ topbar) ── */}
        <div
          className={`flex items-center h-14 px-3 shrink-0 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
          style={{ borderBottom: "1px solid #2a2a2c" }}
        >
          {/* Logo — hiện khi không collapse */}
          {!collapsed && (
            <Link
              to="/admin/dashboard"
              onClick={closeMobile}
              className="flex items-center gap-2 no-underline flex-1 min-w-0"
            >
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#0066cc] shrink-0">
                <LogoIcon size={15} />
              </span>
              <span className="text-white text-[13px] font-semibold tracking-[0.3px] uppercase truncate">
                TechStore{" "}
                <span className="text-[#2997ff]">Admin</span>
              </span>
            </Link>
          )}

          {/* Chỉ icon khi collapse */}
          {collapsed && (
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#0066cc]">
              <LogoIcon size={15} />
            </span>
          )}

          {/* Mobile: nút đóng drawer */}
          {!collapsed && (
            <button
              onClick={closeMobile}
              aria-label="Đóng menu"
              className="lg:hidden inline-flex items-center justify-center w-8 h-8 rounded-lg
                text-[#86868b] hover:text-white hover:bg-[#2a2a2c]
                transition-colors bg-transparent border-none outline-none cursor-pointer shrink-0 ml-1"
            >
              <IconBase size={16}>{ICON_PATHS.close}</IconBase>
            </button>
          )}
        </div>

        {/* ── User info (ẩn khi collapse) ── */}
        {!collapsed && (
          <div
            className="px-4 py-3 shrink-0"
            style={{ borderBottom: "1px solid #2a2a2c" }}
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full
                bg-[#0066cc] text-white text-[12px] font-semibold leading-none shrink-0">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="text-white text-[13px] font-semibold tracking-[-0.12px] truncate">
                  {user?.name || "Admin"}
                </p>
                <p className="text-[#86868b] text-[11px] truncate">
                  {user?.email || "admin@techstore.vn"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Navigation ── */}
        <nav
          aria-label="Menu chính"
          className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#2a2a2c transparent" }}
        >
          {navState.map(({ item, active, activeHref }) => (
            <SidebarItem
              key={item.label}
              item={item}
              active={active}
              activeHref={activeHref}
              collapsed={collapsed}
              onNavigate={closeMobile}
              onExpandSidebar={expandSidebar}
            />
          ))}
        </nav>

        {/* ── Footer ── */}
        <div className="shrink-0" style={{ borderTop: "1px solid #2a2a2c" }}>
          {/* Desktop: nút collapse (nằm trong sidebar) */}
          <div className={`hidden lg:flex px-2 pt-2 ${collapsed ? "justify-center" : ""}`}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl
                text-[#86868b] hover:text-white hover:bg-[#2a2a2c]
                transition-colors bg-transparent border-none outline-none cursor-pointer
                ${collapsed ? "justify-center" : ""}`}
              style={{ fontFamily: SF_TEXT }}
            >
              <IconBase size={16}>
                {ICON_PATHS[collapsed ? "chevronRight" : "chevronLeft"]}
              </IconBase>
              {!collapsed && (
                <span className="text-[13px] tracking-[-0.12px]">Thu gọn</span>
              )}
            </button>
          </div>

          {/* Home + Logout */}
          <div className="px-2 py-2 flex flex-col gap-0.5">
            <Link
              to="/"
              onClick={closeMobile}
              title={collapsed ? "Về trang chủ" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl
                text-[#d2d2d7] hover:text-white hover:bg-[#2a2a2c]
                transition-colors no-underline
                ${collapsed ? "justify-center" : ""}`}
              style={{ fontFamily: SF_TEXT }}
            >
              <NavIcon name="home" size={17} className="shrink-0" />
              {!collapsed && (
                <span className="text-[14px] tracking-[-0.12px]">Về trang chủ</span>
              )}
            </Link>

            <button
              onClick={async () => {
                closeMobile();
                await handleLogout();
              }}
              title={collapsed ? "Đăng xuất" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl w-full
                text-[#e30000] hover:bg-[#2a2a2c]/80 hover:text-[#ff453a]
                transition-colors bg-transparent border-none outline-none cursor-pointer text-left
                ${collapsed ? "justify-center" : ""}`}
              style={{ fontFamily: SF_TEXT }}
            >
              <NavIcon name="logout" size={17} className="shrink-0" />
              {!collapsed && (
                <span className="text-[14px] tracking-[-0.12px]">Đăng xuất</span>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
