import { useState, useEffect } from "react";
import { dashboardService } from "@/services/api/admin/dashboardService";

export function useAdminDashboard() {
  const [statsData, setStatsData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [stats, charts, orders] = await Promise.all([
          dashboardService.getStatsData(),
          dashboardService.getChartData(),
          dashboardService.getRecentOrders(),
        ]);
        if (!ignore) {
          setStatsData(stats);
          setChartData(charts);
          setRecentOrders(orders);
        }
      } catch (err) {
        console.error("Failed to load admin dashboard data", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadDashboard();
    return () => {
      ignore = true;
    };
  }, []);

  return {
    statsData,
    chartData,
    recentOrders,
    loading,
  };
}
