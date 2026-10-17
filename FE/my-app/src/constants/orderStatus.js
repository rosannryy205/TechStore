export const ORDER_STATUS_MAP = {
  pending: { label: "Pending", color: "text-[#ca7600]", bg: "bg-[#fff7e6]" },
  confirmed: {
    label: "Confirmed",
    color: "text-[#0066cc]",
    bg: "bg-[#e8f4ff]",
  },
  processing: {
    label: "Processing",
    color: "text-[#0066cc]",
    bg: "bg-[#e8f4ff]",
  },
  shipping: { label: "Shipping", color: "text-[#0066cc]", bg: "bg-[#e8f4ff]" },
  completed: {
    label: "Completed",
    color: "text-[#1d8a3d]",
    bg: "bg-[#e8f8ee]",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-[#e30000]",
    bg: "bg-[#fff0f0]",
  },
};
