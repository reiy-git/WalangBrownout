import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { computeStatus, getProductsList } from "../services/dataService";
import FilterDropdown from "../components/common/FilterDropdown";
import SearchInput from "../components/common/SearchInput";

export default function ManagerInventoryList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [choiceProduct, setChoiceProduct] = useState(null);

  useEffect(() => {
    getProductsList().then(setProducts);
  }, []);

  const normalizedProducts = useMemo(
    () => products.map((product) => ({ ...product, status: computeStatus(product.stock, product.reorderPoint) })),
    [products],
  );

  const categoryOptions = useMemo(
    () => ["All", ...new Set(normalizedProducts.map((product) => product.category).filter(Boolean))],
    [normalizedProducts],
  );

  const statusOptions = useMemo(
    () => ["All", ...new Set(normalizedProducts.map((product) => product.status))],
    [normalizedProducts],
  );

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return normalizedProducts.filter((product) => {
      const matchesSearch = !query || product.name.toLowerCase().includes(query);
      const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
      const matchesStatus = statusFilter === "All" || product.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [normalizedProducts, searchTerm, categoryFilter, statusFilter]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full pb-12 flex-1 flex flex-col font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#2e1065]">Inventory List</h1>
        <button type="button" onClick={() => navigate("/manager-inventory-add-product")} className="btn btn-sm bg-[#8b7fd6] hover:bg-[#8b7fd6]/90 border-0 text-white font-medium gap-1 px-3.5 rounded-lg shadow-sm text-xs">✦ Add New Product</button>
      </div>

      <div className="flex gap-4 items-center mb-6">
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search Product..." />
        <FilterDropdown
          filters={[
            { label: "Category", value: categoryFilter, options: categoryOptions, onChange: setCategoryFilter },
            { label: "Status", value: statusFilter, options: statusOptions, onChange: setStatusFilter },
          ]}
          onClear={() => { setCategoryFilter("All"); setStatusFilter("All"); }}
        />
      </div>

      <div className="bg-[#ede9fe]/40 border border-[#ddd6fe]/70 rounded-2xl p-4 sm:p-5 shadow-xs flex-1">
        <div className="overflow-x-auto bg-white rounded-xl shadow-xs border border-[#d8b4fe]/50">
          <table className="table table-md w-full text-left">
            <thead><tr className="text-[#2e1065] text-sm font-bold border-b border-[#d8b4fe]/50 bg-[#ede9fe]/30"><th className="py-4 pl-6">Product</th><th className="py-4">Category</th><th className="py-4">Stock</th><th className="py-4">Status</th><th className="py-4 text-center">Receive/Dispatch</th><th className="py-4 text-center pr-6">Edit/View</th></tr></thead>
            <tbody className="text-sm font-medium text-[#2e1065]">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-[#d8b4fe]/30 hover:bg-[#ede9fe]/20 transition-colors">
                  <td className="py-4 pl-6">{product.name}</td><td className="py-4">{product.category || "-"}</td><td className="py-4">{product.stock}</td>
                  <td className="py-4"><span className={product.status === "In Stock" ? "text-emerald-600" : product.status === "Low Stock" ? "text-amber-500" : "text-rose-500"}>{product.status}</span></td>
                  <td className="py-4 text-center"><button type="button" onClick={() => setChoiceProduct(product)} className="btn btn-xs bg-[#c4b5fd] hover:bg-[#b4a5ed] border-0 text-[#2e1065] font-semibold px-4 rounded-md">Receive/Dispatch</button></td>
                  <td className="py-4 text-center pr-6"><div className="flex justify-center gap-2"><button type="button" onClick={() => navigate(`/edit-product/${product.id}`)} className="btn btn-xs bg-white border border-gray-300 text-[#2e1065]">Edit</button><button type="button" onClick={() => navigate(`/product-details/${product.id}`)} className="btn btn-xs bg-white border border-gray-300 text-[#2e1065]">View</button></div></td>
                </tr>
              ))}
              {!filteredProducts.length && <tr><td colSpan={6} className="py-8 text-center text-[#2e1065]/60">No products found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {choiceProduct && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <h2 className="text-lg font-bold text-[#2e1065] mb-1">Receive or Dispatch?</h2>
            <p className="text-xs text-[#2e1065]/60 mb-6">What would you like to do with <span className="font-semibold">{choiceProduct.name}</span>?</p>
            <div className="flex flex-col gap-3 mb-3">
              <button type="button" onClick={() => navigate(`/receive-product/${choiceProduct.id}`)} className="btn btn-sm bg-[#8b7fd6] border-0 text-white rounded-lg">Receive Product</button>
              <button type="button" onClick={() => navigate(`/dispatch-product/${choiceProduct.id}`)} className="btn btn-sm bg-[#5B4FBF] border-0 text-white rounded-lg">Dispatch Product</button>
            </div>
            <button type="button" onClick={() => setChoiceProduct(null)} className="btn btn-sm w-full bg-white border border-gray-300 text-[#2e1065] rounded-lg">Cancel</button>
          </div>
        </div>
      )}
    </main>
  );
}
