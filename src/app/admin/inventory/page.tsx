"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  Boxes, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Search, 
  X, 
  Plus, 
  Minus, 
  Loader2, 
  RefreshCw, 
  IndianRupee, 
  Package, 
  TrendingUp, 
  Edit3 
} from "lucide-react";
import { getCloudinaryUrl } from "@/lib/utils";

export default function AdminInventory() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "LOW_STOCK" | "OUT_OF_STOCK" | "HEALTHY">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [customStock, setCustomStock] = useState<number>(0);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["admin-inventory-products"],
    queryFn: () => productService.getAllProducts(0, 150),
  });

  // Update Stock Mutation
  const updateStockMutation = useMutation({
    mutationFn: async ({ product, newQuantity }: { product: any; newQuantity: number }) => {
      return await productService.updateProduct({
        ...product,
        id: product.id,
        quantity: Math.max(0, newQuantity),
        categoryName: product.category?.name || product.categoryName || "Apparel",
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-inventory-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products-category"] });
      setEditingId(null);
      setToast({
        type: "success",
        message: `Restocked "${data?.name || "Product"}" to ${data?.quantity || 0} units!`,
      });
    },
    onError: (err: any) => {
      setToast({
        type: "error",
        message: err?.message || "Failed to update inventory.",
      });
    },
  });

  // Fast Quick Restock Handler (+5, +10, +25, etc.)
  const handleQuickRestock = (product: any, delta: number) => {
    const nextQty = Math.max(0, (product.quantity || 0) + delta);
    updateStockMutation.mutate({ product, newQuantity: nextQty });
  };

  const handleSaveCustomStock = (product: any) => {
    updateStockMutation.mutate({ product, newQuantity: customStock });
  };

  // Filter out deactivated/soft-deleted products
  const products = (productsData?.content || []).filter((p) => p.isActive !== false);

  // Calculate High-Level Metrics
  const totalUnits = products.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.price || 0) * (p.quantity || 0), 0);
  const outOfStockCount = products.filter((p) => (p.quantity || 0) <= 0).length;
  const lowStockCount = products.filter((p) => (p.quantity || 0) > 0 && (p.quantity || 0) < 5).length;
  const healthyStockCount = products.filter((p) => (p.quantity || 0) >= 5).length;

  // Filtered Products List
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    // Status Filter
    if (statusFilter === "OUT_OF_STOCK" && (product.quantity || 0) > 0) return false;
    if (statusFilter === "LOW_STOCK" && ((product.quantity || 0) <= 0 || (product.quantity || 0) >= 5)) return false;
    if (statusFilter === "HEALTHY" && (product.quantity || 0) < 5) return false;

    // Category Filter
    if (categoryFilter !== "ALL") {
      const catName = product.category?.name?.toLowerCase() || "";
      if (!catName.includes(categoryFilter.toLowerCase())) return false;
    }

    // Search Query
    if (normalizedQuery) {
      const idMatch = String(product.id).includes(normalizedQuery.replace("#", ""));
      const nameMatch = product.name?.toLowerCase().includes(normalizedQuery);
      const brandMatch = (product.brand?.toLowerCase() || "dfo").includes(normalizedQuery);
      const catMatch = product.category?.name?.toLowerCase().includes(normalizedQuery);
      return idMatch || nameMatch || brandMatch || catMatch;
    }

    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 text-sm font-medium shadow-2xl border transition-all ${
            toast.type === "success"
              ? "bg-white border-green-500 text-green-700"
              : "bg-white border-red-500 text-red-700"
          }`}
        >
          <span className={`text-lg font-bold ${toast.type === "success" ? "text-green-500" : "text-red-500"}`}>
            {toast.type === "success" ? "✓" : "✕"}
          </span>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-medium tracking-tight">Inventory Control</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          Monitor warehouse quantities, manage restock thresholds, and execute 1-click batch inventory updates.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Stock */}
        <div className="bg-white border border-gray-200 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Total Units
            </span>
            <Package className="w-4 h-4 text-gray-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-medium text-black mt-2">
            {totalUnits.toLocaleString()}
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">across active catalog</span>
        </div>

        {/* Total Inventory Value */}
        <div className="bg-white border border-gray-200 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Asset Valuation
            </span>
            <IndianRupee className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-medium text-black mt-2">
            ₹{totalInventoryValue.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-700 mt-1 block font-medium">total inventory value</span>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white border border-amber-200 bg-amber-50/30 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 font-semibold">
              Low Stock Alert
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-medium text-amber-800 mt-2">
            {lowStockCount}
          </p>
          <span className="text-[11px] text-amber-700 mt-1 block">below 5 units remaining</span>
        </div>

        {/* Out of Stock */}
        <div className="bg-white border border-rose-200 bg-rose-50/30 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-rose-800 font-semibold">
              Out of Stock
            </span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-medium text-rose-800 mt-2">
            {outOfStockCount}
          </p>
          <span className="text-[11px] text-rose-700 mt-1 block">needs immediate restock</span>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pt-2">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full lg:w-auto scrollbar-none">
          {[
            { id: "ALL", label: `All (${products.length})` },
            { id: "LOW_STOCK", label: `⚠️ Low Stock (${lowStockCount})` },
            { id: "OUT_OF_STOCK", label: `🔴 Out of Stock (${outOfStockCount})` },
            { id: "HEALTHY", label: `🟢 In Stock (${healthyStockCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3.5 py-2 text-xs font-semibold uppercase tracking-wider rounded-none shrink-0 transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-black text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-black"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Department Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-11 px-3 border border-gray-200 focus:border-black bg-white rounded-none text-xs sm:text-sm outline-none cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Footwear">Footwear</option>
            <option value="Accessories">Accessories</option>
          </select>

          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product or #ID..."
              className="w-full h-11 pl-10 pr-9 border border-gray-200 focus:border-black bg-white rounded-none text-xs sm:text-sm outline-none placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-gray-150 overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            {searchQuery || statusFilter !== "ALL" || categoryFilter !== "ALL" ? (
              <>
                <p>No products match the selected inventory filter.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("ALL");
                    setCategoryFilter("ALL");
                  }}
                  className="mt-3 text-xs uppercase tracking-widest font-bold underline text-black cursor-pointer"
                >
                  Clear All Filters
                </button>
              </>
            ) : (
              "No products available in inventory."
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-gray-150 bg-gray-50 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  <th className="p-3.5 sm:p-4 w-16">ID</th>
                  <th className="p-3.5 sm:p-4">Product Details</th>
                  <th className="p-3.5 sm:p-4 w-28">Category</th>
                  <th className="p-3.5 sm:p-4 w-28">Unit Price</th>
                  <th className="p-3.5 sm:p-4 w-32">Current Stock</th>
                  <th className="p-3.5 sm:p-4 w-60 text-right pr-6">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const qty = product.quantity || 0;
                  const isLow = qty > 0 && qty < 5;
                  const isOut = qty <= 0;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* ID */}
                      <td className="p-3.5 sm:p-4 font-mono text-xs text-gray-500 font-semibold">
                        #{product.id}
                      </td>

                      {/* Product Details */}
                      <td className="p-3.5 sm:p-4">
                        <div className="flex items-center gap-3">
                          {product.imageUrls?.[0] && (
                            <div className="w-10 h-10 relative shrink-0 overflow-hidden rounded-[2px] bg-gray-100 border border-gray-100">
                              <Image
                                src={getCloudinaryUrl(product.imageUrls[0]) || product.imageUrls[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <span className="font-heading font-medium text-sm text-black block">
                              {product.name}
                            </span>
                            <span className="text-[11px] text-gray-400 font-mono">
                              Valuation: ₹{((product.price || 0) * qty).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5 sm:p-4 text-gray-500 capitalize text-xs">
                        {product.category?.name || "Apparel"}
                      </td>

                      {/* Unit Price */}
                      <td className="p-3.5 sm:p-4 font-mono text-xs font-medium">
                        ₹{product.price}
                      </td>

                      {/* Current Stock */}
                      <td className="p-3.5 sm:p-4">
                        {editingId === product.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              value={customStock}
                              onChange={(e) => setCustomStock(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-16 h-8 px-2 border border-black text-xs font-mono font-bold outline-none bg-white"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveCustomStock(product)}
                              disabled={updateStockMutation.isPending}
                              className="bg-black text-white px-2 py-1 text-xs hover:bg-neutral-800 cursor-pointer font-medium"
                              title="Save"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-gray-400 hover:text-black p-1 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-mono text-xs font-bold px-2 py-0.5 rounded-[2px] ${
                                isOut
                                  ? "bg-rose-100 text-rose-800 border border-rose-200"
                                  : isLow
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              }`}
                            >
                              {qty} units
                            </span>
                            <button
                              onClick={() => {
                                setEditingId(product.id);
                                setCustomStock(qty);
                              }}
                              className="text-gray-400 hover:text-black p-0.5 transition-colors cursor-pointer"
                              title="Custom edit stock"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* 1-Click Quick Restock Buttons */}
                      <td className="p-3.5 sm:p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          {[+5, +10, +25, +50].map((delta) => (
                            <button
                              key={delta}
                              onClick={() => handleQuickRestock(product, delta)}
                              disabled={updateStockMutation.isPending}
                              className="px-2 py-1 text-[11px] font-mono font-bold bg-neutral-100 hover:bg-black hover:text-white text-black border border-gray-200 transition-colors rounded-[2px] cursor-pointer shadow-2xs"
                              title={`Add ${delta} units to stock`}
                            >
                              +{delta}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
