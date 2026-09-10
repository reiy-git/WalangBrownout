import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProductsList } from "../services/dataService";
import SearchInput from "../components/common/SearchInput";
import FilterDropdown from "../components/common/FilterDropdown";

const PAGE_SIZE = 5;

function getRopStatus(stock, rop) {
  const s = Number(stock) || 0;
  const r = Number(rop) || 1;
  if (s <= r) return "Low";
  if (s <= r * 1.5) return "Medium";
  return "High";
}

export default function ManagerReorderManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [rawProducts, setRawProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getProductsList().then(setRawProducts);
  }, []);

  const products = useMemo(
    () =>
      rawProducts.map((p) => ({
        ...p,
        ropStatus: getRopStatus(p.stock, p.reorderPoint),
      })),
    [rawProducts],
  );

  const lowCount = products.filter((p) => p.ropStatus === "Low").length;
  const mediumCount = products.filter((p) => p.ropStatus === "Medium").length;
  const highCount = products.filter((p) => p.ropStatus === "High").length;

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase());
      const matchesStatus =
        statusFilter === "All" || p.ropStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [products, searchTerm, statusFilter]);

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
          onClick={() => navigate("/manager-inventory-add-product")}
          className="btn btn-sm bg-[#8b7fd6] hover:bg-[#8b7fd6]/90 border-0 text-white font-medium gap-1 px-3.5 rounded-lg shadow-sm text-xs"
        >
          ✦ Add New Product
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
            <p className="text-lg font-bold text-[#2e1065]">{lowCount} items</p>
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
              {mediumCount} items
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
              {highCount} items
            </p>
          </div>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-[#ede9fe]/40 border border-[#ddd6fe]/70 rounded-2xl p-4 sm:p-5 shadow-xs flex-1 flex flex-col justify-between">
        <div className="overflow-x-auto bg-[#ffffff] rounded-xl shadow-xs border border-[#d8b4fe]/50">
          <table className="table table-md w-full text-left">
            <thead>
              <tr className="text-[#2e1065] text-sm font-bold border-b border-[#d8b4fe]/50 bg-[#ede9fe]/30">
                <th className="py-4 pl-6">Product</th>
                <th className="py-4">Last Reorder Date</th>
                <th className="py-4">Current Stock</th>
                <th className="py-4">ROP Level</th>
                <th className="py-4">Status</th>
                <th className="py-4 text-center pr-6">View</th>
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
                      {p.lastReorderDate}
                    </td>
                    <td className="py-4 text-[#4c1d95]/90">{p.stock}</td>
                    <td className="py-4 text-[#4c1d95]/90">{p.reorderPoint}</td>
                    <td className="py-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadgeClass(p.ropStatus)}`}
                      >
                        {p.ropStatus}
                      </span>
                    </td>
                    <td className="py-4 text-center pr-6">
                      <button
                        onClick={() => navigate(`/reorder-points/${p.id}`)}
                        className="btn btn-square btn-xs bg-[#c4b5fd] hover:bg-[#b4a5ed] border-0 text-sm flex items-center justify-center text-[#2e1065] antialiased mx-auto"
                      >
                        👁︎
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
        </div>

        {/* Functional Pagination */}
        <div className="flex justify-end gap-1.5 mt-5">
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
        </div>
      </div>
    </main>
  );
}
