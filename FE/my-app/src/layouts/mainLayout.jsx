import React from "react";
import { Outlet, useLocation } from "react-router-dom";

import Header from "../components/header";
import Footer from "../components/footer";
import AuthModal from "../components/authModal";
import Loading from "../components/loading";

/**
 * Hiện loading gần như ngay khi route-change bắt đầu.
 * Giảm delay để tránh tình trạng Outlet render trước rồi mới bật loading (flick).
 */
const SHOW_DELAY_MS = 0;
// Thời gian tối thiểu hiển thị sau khi đã hiện (đồng bộ với Loading)
const MIN_DURATION_MS = 500;
// Thời gian tối đa hiển thị, phòng trường hợp bị kẹt (đồng bộ với Loading)
const MAX_DURATION_MS = 1500;

export default function MainLayout() {
  const location = useLocation();
  // Trang products tự quản lý loading vùng kết quả; đổi query không được gỡ Outlet.
  const isProductsPage = location.pathname === "/products";
  const routeSearch = isProductsPage ? "" : location.search;

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
  }, [location.pathname, routeSearch]);

  const gateOutlet = isProductsPage || !shouldShow;

  return (
    <>
      <Header />

      <Loading
        variant="fullscreen"
        size="medium"
        text="Loading..."
        shouldShow={!isProductsPage && shouldShow}
        minDurationMs={MIN_DURATION_MS}
        maxDurationMs={MAX_DURATION_MS}
      />

      <div>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {gateOutlet ? <Outlet /> : null}
        </main>
      </div>

      <Footer />

      <AuthModal />
    </>
  );
}
