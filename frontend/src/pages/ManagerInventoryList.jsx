import React, { useCallback, useEffect, useMemo, useState } from "react";
import { computeStatus, getProductsList, saveProduct, recordReceiveStock, recordDispatchStock } from "../api";
import { formatCurrency, formatDate, formatNumber } from "../utils/format";
import FilterDropdown from "../components/common/FilterDropdown";
import SearchInput from "../components/common/SearchInput";
import { TableSkeleton } from "../components/common/Skeleton";

export default function ManagerInventoryList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modal, setModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const isManager = ["manager", "admin", "administrator"].includes(
    (localStorage.getItem("user_role") || "").toLowerCase(),
  );

  const refreshProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setProducts(await getProductsList());
    } catch (err) {
      setError(err.message || "Unable to load inventory.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  const normalizedProducts = useMemo(
    () =>
      products.map((product) => {
        const stock = product.stock !== undefined
          ? Number(product.stock)
          : Array.isArray(product.batches)
            ? product.batches.reduce((acc, b) => acc + (Number(b.quantity_remaining) || 0), 0)
            : 0;
        const reorderPoint = Number(product.reorderPoint ?? product.reorder_point ?? 0);
        const category = product.category || (product.abc_category ? `Category ${product.abc_category}` : "Unassigned");
        const status = computeStatus(stock, reorderPoint);

        return {
          ...product,
          stock,
          reorderPoint,
          category,
          status,
        };
      }),
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
      const matchesSearch = !query
        || product.name.toLowerCase().includes(query)
        || product.sku.toLowerCase().includes(query);
      const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
      const matchesStatus = statusFilter === "All" || product.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [normalizedProducts, searchTerm, categoryFilter, statusFilter]);

  const closeModal = () => {
    setModal(null);
    setFormError("");
  };

  const submit = async (event, action) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      await action(new FormData(event.currentTarget));
      await refreshProducts();
      closeModal();
    } catch (err) {
      setFormError(err.message || "Unable to save changes.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full pb-12 flex-1 flex flex-col font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#2e1065]">Inventory List</h1>
        {isManager && (
          <button type="button" onClick={() => setModal({ type: "add" })} className="btn btn-sm bg-[#8b7fd6] hover:bg-[#8b7fd6]/90 border-0 text-white font-medium gap-1 px-3.5 rounded-lg shadow-sm text-xs">
            ✦ Add New Product
          </button>
        )}
      </div>

      <div className="flex gap-4 items-center mb-6">
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search product or SKU..." />
        <FilterDropdown
          filters={[
            { label: "Category", value: categoryFilter, options: categoryOptions, onChange: setCategoryFilter },
            { label: "Status", value: statusFilter, options: statusOptions, onChange: setStatusFilter },
          ]}
          onClear={() => { setCategoryFilter("All"); setStatusFilter("All"); }}
        />
      </div>

      {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}

      <div className="bg-[#ede9fe]/40 border border-[#ddd6fe]/70 rounded-2xl p-4 sm:p-5 shadow-xs flex-1">
        {loading ? <TableSkeleton columns={6} rows={6} /> : (
          <div className="overflow-x-auto bg-white rounded-xl shadow-xs border border-[#d8b4fe]/50">
            <table className="table table-md w-full text-left">
              <thead><tr className="text-[#2e1065] text-sm font-bold border-b border-[#d8b4fe]/50 bg-[#ede9fe]/30"><th className="py-4 pl-6">Product</th><th className="py-4">Category</th><th className="py-4">Stock</th><th className="py-4">Status</th><th className="py-4 text-center">Receive/Dispatch</th><th className="py-4 text-center pr-6">Edit/View</th></tr></thead>
              <tbody className="text-sm font-medium text-[#2e1065]">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-[#d8b4fe]/30 hover:bg-[#ede9fe]/20 transition-colors">
                    <td className="py-4 pl-6"><div>{product.name}</div><div className="text-xs text-[#4c1d95]/60">{product.sku}</div></td><td className="py-4">{product.category || "-"}</td><td className="py-4">{formatNumber(product.stock)}</td>
                    <td className="py-4"><span className={product.status === "In Stock" ? "text-emerald-600" : product.status === "Low Stock" ? "text-amber-500" : "text-rose-500"}>{product.status}</span></td>
                    <td className="py-4 text-center">
                      <button type="button" onClick={() => setModal({ type: "receive", product })} className="btn btn-xs bg-emerald-100 text-emerald-700 mr-2 rounded-md">Receive</button>
                      <button type="button" onClick={() => setModal({ type: "dispatch", product })} className="btn btn-xs bg-rose-100 text-rose-700 rounded-md">Dispatch</button>
                    </td>
                    <td className="py-4 text-center pr-6">
                      <button type="button" onClick={() => setModal({ type: "details", product })} className="btn btn-xs bg-white border border-gray-300 text-[#2e1065]">View Details</button>
                    </td>
                  </tr>
                ))}
                {!filteredProducts.length && <tr><td colSpan={6} className="py-8 text-center text-[#2e1065]/60">No products found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal?.type === "details" && (
        <InventoryModal title="Product Details & FIFO Batches" onClose={closeModal}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 text-sm">
            <div><p className="text-xs text-gray-500">Stock</p><b>{formatNumber(modal.product.stock)}</b></div>
            <div><p className="text-xs text-gray-500">Unit Cost</p><b>{formatCurrency(modal.product.unit_cost)}</b></div>
            <div><p className="text-xs text-gray-500">Reorder Point</p><b>{formatNumber(modal.product.reorderPoint)}</b></div>
            <div><p className="text-xs text-gray-500">Safety Stock</p><b>{formatNumber(modal.product.safety_stock)}</b></div>
          </div>
          <div className="overflow-x-auto"><table className="table table-sm"><thead><tr><th>Batch</th><th>Received</th><th>Expiry</th><th>Remaining</th><th>Status</th></tr></thead><tbody>
            {(modal.product.batches || []).map((batch) => <tr key={batch.id}><td>{batch.batch_number}</td><td>{formatDate(batch.date_received)}</td><td>{formatDate(batch.expiry_date)}</td><td>{formatNumber(batch.quantity_remaining)} / {formatNumber(batch.quantity_received)}</td><td className="capitalize">{batch.status}</td></tr>)}
            {!modal.product.batches?.length && <tr><td colSpan={5}>No batch records available.</td></tr>}
          </tbody></table></div>
        </InventoryModal>
      )}

      {modal?.type === "add" && (
        <InventoryModal title="Add New Product" onClose={closeModal}>
          <form className="grid sm:grid-cols-2 gap-4" onSubmit={(event) => submit(event, (data) => saveProduct(Object.fromEntries(data)))}>
            <InventoryField name="name" label="Product name" required />
            <InventoryField name="sku" label="SKU" required />
            <InventoryField name="unit_cost" label="Unit cost" type="number" step="0.01" required />
            <label className="form-control"><span className="label-text text-xs">ABC category</span><select name="abc_category" className="select select-bordered select-sm" defaultValue="B"><option>A</option><option>B</option><option>C</option></select></label>
            <InventoryField name="safety_stock" label="Safety stock" type="number" defaultValue={5} required />
            <InventoryField name="annual_demand" label="Annual demand" type="number" defaultValue={100} required />
            <InventoryField name="expiry_months" label="Expiry months (0 for appliances)" type="number" defaultValue={0} required />
            <ModalActions error={formError} submitting={submitting} onClose={closeModal} />
          </form>
        </InventoryModal>
      )}

      {modal?.type === "receive" && (
        <InventoryModal title={`Receive Stock — ${modal.product.name}`} onClose={closeModal}>
          <form className="grid sm:grid-cols-2 gap-4" onSubmit={(event) => submit(event, (data) => recordReceiveStock({ productId: modal.product.id, quantity: data.get("quantity"), supplier: data.get("supplier"), batchNumber: data.get("batch_number") || undefined, notes: data.get("notes") || undefined }))}>
            <InventoryField name="quantity" label="Quantity" type="number" min="1" required />
            <InventoryField name="supplier" label="Supplier" required />
            <InventoryField name="batch_number" label="Batch number (optional)" />
            <InventoryField name="notes" label="Notes (optional)" />
            <ModalActions error={formError} submitting={submitting} onClose={closeModal} label="Receive Stock" />
          </form>
        </InventoryModal>
      )}

      {modal?.type === "dispatch" && (
        <InventoryModal title={`Dispatch Stock — ${modal.product.name}`} onClose={closeModal}>
          <form className="grid sm:grid-cols-2 gap-4" onSubmit={(event) => submit(event, (data) => {
            const quantity = Number(data.get("quantity"));
            if (quantity > modal.product.stock) throw new Error(`Only ${modal.product.stock} unit(s) are available.`);
            return recordDispatchStock({ productId: modal.product.id, quantity, department: data.get("department"), notes: data.get("notes") || undefined });
          })}>
            <InventoryField name="quantity" label={`Quantity (available: ${modal.product.stock})`} type="number" min="1" max={modal.product.stock} required />
            <InventoryField name="department" label="Department / destination" required />
            <InventoryField name="notes" label="Notes (optional)" />
            <ModalActions error={formError} submitting={submitting} onClose={closeModal} label="Dispatch Stock" />
          </form>
        </InventoryModal>
      )}
    </main>
  );
}

function InventoryModal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <section className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-violet-100 bg-white px-5 py-4">
          <h2 className="text-base font-bold text-[#2e1065]">{title}</h2>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm btn-square" aria-label="Close modal">✕</button>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}

function InventoryField({ label, name, type = "text", ...props }) {
  return <label className="form-control"><span className="label-text text-xs">{label}</span><input name={name} type={type} className="input input-bordered input-sm" {...props} /></label>;
}

function ModalActions({ error, submitting, onClose, label = "Save" }) {
  return <div className="sm:col-span-2"><p className="min-h-5 text-xs text-rose-600">{error}</p><div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="btn btn-sm btn-ghost">Cancel</button><button type="submit" disabled={submitting} className="btn btn-sm bg-[#8b7fd6] text-white border-0">{submitting ? "Saving..." : label}</button></div></div>;
}
