import BarChart from "@/components/chart/charts";

export default function DashboardChartsGrid({ chartData = [] }) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
      <BarChart title="Revenue Overview" data={chartData} height="300px" />
      <BarChart title="User Growth" data={chartData} height="300px" />
    </div>
  );
}
