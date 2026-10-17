import { Link } from "react-router-dom";
import { SF_DISPLAY } from "@/constants/typography";

export default function OrderCustomerInfo({ order }) {
  return (
    <>
      <div className="bg-[#ffffff] rounded-[18px] border border-[#e0e0e0] p-6 sm:p-8 mb-8">
        <h2
          className="text-[21px] font-semibold tracking-[-0.374px] mb-6"
          style={{ fontFamily: SF_DISPLAY }}
        >
          Delivery & Payment Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[15px]">
          <div>
            <div className="text-[#7a7a7a] mb-1">Recipient Information</div>
            <div className="font-semibold text-[#1d1d1f]">
              {order.receiver_name}
            </div>
            <div className="text-[#7a7a7a] mt-0.5">{order.receiver_phone}</div>
            {order.receiver_email && (
              <div className="text-[#7a7a7a] mt-0.5">{order.receiver_email}</div>
            )}
            <div className="text-[#1d1d1f] mt-2">{order.address}</div>
          </div>

          <div>
            <div className="text-[#7a7a7a] mb-1">Payment Method</div>
            <div className="font-semibold text-[#1d1d1f] uppercase">
              {order.payment_method === "cod"
                ? "Cash on Delivery (COD)"
                : order.payment_method || "—"}
            </div>
            <div className="mt-2 text-[#7a7a7a]">
              Status:{" "}
              <span
                className={`font-semibold ${
                  order.payment_status === "paid"
                    ? "text-[#1d8a3d]"
                    : "text-[#ca7600]"
                }`}
              >
                {order.payment_status?.toUpperCase() || "PENDING"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Link
          to="/products"
          className="w-full sm:w-auto inline-flex items-center justify-center bg-[#0066cc] text-white px-7 py-3.5 rounded-full text-[17px] font-normal hover:bg-[#0071e3] active:scale-95 transition-all no-underline"
        >
          Continue Shopping
        </Link>
        <Link
          to="/user_profile"
          className="w-full sm:w-auto inline-flex items-center justify-center bg-[#f5f5f7] text-[#1d1d1f] px-7 py-3.5 rounded-full text-[17px] font-normal hover:bg-[#e8e8ed] active:scale-95 transition-all no-underline"
        >
          View in Account
        </Link>
      </div>
    </>
  );
}
