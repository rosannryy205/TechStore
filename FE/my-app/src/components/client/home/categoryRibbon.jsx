import { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { categoryService } from "@/services/api/client/categoryService";
import { SF_TEXT } from "@/constants/typography";

// Hệ sinh thái danh mục công nghệ chuẩn phong cách Apple
const ECOSYSTEM_CATEGORIES = [
  {
    id: "all",
    name: "Tất cả",
    slug: "",
    href: "/products",
    iconType: "all",
  },
  {
    id: "phone",
    name: "iPhone",
    slug: "phone",
    href: "/products?cate=phone",
    iconType: "phone",
  },
  {
    id: "mac",
    name: "Mac",
    slug: "mac",
    href: "/products?cate=mac",
    iconType: "mac",
  },
  {
    id: "ipad",
    name: "iPad",
    slug: "ipad",
    href: "/products?cate=ipad",
    iconType: "ipad",
  },
  {
    id: "watch",
    name: "Watch",
    slug: "watch",
    href: "/products?cate=watch",
    iconType: "watch",
  },
  {
    id: "audio",
    name: "AirPods",
    slug: "audio",
    href: "/products?cate=audio",
    iconType: "audio",
  },
  {
    id: "accessories",
    name: "Phụ kiện",
    slug: "accessories",
    href: "/products?cate=accessories",
    iconType: "accessories",
  },
];

function CategoryIcon({ type }) {
  const iconClass = "w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 group-hover:scale-110";

  switch (type) {
    case "all":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "phone":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="2" width="12" height="20" rx="3" />
          <path d="M11 18h2" />
        </svg>
      );
    case "mac":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M2 18h20" />
          <path d="M9 18v1.5h6v-1.5" />
        </svg>
      );
    case "ipad":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2.5" />
          <circle cx="12" cy="18" r="0.75" />
        </svg>
      );
    case "watch":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6.5" y="5.5" width="11" height="13" rx="3" />
          <path d="M9 2h6v3.5H9zM9 18.5h6V22H9z" />
        </svg>
      );
    case "audio":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 17v-5a9 9 0 0 1 18 0v5" />
          <path d="M21 17a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 17a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
      );
    case "accessories":
    default:
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
  }
}

function resolveIconType(name = "", slug = "") {
  const text = `${name} ${slug}`.toLowerCase();
  if (text.includes("phone") || text.includes("thoại") || text.includes("iphone")) return "phone";
  if (text.includes("mac") || text.includes("laptop") || text.includes("máy tính")) return "mac";
  if (text.includes("ipad") || text.includes("tablet") || text.includes("bảng")) return "ipad";
  if (text.includes("watch") || text.includes("đồng hồ")) return "watch";
  if (text.includes("tai nghe") || text.includes("audio") || text.includes("airpods") || text.includes("âm thanh")) return "audio";
  return "accessories";
}

export default function CategoryRibbon() {
  const [dbCategories, setDbCategories] = useState([]);
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const currentCate = searchParams.get("cate") || "";
  const isProductsPage = location.pathname.startsWith("/products");

  useEffect(() => {
    let ignore = false;
    const fetchCats = async () => {
      try {
        const data = await categoryService.getCategories();
        if (!ignore && Array.isArray(data)) {
          setDbCategories(data);
        }
      } catch {
        if (!ignore) setDbCategories([]);
      }
    };
    fetchCats();
    return () => {
      ignore = true;
    };
  }, []);

  // Tổng hợp danh mục: Luôn có "Tất cả" ở đầu, tích hợp các category thực tế từ DB và bổ sung danh mục mẫu nếu DB chưa đủ
  const displayCategories = useMemo(() => {
    // 1. Luôn có nút "Tất cả"
    const list = [ECOSYSTEM_CATEGORIES[0]];

    // 2. Thêm các danh mục từ database
    const addedSlugs = new Set();
    dbCategories.forEach((cat) => {
      if (cat.slug) {
        addedSlugs.add(cat.slug.toLowerCase());
        list.push({
          id: cat.id || cat.slug,
          name: cat.name,
          slug: cat.slug,
          href: `/products?cate=${encodeURIComponent(cat.slug)}`,
          iconType: resolveIconType(cat.name, cat.slug),
        });
      }
    });

    // 3. Nếu danh mục thực tế ít hơn 3, tự động bổ sung từ danh mục hệ sinh thái mẫu (tránh trùng slug)
    if (dbCategories.length < 3) {
      ECOSYSTEM_CATEGORIES.slice(1).forEach((ecoCat) => {
        if (!addedSlugs.has(ecoCat.slug.toLowerCase())) {
          list.push(ecoCat);
        }
      });
    }

    return list;
  }, [dbCategories]);

  return (
    <nav
      aria-label="Dải danh mục sản phẩm nhanh"
      className="w-full bg-[#fbfbfd] border-b border-[#e5e5e7] py-6 sm:py-8 overflow-hidden"
      style={{ fontFamily: SF_TEXT }}
    >
      <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-start md:justify-center gap-6 sm:gap-10 lg:gap-12 overflow-x-auto no-scrollbar scroll-smooth py-2">
          {displayCategories.map((cat) => {
            // Xác định trạng thái active
            const isActive = isProductsPage && (
              cat.slug === "" ? !currentCate : currentCate.toLowerCase() === cat.slug.toLowerCase()
            );

            return (
              <Link
                key={cat.id || cat.slug}
                to={cat.href}
                className="group flex flex-col items-center gap-2.5 shrink-0 no-underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 rounded-2xl p-1"
                aria-label={`Xem danh mục ${cat.name}`}
              >
                {/* ─── Apple Circular Capsule Button ─── */}
                <div
                  className={[
                    "w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 ease-out",
                    isActive
                      ? "bg-[#0066cc]/10 border-2 border-[#0066cc] text-[#0066cc] shadow-sm scale-105"
                      : "bg-white border border-[#e5e5e7] text-[#1d1d1f] shadow-xs group-hover:-translate-y-1.5 group-hover:shadow-md group-hover:border-[#0066cc]/50 group-hover:text-[#0066cc]",
                  ].join(" ")}
                >
                  <CategoryIcon type={cat.iconType} />
                </div>

                {/* ─── Category Label ─── */}
                <span
                  className={[
                    "text-[12px] sm:text-[13px] tracking-tight text-center whitespace-nowrap transition-colors duration-200",
                    isActive
                      ? "font-semibold text-[#0066cc]"
                      : "font-medium text-[#434344] group-hover:text-[#0066cc]",
                  ].join(" ")}
                >
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
