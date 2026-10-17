import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

export const dashboardService = {
  getStatsData: async () => {
    return [
      {
        title: "Total Revenue",
        value: "$45,231.89",
        change: "20.1%",
        changeType: "increase",
        icon: CurrencyDollarIcon,
      },
      {
        title: "Orders",
        value: "+2350",
        change: "15.3%",
        changeType: "increase",
        icon: ShoppingBagIcon,
      },
      {
        title: "Active Users",
        value: "12,234",
        change: "4.5%",
        changeType: "increase",
        icon: UsersIcon,
      },
      {
        title: "Conversion Rate",
        value: "3.48%",
        change: "1.2%",
        changeType: "decrease",
        icon: ArrowTrendingUpIcon,
      },
    ];
  },

  getChartData: async () => {
    return [
      { label: "Jan", value: 3200 },
      { label: "Feb", value: 4500 },
      { label: "Mar", value: 3800 },
      { label: "Apr", value: 5200 },
      { label: "May", value: 4800 },
      { label: "Jun", value: 6500 },
      { label: "Jul", value: 5900 },
    ];
  },

  getRecentOrders: async () => {
    return [
      { id: "ORD-7391", customer: "Nguyễn Văn A", date: "2026-08-11", amount: "$120.00", status: "Completed" },
      { id: "ORD-7392", customer: "Trần Thị B", date: "2026-08-11", amount: "$340.50", status: "Processing" },
      { id: "ORD-7393", customer: "Lê Văn C", date: "2026-08-10", amount: "$45.00", status: "Pending" },
      { id: "ORD-7394", customer: "Phạm Thị D", date: "2026-08-09", amount: "$890.00", status: "Completed" },
      { id: "ORD-7395", customer: "Hoàng Văn E", date: "2026-08-08", amount: "$210.00", status: "Cancelled" },
    ];
  },
};
