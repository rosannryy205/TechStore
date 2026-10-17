import { SF_DISPLAY } from "@/constants/typography";
import { formatDateVi } from "@/utils/formatDate";

export default function OrderSuccessBanner({ orderId, createdDate }) {
  return (
    <div className="text-center mb-12">
      <div className="flex justify-center mb-8">
        <div className="w-20 h-20 rounded-full bg-[#f5f5f7] flex items-center justify-center">
          <svg
            className="w-10 h-10 text-[#0066cc]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h1
        className="text-[34px] md:text-[40px] font-semibold leading-[1.1] tracking-[-0.374px] mb-3"
        style={{ fontFamily: SF_DISPLAY }}
      >
        Thank you for your order.
      </h1>
      <p className="text-[17px] text-[#7a7a7a] font-normal tracking-[-0.374px] mb-4">
        We've received your order and will begin processing it right away.
      </p>

      <div className="inline-block bg-[#f5f5f7] rounded-[11px] px-4 py-2 text-[14px] text-[#7a7a7a]">
        Order number: <span className="font-semibold text-[#1d1d1f]">{orderId}</span>
        <span className="mx-2">•</span>
        Placed on:{" "}
        <span className="font-semibold text-[#1d1d1f]">
          {formatDateVi(createdDate)}
        </span>
      </div>
    </div>
  );
}
