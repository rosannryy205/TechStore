import { SF_TEXT } from "@/constants/typography";
import { useHomeProducts } from "@/hooks/client/useHomeProducts";
import Hero3D from "@/components/client/home/Hero3D";
import CategoryRibbon from "@/components/client/home/categoryRibbon";
import Interactive3DStudio from "@/components/client/home/Interactive3DStudio";
import Bento3DGrid from "@/components/client/home/Bento3DGrid";
import HighlightSection from "@/components/client/home/HighlightSection";
import HomeSkeleton from "@/components/client/home/HomeSkeleton";

export default function Home() {
  const { newArrivals, featured, popular, loading, error } = useHomeProducts();

  // Stitch DESIGN.md rule 59 & 121: Skeletal shimmer matching exact layout dimensions, never circular spinners
  if (loading) {
    return <HomeSkeleton />;
  }

  return (
    <main
      className="w-full bg-[#F9FAFB] text-[#18181B] flex flex-col overflow-x-hidden min-h-[100dvh]"
      style={{ fontFamily: SF_TEXT }}
    >
      {/* ─── TẦNG 1: HERO 3D SHOWCASE (Asymmetric 50/50, Inline Image Typography, 3D Stage) ─── */}
      <Hero3D />

      {/* ─── TẦNG 2: CATEGORY QUICK-NAV RIBBON (3D Tactile Capsule Buttons) ─── */}
      <CategoryRibbon />

      {/* Contextual Error Notice if API fails */}
      {error && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 w-full my-6">
          <div className="bg-white border-l-4 border-[#E11D48] text-[#18181B] p-4 rounded-2xl shadow-sm text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
              <span className="text-[#71717A]">
                Không thể đồng bộ dữ liệu trực tuyến ({error}). Đang hiển thị sản phẩm mẫu hệ thống.
              </span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-[12px] font-semibold text-[#3B82F6] hover:underline cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      {/* ─── TẦNG 3: FLAGSHIP 3D STUDIO (Real-time Interactive 3D Rotation, Angles, Hotspots) ─── */}
      <Interactive3DStudio />

      {/* ─── TẦNG 4: BENTO 3D GRID - SẢN PHẨM MỚI & NỔI BẬT (Row 1: 2fr/1fr/1fr, Row 2: 70/30) ─── */}
      <Bento3DGrid
        id="new-arrivals"
        title="Thiết kế thế hệ mới. Đột phá công nghệ."
        subtitle="Khám phá các thiết bị cao cấp với kiến trúc vi xử lý tiên phong và độ hoàn thiện tinh xảo."
        items={newArrivals.length > 0 ? newArrivals : featured}
        toneBg="#F9FAFB"
      />

      {/* ─── TẦNG 5: BENTO 3D GRID - SẢN PHẨM BÁN CHẠY NHẤT ─── */}
      <Bento3DGrid
        id="popular"
        title="Sản phẩm được tin dùng nhất"
        subtitle="Hệ sinh thái thiết bị được đông đảo người dùng công nghệ đánh giá cao về hiệu năng và độ tin cậy."
        items={popular}
        toneBg="#FFFFFF"
      />

      {/* ─── TẦNG 6: TECHSTORE TRADE-IN & ĐẶC QUYỀN (2-Column Asymmetric Zig-Zag Layout) ─── */}
      <HighlightSection />
    </main>
  );
}
