import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard";
import DashboardHeader from "@/components/admin/dashboard/DashboardHeader";
import DashboardStatsGrid from "@/components/admin/dashboard/DashboardStatsGrid";
import DashboardChartsGrid from "@/components/admin/dashboard/DashboardChartsGrid";
import RecentOrdersSection from "@/components/admin/dashboard/RecentOrdersSection";

export default function AdminDashboard() {
  const { statsData, chartData, recentOrders } = useAdminDashboard();

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-[#f5f5f7]">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader />
        <DashboardStatsGrid stats={statsData} />
        <DashboardChartsGrid chartData={chartData} />
        <RecentOrdersSection orders={recentOrders} />
      </div>
    </div>
  );
}
