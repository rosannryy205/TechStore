import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

// Components
import StatCard from "../../components/chart/statCard";
import DataTable from "../../components/chart/dataTable";
import BarChart from "../../components/chart/charts";

export default function AdminDashboard() {

  // --- Mock Data ---
  const statsData = [
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

  const chartData = [
    { label: "Jan", value: 3200 },
    { label: "Feb", value: 4500 },
    { label: "Mar", value: 3800 },
    { label: "Apr", value: 5200 },
    { label: "May", value: 4800 },
    { label: "Jun", value: 6500 },
    { label: "Jul", value: 5900 },
  ];

  const recentOrdersColumns = [
    { header: "Order ID", accessor: "id", render: (val) => <span className="font-medium">#{val}</span> },
    { header: "Customer", accessor: "customer" },
    { header: "Date", accessor: "date" },
    { header: "Amount", accessor: "amount" },
    {
      header: "Status",
      accessor: "status",
      render: (val) => {
        const bgColors = {
          Completed: "bg-green-100 text-green-800",
          Processing: "bg-blue-100 text-blue-800",
          Pending: "bg-yellow-100 text-yellow-800",
          Cancelled: "bg-red-100 text-red-800",
        };
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${bgColors[val] || "bg-gray-100 text-gray-800"}`}>
            {val}
          </span>
        );
      },
    },
  ];

  const recentOrdersData = [
    { id: "ORD-7391", customer: "Nguyễn Văn A", date: "2026-08-11", amount: "$120.00", status: "Completed" },
    { id: "ORD-7392", customer: "Trần Thị B", date: "2026-08-11", amount: "$340.50", status: "Processing" },
    { id: "ORD-7393", customer: "Lê Văn C", date: "2026-08-10", amount: "$45.00", status: "Pending" },
    { id: "ORD-7394", customer: "Phạm Thị D", date: "2026-08-09", amount: "$890.00", status: "Completed" },
    { id: "ORD-7395", customer: "Hoàng Văn E", date: "2026-08-08", amount: "$210.00", status: "Cancelled" },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-[#f5f5f7]">
      <div className="mx-auto max-w-7xl">
            {/* Page Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1
                  className="text-[34px] font-semibold text-[#1d1d1f]"
                  style={{
                    fontFamily: "SF Pro Display, system-ui, sans-serif",
                    letterSpacing: "-0.374px",
                    lineHeight: 1.1,
                  }}
                >
                  Dashboard
                </h1>
                <p
                  className="mt-1 text-[17px] text-[#7a7a7a]"
                  style={{
                    fontFamily: "SF Pro Text, system-ui, sans-serif",
                    letterSpacing: "-0.374px",
                  }}
                >
                  Overview of your store's performance.
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <button
                  className="inline-flex items-center justify-center rounded-full bg-[#0066cc] px-5 py-2.5 text-[14px] font-medium text-white transition-transform hover:scale-95 focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-2"
                  style={{
                    fontFamily: "SF Pro Text, system-ui, sans-serif",
                    letterSpacing: "-0.224px",
                  }}
                >
                  Download Report
                </button>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {statsData.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            {/* Charts Section */}
            <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <BarChart title="Revenue Overview" data={chartData} height="300px" />
              <BarChart title="User Growth" data={chartData} height="300px" />
            </div>

            {/* Data Table Section */}
            <div className="mb-8">
              <DataTable
                title="Recent Orders"
                columns={recentOrdersColumns}
                data={recentOrdersData}
              />
            </div>
          </div>
    </div>
  );
}
