import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthModalProvider } from "./contexts/authModalContext";
import { AuthProvider, useAuth } from "./contexts/authContext";
import Loading from "./components/loading";
import MainLayout from "./layouts/mainLayout";
import AdminLayout from "./layouts/adminLayout";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Contact from "./pages/Contact";
import Product_detail from "./pages/productDetail";
import Cart from "./pages/Cart";
import Check_out from "./pages/CheckOut";
import User_profile from "./pages/userProfile";
import OrderSuccess from "./pages/orderSuccess";
import AdminDashboard from "./pages/admin/adminDashboard";
import AddProduct from "./pages/admin/products/addProduct";
import CategoryManagement from "./pages/admin/categoryManagement";
import BrandManagement from "./pages/admin/brandManagement";
/**
 * RequireAdmin — guard bảo vệ route admin.
 * - loading: đang check session => hiện Loading fullscreen.
 * - Chưa đăng nhập hoặc role không phải admin/staff => redirect về trang chủ.
 * - Ngược lại => render layout admin.
 */
function RequireAdmin({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading variant="fullscreen" size="medium" text="Loading..." />;
  }

  const isStaff = user?.role === "admin" || user?.role === "staff";
  if (!isStaff) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthModalProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="products" element={<Products />} />
              <Route path="contact" element={<Contact />} />
              <Route path="product_detail" element={<Product_detail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Check_out />} />
              <Route path="user_profile" element={<User_profile />} />
              <Route path="order-success" element={<OrderSuccess />} />
            </Route>

            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              }
            >
              <Route
                index
                element={<Navigate to="/admin/dashboard" replace />}
              />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="product/add-product" element={<AddProduct/>} />
              <Route path="products/categories" element={<CategoryManagement />} />
              <Route path="products/brands" element={<BrandManagement />} />
              {/* Catch-all: giữ layout admin (header + footer + loading) cho
                  mọi link admin chưa build body, tránh 404 trắng */}
              <Route path="*" element={<AdminDashboard />} />
            </Route>

            {/* Hide : cảnh báo "No routes matched location" khi URL không
                khớp bất kỳ route nào ở trên (VD: "/learn-more", "/pre-order")
                mà không làm mất trang — chỉ render rỗng. */}
            <Route path="*" element={null} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AuthModalProvider>
  );
}

export default App;
