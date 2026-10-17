import { Link } from "react-router-dom";

export default function EmptyCart() {
  return (
    <div className="text-center py-20 fade-in-up">
      <Link
        to="/products"
        className="inline-block bg-[#0066cc] text-[#ffffff] px-5.5 py-2.75 rounded-full text-[17px] font-normal hover:bg-[#0071e3] active:scale-95 transition-all no-underline"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
