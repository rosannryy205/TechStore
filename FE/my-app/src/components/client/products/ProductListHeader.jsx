import { SF_DISPLAY, SF_TEXT } from "@/constants/typography";

export default function ProductListHeader({ count }) {
  return (
    <div className="max-w-245 mx-auto mb-8 text-center">
      <div
        className="inline-flex items-center justify-center gap-3 rounded-full bg-[#f5f5f7] border border-[#e0e0e0] px-4 py-2"
        style={{ fontFamily: SF_TEXT }}
      >
        <span className="text-[12px] font-semibold tracking-[0.231px] leading-none text-[#7a7a7a]">
          KẾT QUẢ
        </span>
        <span className="text-[14px] tracking-[-0.224px] text-[#1d1d1f]">
          {count} sản phẩm
        </span>
      </div>

      <h2
        className="mt-6 text-[28px] md:text-[34px] lg:text-[40px] font-semibold leading-[1.1] tracking-[-0.374px]"
        style={{ fontFamily: SF_DISPLAY }}
      >
        Danh sách sản phẩm
      </h2>
      <p
        className="mt-3 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#cccccc]"
        style={{ fontFamily: SF_TEXT }}
      >
        Mỗi trang hiển thị tối đa 16 sản phẩm — đồng bộ theo cat/brand từ Header.
      </p>
    </div>
  );
}
