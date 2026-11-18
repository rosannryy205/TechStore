import React from "react";
import { Outlet, useLocation } from "react-router-dom";

import HeaderAdmin from "../components/headerAdmin";
import FooterAdmin from "../components/footerAdmin";
import Loading from "../components/loading";
import { SidebarProvider, useSidebar } from "../contexts/sidebarContext";

/**
 * Hiện loading gần như ngay khi route-change bắt đầu.
 * Giảm delay để tránh tình trạng Outlet render trước rồi mới bật loading (flick).
 */
const SHOW_DELAY_MS = 0;
// Thời gian tối thiểu hiển thị sau khi đã hiện (đồng bộ với Loading)
const MIN_DURATION_MS = 500;
// Thời gian tối đa hiển thị, phòng trường hợp bị kẹt (đồng bộ với Loading)
const MAX_DURATION_MS = 1500;

/**
 * AdminLayoutInner — phần layout thực sự, cần nằm trong SidebarProvider
 * để đọc được trạng thái `collapsed` và tính margin-left cho content.
 *
 * Cấu trúc:
 *   Topbar  (fixed, h-14, z-50)
 *   Sidebar (fixed trái, z-30 desktop / z-55 mobile)
 *   ─────────────────────────────────────────────
 *   Content wrapper
 *     pt-14  → bù chiều cao Topbar (56px)
 *     lg:ml-60 (expanded) / lg:ml-16 (collapsed) → bù chiều rộng Sidebar
 */
function AdminLayoutInner() {
  const location = useLocation();
  const { collapsed } = useSidebar();

  const [shouldShow, setShouldShow] = React.useState(false);
  const showTimerRef = React.useRef(null);
  const hideTimerRef = React.useRef(null);

  React.useEffect(() => {
    // Clear mọi timer cũ trước khi xử lý route mới
    if (showTimerRef.current) clearTimeout(showTimerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    // Delay nhỏ trước khi hiện overlay — tránh chớp nháy khi chuyển trang nhanh
    showTimerRef.current = setTimeout(() => {
      setShouldShow(true);

      // Hard cap: đảm bảo loading không bị kẹt quá lâu
      hideTimerRef.current = setTimeout(() => {
        setShouldShow(false);
      }, MAX_DURATION_MS);
    }, SHOW_DELAY_MS);

    return () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [location.pathname]);

  return (
    <>
      {/* Topbar + Sidebar (cả hai được render bên trong HeaderAdmin) */}
      <HeaderAdmin />

      <Loading
        variant="fullscreen"
        size="medium"
        text="Loading..."
        shouldShow={shouldShow}
        minDurationMs={MIN_DURATION_MS}
        maxDurationMs={MAX_DURATION_MS}
      />

      {/* ── Content Wrapper ──
          pt-14      : bù topbar height (56px)
          lg:ml-60   : bù sidebar width khi expanded (240px = w-60)
          lg:ml-16   : bù sidebar width khi collapsed (64px  = w-16)
          transition : animate smooth khi toggle collapse
      ── */}
      <div
        className={[
          "transition-[margin] duration-300 ease-out",
          "pt-14", /* topbar offset */
          collapsed ? "lg:ml-16" : "lg:ml-60", /* sidebar offset — desktop only */
        ].join(" ")}
      >
        <main
          style={{
            minHeight: "calc(100vh - 56px)", /* 56px = topbar height */
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Giữ màn hình mounted khi overlay hiện để đổi tab/query không mất filter hoặc drawer. */}
          <Outlet />
        </main>

        <FooterAdmin />
      </div>
    </>
  );
}

/**
 * AdminLayout — wrapper ngoài cùng bọc SidebarProvider
 * Mọi component con (HeaderAdmin, AdminLayoutInner) đều có thể
 * dùng useSidebar() để đọc / ghi trạng thái sidebar.
 */
export default function AdminLayout() {
  return (
    <SidebarProvider>
      <AdminLayoutInner />
    </SidebarProvider>
  );
}
