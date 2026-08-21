import { Package, AlertTriangle } from "lucide-react";

const recentReceives = [
  { product: "Product A", quantity: 10, date: "09-16-2025" },
  { product: "Product B", quantity: 32, date: "09-16-2025" },
  { product: "Product C", quantity: 13, date: "09-16-2025" },
];

const recentDispatches = [
  { product: "Product D", quantity: 10, date: "09-16-2025" },
  { product: "Product E", quantity: 32, date: "09-16-2025" },
  { product: "Product F", quantity: 13, date: "09-16-2025" },
];

function StatCard({ icon, label, value }) {
  return (
    <div className="card card-sm bg-purple-200 shadow-md rounded-xl w-full sm:w-56">
      <div className="card-body flex-row items-center gap-3 p-4">
        <div className="w-10 h-10 shrink-0 rounded-full bg-white shadow-sm flex items-center justify-center">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-purple-700">{label}</span>
          <span className="badge badge-lg bg-purple-600 text-white font-semibold rounded-full px-3 border-0">
            {value}
          </span>
        </div>
      </div>
    </div>
  );
}

function ActivityTable({ title, rows }) {
  return (
    <div className="card card-sm bg-purple-200 shadow-md rounded-xl flex-1 min-w-0">
      <div className="card-body p-4">
        <h2 className="text-sm font-semibold text-purple-950 mb-3">{title}</h2>
        <div className="bg-white rounded-lg overflow-x-auto">
          <table className="table table-sm w-full">
            <thead>
              <tr className="text-purple-950 text-[11px]">
                <th className="font-semibold py-2.5 pl-3">Product</th>
                <th className="font-semibold py-2.5">Quantity</th>
                <th className="font-semibold py-2.5 pr-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="text-purple-950/90 text-xs border-t border-purple-100">
                  <td className="py-2.5 pl-3">{row.product}</td>
                  <td className="py-2.5">{row.quantity}</td>
                  <td className="py-2.5 pr-3 text-right">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * Content-only dashboard, meant to be rendered as a child of DashboardLayout.jsx,
 * which is assumed to already provide the navbar and Sidebar.
 *
 * Usage inside DashboardLayout.jsx:
 *   <DashboardLayout>
 *     <StaffDashboard />
 *   </DashboardLayout>
 */
export default function StaffDashboard({
  totalProducts = 632,
  lowStock = 24,
  receives = recentReceives,
  dispatches = recentDispatches,
}) {
  return (
    <div className="w-full">
      <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-5">
        Dashboard Summary
      </h1>

      {/* Stat cards */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <StatCard
          icon={<Package size={18} className="text-purple-600" />}
          label="Total Product"
          value={totalProducts}
        />
        <StatCard
          icon={<AlertTriangle size={18} className="text-purple-600" />}
          label="Low Stock"
          value={lowStock}
        />
      </div>

      {/* Activity tables */}
      <div className="flex flex-col lg:flex-row gap-5">
        <ActivityTable title="Recent Receives" rows={receives} />
        <ActivityTable title="Recent Dispatches" rows={dispatches} />
      </div>
    </div>
  );
}