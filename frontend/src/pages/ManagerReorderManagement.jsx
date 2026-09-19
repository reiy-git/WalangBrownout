import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProductsList, saveProduct } from "../api";
import { formatDate, formatNumber } from "../utils/format";
import SearchInput from "../components/common/SearchInput";
import FilterDropdown from "../components/common/FilterDropdown";
import { TableSkeleton } from "../components/common/Skeleton";

const PAGE_SIZE = 5;

// Classify reorder urgency bucket
function getRopStatus(stock, rop) {
  const s = Number(stock) || 0;
  const r = Number(rop) || 1;
  if (s <= r) return "Low";
  if (s <= r * 1.5) return "Medium";
  return "High";
}

// Manager Reorder Management page displaying ROP calculations and stock status
export default function ManagerReorderManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [rawProducts, setRawProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saveError, setSaveError] = useState("");

  // Load products from API on mount
  useEffect(() => {
    let active = true;
    setLoading(true);
    getProductsList().then((items) => { if (active) setRawProducts(items); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const products = useMemo(
    () =>
      rawProducts.map((p) => {
        const stock = p.stock !== undefined
          ? Number(p.stock)
          : Array.isArray(p.batches)
            ? p.batches.reduce((acc, b) => acc + (Number(b.quantity_remaining) || 0), 0)
            : 0;
        const reorderPoint = Number(p.reorderPoint ?? p.reorder_point ?? 0);
        const safetyStock = Number(p.safetyStock ?? p.safety_stock ?? 0);
        const lastReorderDate = p.lastReorderDate || p.last_reorder_date || "-";

        return {
          ...p,
          stock,
          reorderPoint,
          safetyStock,
          lastReorderDate,
          ropStatus: getRopStatus(stock, reorderPoint),
        };
      }),
    [rawProducts],
  );

  const lowCount = products.filter((p) => p.ropStatus === "Low").length;
  const mediumCount = products.filter((p) => p.ropStatus === "Medium").length;
  const highCount = products.filter((p) => p.ropStatus === "High").length;

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = (p.name || "")
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase());
      const matchesStatus =
        statusFilter === "All" || p.ropStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [products, searchTerm, statusFilter]);

  const saveSafetyStock = async (event) => {
    event.preventDefault();
    const value = Number(new FormData(event.currentTarget).get("safety_stock"));
    if (!Number.isFinite(value) || value < 0) { setSaveError("Safety stock must be zero or greater."); return; }
    try {
      setSaveError("");
      await saveProduct({ ...editingProduct, safety_stock: value });
      setEditingProduct(null);
      setLoading(true);
      setRawProducts(await getProductsList());
    } catch (err) { setSaveError(err.message || "Unable to update the reorder point."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE),
  );
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // Return badge color according to ROP alert level
  const statusBadgeClass = (status) =>
    status === "Low"
      ? "bg-rose-500 text-white"
      : status === "Medium"
        ? "bg-amber-400 text-white"
        : "bg-emerald-500 text-white";

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full pb-12 flex-1 flex flex-col font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#2e1065]">
          Reorder
        </h1>
        <button
          type="button"
          onClick={() => navigate("/inventory-list")}
          className="btn btn-sm bg-[#8b7fd6] hover:bg-[#8b7fd6]/90 border-0 text-white font-medium gap-1 px-3.5 rounded-lg shadow-sm text-xs"
        >
          ✦ View Inventory
        </button>
      </div>

      <div className="flex gap-4 items-center mb-6 relative">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search Product..."
        />

        <FilterDropdown
          filters={[
            {
              label: "Status",
              value: statusFilter,
              options: ["All", "Low", "Medium", "High"],
              onChange: setStatusFilter,
            },
          ]}
          onClear={() => setStatusFilter("All")}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() =>
            setStatusFilter(statusFilter === "Low" ? "All" : "Low")
          }
          className={`flex items-center gap-3 bg-white border rounded-xl p-4 shadow-xs text-left transition-all ${
            statusFilter === "Low"
              ? "border-rose-400 ring-2 ring-rose-200"
              : "border-[#d8b4fe]/50 hover:border-rose-300"
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center text-white text-sm shrink-0">
            ⚠
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#2e1065]/70 uppercase tracking-wide">
              Low
            </p>
            <p className="text-lg font-bold text-[#2e1065]">{formatNumber(lowCount)} items</p>
          </div>
        </button>

        <button
          onClick={() =>
            setStatusFilter(statusFilter === "Medium" ? "All" : "Medium")
          }
          className={`flex items-center gap-3 bg-white border rounded-xl p-4 shadow-xs text-left transition-all ${
            statusFilter === "Medium"
              ? "border-amber-400 ring-2 ring-amber-200"
              : "border-[#d8b4fe]/50 hover:border-amber-300"
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-white text-sm shrink-0">
            ⚠
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#2e1065]/70 uppercase tracking-wide">
              Medium
            </p>
            <p className="text-lg font-bold text-[#2e1065]">
              {formatNumber(mediumCount)} items
            </p>
          </div>
        </button>

        <button
          onClick={() =>
            setStatusFilter(statusFilter === "High" ? "All" : "High")
          }
          className={`flex items-center gap-3 bg-white border rounded-xl p-4 shadow-xs text-left transition-all ${
            statusFilter === "High"
              ? "border-emerald-400 ring-2 ring-emerald-200"
              : "border-[#d8b4fe]/50 hover:border-emerald-300"
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm shrink-0">
            ✓
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#2e1065]/70 uppercase tracking-wide">
              High
            </p>
            <p className="text-lg font-bold text-[#2e1065]">
              {formatNumber(highCount)} items
            </p>
          </div>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-[#ede9fe]/40 border border-[#ddd6fe]/70 rounded-2xl p-4 sm:p-5 shadow-xs flex-1 flex flex-col justify-between">
        {loading ? <TableSkeleton columns={6} rows={5} /> : <div className="overflow-x-auto bg-[#ffffff] rounded-xl shadow-xs border border-[#d8b4fe]/50">
          <table className="table table-md w-full text-left">
            <thead>
              <tr className="text-[#2e1065] text-sm font-bold border-b border-[#d8b4fe]/50 bg-[#ede9fe]/30">
                <th className="py-4 pl-6">Product</th>
                <th className="py-4">Last Reorder Date</th>
                <th className="py-4">Current Stock</th>
                <th className="py-4">ROP Level</th>
                <th className="py-4">Status</th>
                <th className="py-4 text-center pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-[#2e1065]">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-[#d8b4fe]/30 hover:bg-[#ede9fe]/20 transition-colors"
                  >
                    <td className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-[#ede9fe] border border-[#d8b4fe]/60 flex items-center justify-center overflow-hidden shrink-0">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] text-[#8b7fd6]">
                              🖼
                            </span>
                          )}
                        </div>
                        <span className="text-[#2e1065]">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-[#4c1d95]/80">
                      {formatDate(p.lastReorderDate)}
                    </td>
                    <td className="py-4 text-[#4c1d95]/90">{formatNumber(p.stock)}</td>
                    <td className="py-4 text-[#4c1d95]/90">{formatNumber(p.reorderPoint)}</td>
                    <td className="py-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadgeClass(p.ropStatus)}`}
                      >
                        {p.ropStatus}
                      </span>
                    </td>
                    <td className="py-4 text-center pr-6">
                      <button
                        onClick={() => { setSaveError(""); setEditingProduct(p); }}
                        className="btn btn-xs bg-white border border-[#2e1065]/20 text-[#2e1065] hover:bg-[#ede9fe]"
                      >
                        Edit ROP
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-[#2e1065]/60 text-sm font-medium"
                  >
                    No products match your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>}

        {!loading && <div className="flex justify-end gap-1.5 mt-5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn btn-square btn-xs bg-[#c4b5fd]/40 hover:bg-[#c4b5fd]/70 border border-[#8b7fd6]/30 text-xs text-[#2e1065] disabled:opacity-40"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`btn btn-square btn-xs border-0 text-xs font-bold ${
                  currentPage === pageNum
                    ? "bg-[#c4b5fd] text-[#2e1065]"
                    : "bg-[#c4b5fd]/40 hover:bg-[#c4b5fd]/70 text-[#2e1065]"
                }`}
              >
                {pageNum}
              </button>
            ),
          )}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-square btn-xs bg-[#c4b5fd]/40 hover:bg-[#c4b5fd]/70 border border-[#8b7fd6]/30 text-xs text-[#2e1065] disabled:opacity-40"
          >
            ›
          </button>
        </div>}
      </div>
      {editingProduct && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" role="dialog" aria-modal="true"><form onSubmit={saveSafetyStock} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 className="text-lg font-bold text-[#2e1065]">Edit Reorder Point</h2><p className="mt-1 text-sm text-[#4c1d95]">{editingProduct.name}</p><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><p>Current stock: <b>{formatNumber(editingProduct.stock)}</b></p><p>Current ROP: <b>{formatNumber(editingProduct.reorderPoint)}</b></p></div><label className="form-control mt-4"><span className="label-text text-xs">Safety stock</span><input name="safety_stock" className="input input-bordered input-sm" type="number" min="0" defaultValue={editingProduct.safetyStock} required /></label><p className="mt-2 min-h-5 text-xs text-rose-600">{saveError}</p><div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => setEditingProduct(null)} className="btn btn-sm btn-ghost">Cancel</button><button type="submit" className="btn btn-sm border-0 bg-[#8b7fd6] text-white">Save ROP</button></div></form></div>}
    </main>
  );
}
