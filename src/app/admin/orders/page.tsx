"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services/orderService";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2, Calendar, DollarSign, ShoppingBag, Eye, User, MapPin } from "lucide-react";
import ConfirmModal from "@/components/shared/ConfirmModal";

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["admin-orders", page],
    queryFn: () => orderService.getAllOrders(page, 20),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      orderService.updateOrderStatus(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setToast({
        type: "success",
        message: `Order #${variables.id} status updated to ${variables.status}`,
      });
      if (selectedOrder && selectedOrder.id === variables.id) {
        setSelectedOrder((prev: any) => ({ ...prev, orderStatus: variables.status }));
      }
      setTimeout(() => setToast(null), 3500);
    },
    onError: (err: any) => {
      setToast({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Failed to update order status",
      });
      setTimeout(() => setToast(null), 3500);
    },
  });

  const handleStatusChange = (orderId: number, status: string) => {
    updateStatusMutation.mutate({ id: orderId, status });
  };

  const refundMutation = useMutation({
    mutationFn: (orderId: number) => orderService.refundOrder(orderId),
    onSuccess: (data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setToast({
        type: "success",
        message: `Refund successful for order #${orderId}`,
      });
      setTimeout(() => setToast(null), 3500);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, orderStatus: "REFUNDED" }));
      }
    },
    onError: (err: any) => {
      setToast({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Refund failed",
      });
      setTimeout(() => setToast(null), 3500);
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (orderId: number) => orderService.deleteOrder(orderId),
    onSuccess: (data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setToast({
        type: "success",
        message: `Order #${orderId} deleted successfully`,
      });
      setTimeout(() => setToast(null), 3500);
      setSelectedOrder(null);
    },
    onError: (err: any) => {
      setToast({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Failed to delete order",
      });
      setTimeout(() => setToast(null), 3500);
    },
  });

  const handleRefundClick = (orderId: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Refund Order",
      message: "Are you sure you want to refund this order?",
      confirmText: "Refund",
      cancelText: "Cancel",
      isDestructive: true,
      onConfirm: () => {
        refundMutation.mutate(orderId);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleDeleteOrderClick = (orderId: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Order",
      message: "Are you sure you want to delete this order?",
      confirmText: "Delete Order",
      cancelText: "Cancel",
      isDestructive: true,
      onConfirm: () => {
        deleteOrderMutation.mutate(orderId);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const orders = ordersData?.content || [];
  const totalPages = ordersData?.totalPages || 0;

  const statuses = ["PENDING", "CANCELLED", "ORDERED", "FAILED", "DISPATCHED"];

  // Filter orders by search & status tab
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredOrders = orders.filter((order: any) => {
    const matchesStatus = statusFilter === "ALL" || order.orderStatus === statusFilter;
    const matchesSearch = !normalizedQuery || 
      String(order.id).includes(normalizedQuery.replace("#", "")) ||
      order.orderItems?.some((item: any) => item.product?.name?.toLowerCase().includes(normalizedQuery)) ||
      order.user?.name?.toLowerCase().includes(normalizedQuery) ||
      order.user?.userName?.toLowerCase().includes(normalizedQuery);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 sm:space-y-8 relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 text-sm font-medium shadow-lg border rounded-none ${
            toast.type === "success"
              ? "bg-white border-green-500 text-green-700 animate-in fade-in slide-in-from-top-4 duration-200"
              : "bg-white border-red-500 text-red-700 animate-in fade-in slide-in-from-top-4 duration-200"
          }`}
        >
          <span className={`text-lg font-bold ${toast.type === "success" ? "text-green-500" : "text-red-500"}`}>
            {toast.type === "success" ? "✓" : "✕"}
          </span>
          {toast.message}
        </div>
      )}

      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-medium tracking-tight">Orders</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">Track and manage customer fulfillment pipelines and shipping statuses.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order ID or item..."
            className="w-full h-11 pl-10 pr-9 border border-gray-200 focus:border-black bg-white rounded-none text-sm outline-none transition-colors placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {["ALL", ...statuses].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-none shrink-0 transition-colors cursor-pointer ${
              statusFilter === st
                ? "bg-black text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-black hover:text-black"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders Table Container */}
      <div className="bg-white border border-gray-150 overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            {searchQuery || statusFilter !== "ALL" ? (
              <>
                <p>No orders found matching the filter criteria.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("ALL");
                  }}
                  className="mt-3 text-xs uppercase tracking-widest font-bold underline text-black cursor-pointer"
                >
                  Clear Filters
                </button>
              </>
            ) : (
              "No orders available in database."
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-150 bg-gray-50 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  <th className="p-3.5 sm:p-4 w-24">Order ID</th>
                  <th className="p-3.5 sm:p-4 w-28">Date</th>
                  <th className="p-3.5 sm:p-4">Customer</th>
                  <th className="p-3.5 sm:p-4">Items Summary</th>
                  <th className="p-3.5 sm:p-4 w-28">Amount</th>
                  <th className="p-3.5 sm:p-4 w-32">Status</th>
                  <th className="p-3.5 sm:p-4 w-44 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-3.5 sm:p-4 font-mono font-medium text-xs">#{order.id}</td>
                    <td className="p-3.5 sm:p-4 text-xs text-gray-600">
                      {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="p-3.5 sm:p-4 text-xs">
                      <div className="font-semibold text-black">{order.user?.name || "Anonymous"}</div>
                      <div className="text-gray-400 font-mono text-[10px] mt-0.5">{order.user?.userName || "No Email"}</div>
                    </td>
                    <td className="p-3.5 sm:p-4 max-w-xs">
                      <div className="text-xs line-clamp-1 text-gray-800">
                        {order.orderItems?.map((item: any) => `${item.product?.name || "Item"} (x${item.quantity})`).join(", ") || "No items"}
                      </div>
                    </td>
                    <td className="p-3.5 sm:p-4 font-mono font-medium text-xs">₹{order.totalPrice}</td>
                    <td className="p-3.5 sm:p-4">
                      <span className={`inline-block text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 border ${
                        order.orderStatus === "DISPATCHED"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : order.orderStatus === "ORDERED"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : order.orderStatus === "CANCELLED" || order.orderStatus === "FAILED"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-right">
                      <div className="flex items-center justify-end gap-2 sm:gap-3 flex-wrap">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-black bg-gray-100 hover:bg-black hover:text-white px-2.5 py-1.5 rounded-none transition-all cursor-pointer shadow-2xs shrink-0"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>
                        {order.orderStatus !== "REFUNDED" && (
                          <button
                            onClick={() => handleRefundClick(order.id)}
                            disabled={refundMutation.isPending}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white px-2.5 py-1.5 rounded-none transition-all cursor-pointer shadow-2xs disabled:opacity-50 shrink-0"
                          >
                            {refundMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                            Refund
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteOrderClick(order.id)}
                          disabled={deleteOrderMutation.isPending}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-red-600 bg-red-50 hover:bg-red-600 hover:text-white px-2.5 py-1.5 rounded-none transition-all cursor-pointer shadow-2xs disabled:opacity-50 shrink-0"
                        >
                          {deleteOrderMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                          Delete
                        </button>
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={updateStatusMutation.isPending}
                          className="text-xs bg-white border border-gray-200 rounded-none px-2 py-1 focus:ring-0 focus:border-black cursor-pointer text-black font-medium shrink-0"
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-2">
          <Button
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-none text-xs uppercase h-10 px-4"
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</span>
          <Button
            variant="outline"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-none text-xs uppercase h-10 px-4"
          >
            Next
          </Button>
        </div>
      )}

      {/* DETAILED ORDER MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setSelectedOrder(null)}
          />
          
          <div className="relative bg-white border border-neutral-200 shadow-2xl p-6 sm:p-8 max-w-2xl w-full mx-4 rounded-none z-10 animate-in fade-in zoom-in-95 duration-250 max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-150 mb-6">
              <div>
                <span className="text-xs font-mono text-muted-foreground uppercase">Order Summary</span>
                <h3 className="font-heading font-semibold text-lg sm:text-xl text-black uppercase tracking-wide mt-0.5">
                  Order #{selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-neutral-400 hover:text-black cursor-pointer transition-colors p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-neutral-100">
              {/* Left Column: Order Stats */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <ShoppingBag className="w-3.5 h-3.5" /> Order Specifications
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-neutral-50">
                    <span className="text-neutral-400 uppercase">Status</span>
                    <span className={`font-semibold px-2 py-0.5 border ${
                      selectedOrder.orderStatus === "DISPATCHED"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : selectedOrder.orderStatus === "ORDERED"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : selectedOrder.orderStatus === "CANCELLED" || selectedOrder.orderStatus === "FAILED"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {selectedOrder.orderStatus}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-50">
                    <span className="text-neutral-400 uppercase">Placed Date</span>
                    <span className="font-semibold text-black">
                      {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleString() : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-50 font-mono">
                    <span className="text-neutral-400 uppercase">Price Summary</span>
                    <span className="font-bold text-black text-sm">₹{selectedOrder.totalPrice}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-neutral-400 uppercase">Total Items</span>
                    <span className="font-semibold text-black">{selectedOrder.numberOfItems} items</span>
                  </div>
                </div>

                {/* Edit Status in Modal */}
                <div className="pt-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">Update Pipeline Status</label>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    disabled={updateStatusMutation.isPending}
                    className="text-xs bg-neutral-50 border border-neutral-200 rounded-none w-full h-10 px-3 focus:outline-none focus:border-black cursor-pointer text-black font-semibold"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Column: User Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Customer Identity
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-neutral-50">
                    <span className="text-neutral-400 uppercase">User ID</span>
                    <span className="font-mono font-semibold text-black">#{selectedOrder.user?.id || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-50">
                    <span className="text-neutral-400 uppercase">Full Name</span>
                    <span className="font-semibold text-black">{selectedOrder.user?.name || "Anonymous"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-50">
                    <span className="text-neutral-400 uppercase">Username / Email</span>
                    <span className="font-mono font-semibold text-black">{selectedOrder.user?.userName || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-neutral-400 uppercase">Phone Number</span>
                    <span className="font-semibold text-black">{selectedOrder.user?.phoneNumber || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Delivery Address & Items */}
            <div className="space-y-6 pt-6">
              {/* Delivery Address */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> Shipping Address Snapshot
                </h4>
                {selectedOrder.shippingAddress ? (
                  <div className="bg-neutral-50 border border-neutral-150 p-4 text-xs space-y-1">
                    <p className="font-semibold text-black uppercase tracking-wide">
                      {selectedOrder.shippingAddress.doorNumber ? `${selectedOrder.shippingAddress.doorNumber}, ` : ""}{selectedOrder.shippingAddress.street}
                    </p>
                    <p className="text-neutral-600 font-medium">
                      {selectedOrder.shippingAddress.city}
                      {selectedOrder.shippingAddress.district ? `, ${selectedOrder.shippingAddress.district}` : ""}
                      {`, ${selectedOrder.shippingAddress.state}`}
                    </p>
                    <p className="text-neutral-600 font-medium font-mono mt-1">
                      PIN Code: {selectedOrder.shippingAddress.pinCode}
                    </p>
                  </div>
                ) : (
                  <div className="text-xs text-neutral-400 bg-neutral-50 p-4 border border-dashed border-neutral-200">
                    No shipping address linked to this order.
                  </div>
                )}
              </div>

              {/* Items Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Order Items Breakdown</h4>
                <div className="border border-neutral-100 max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 text-neutral-500 uppercase font-medium border-b border-neutral-100 text-[10px]">
                        <th className="p-3">Product</th>
                        <th className="p-3 w-16 text-center">Qty</th>
                        <th className="p-3 w-28 text-right">Unit Price</th>
                        <th className="p-3 w-28 text-right">Total Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {selectedOrder.orderItems?.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-3 font-semibold text-neutral-800">{item.product?.name || "Product"}</td>
                          <td className="p-3 text-center font-bold">{item.quantity}</td>
                          <td className="p-3 text-right font-mono">₹{item.price}</td>
                          <td className="p-3 text-right font-mono font-semibold">₹{item.price * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-neutral-100">
              {selectedOrder.orderStatus !== "REFUNDED" && (
                <Button
                  onClick={() => handleRefundClick(selectedOrder.id)}
                  disabled={refundMutation.isPending}
                  className="rounded-none bg-amber-600 hover:bg-amber-700 text-white text-xs tracking-wider uppercase px-6 h-11 font-semibold cursor-pointer disabled:opacity-50"
                >
                  {refundMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
                  Refund Order
                </Button>
              )}
              <Button
                onClick={() => handleDeleteOrderClick(selectedOrder.id)}
                disabled={deleteOrderMutation.isPending}
                className="rounded-none bg-red-600 hover:bg-red-700 text-white text-xs tracking-wider uppercase px-6 h-11 font-semibold cursor-pointer disabled:opacity-50"
              >
                {deleteOrderMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
                Delete Order
              </Button>
              <Button
                onClick={() => setSelectedOrder(null)}
                className="rounded-none bg-black text-white hover:bg-neutral-800 text-xs tracking-wider uppercase px-6 h-11 font-semibold cursor-pointer"
              >
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        isDestructive={confirmModal.isDestructive}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
