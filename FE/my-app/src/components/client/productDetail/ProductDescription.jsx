import { SF_DISPLAY } from "@/constants/typography";

export default function ProductDescription({ productName, description }) {
  const specs = [
    "Thông tin chi tiết",
    "Tính năng nổi bật",
    "Chất lượng sản phẩm",
  ];

  return (
    <div className="bg-[#f5f5f7] border-t border-[#e0e0e0]">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 py-16">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div
              className="text-[12px] font-semibold tracking-[0.231px] leading-none text-[#7a7a7a] mb-3"
              style={{ letterSpacing: "0.231px" }}
            >
              MÔ TẢ SẢN PHẨM
            </div>
            <h2
              className="text-[34px] font-semibold tracking-[-0.374px] leading-[1.47] text-[#1d1d1f]"
              style={{
                fontFamily: SF_DISPLAY,
                letterSpacing: "-0.374px",
              }}
            >
              {productName}
            </h2>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-[17px] font-normal tracking-[-0.374px] leading-[1.47] text-[#1d1d1f]">
            {description}
          </p>

          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {specs.map((b) => (
              <li
                key={b}
                className="rounded-[11px] bg-white border border-[rgba(0,0,0,0.08)] p-4"
              >
                <p className="text-[14px] font-semibold tracking-[-0.224px] leading-[1.43] text-[#1d1d1f]">
                  {b}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
