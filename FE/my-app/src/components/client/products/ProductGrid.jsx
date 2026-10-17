import { SF_TEXT } from "@/constants/typography";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products = [] }) {
  if (products.length === 0) {
    return (
      <div className="text-center mt-14" style={{ fontFamily: SF_TEXT }}>
        <div className="text-[17px] tracking-[-0.374px] leading-[1.47] text-[#7a7a7a]">
          Không có sản phẩm.
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
      {products.map((p) => (
        <ProductCard key={p.id ?? p.href ?? p.name} product={p} />
      ))}
    </div>
  );
}
