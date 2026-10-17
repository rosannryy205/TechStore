import DataTable from "@/components/chart/dataTable";

const recentOrdersColumns = [
  {
    header: "Order ID",
    accessor: "id",
    render: (val) => <span className="font-medium">#{val}</span>,
  },
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
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            bgColors[val] || "bg-gray-100 text-gray-800"
          }`}
        >
          {val}
        </span>
      );
    },
  },
];

export default function RecentOrdersSection({ orders = [] }) {
  return (
    <div className="mb-8">
      <DataTable
        title="Recent Orders"
        columns={recentOrdersColumns}
        data={orders}
      />
    </div>
  );
}
