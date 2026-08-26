"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboardService";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IndianRupee, ShoppingCart, Package, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const { data: totals, isLoading: isTotalsLoading } = useQuery({
    queryKey: ["admin-totals"],
    queryFn: dashboardService.getTotals,
  });

  const { data: recentOrders, isLoading: isOrdersLoading } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: () => dashboardService.getRecentOrders(5),
  });

  const kpis = [
    {
      label: "Total Revenue",
      value: totals ? `₹${totals.totalRevenue}` : "₹0",
      icon: IndianRupee,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Total Orders",
      value: totals?.totalOrders || 0,
      icon: ShoppingCart,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Total Products",
      value: totals?.totalProducts || 0,
      icon: Package,
      color: "bg-amber-50 text-amber-700",
    },
    {
      label: "Pending Orders",
      value: totals?.pendingOrders || 0,
      icon: AlertCircle,
      color: "bg-rose-50 text-rose-700",
    },
  ];

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Editorial Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-medium tracking-tight">Overview</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">Real-time sales, inventory metrics, and recent activity overview.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="border-gray-200/60 rounded-none shadow-none bg-white">
              <CardContent className="p-5 sm:p-6 flex items-center justify-between">
                <div className="space-y-1.5 sm:space-y-2">
                  <p className="text-[11px] sm:text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    {kpi.label}
                  </p>
                  {isTotalsLoading ? (
                    <Skeleton className="h-7 sm:h-8 w-24" />
                  ) : (
                    <p className="text-2xl sm:text-3xl font-mono font-medium text-foreground">
                      {kpi.value}
                    </p>
                  )}
                </div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-none shrink-0 ${kpi.color}`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders Section */}
      <div>
        <h3 className="font-heading font-medium text-lg sm:text-xl mb-4 sm:mb-6">Recent Orders</h3>
        <div className="bg-white border border-gray-150 overflow-hidden shadow-2xs">
          {isOrdersLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : !recentOrders || recentOrders.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No orders have been placed yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-150 bg-gray-50 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    <th className="p-3 sm:p-4">Order ID</th>
                    <th className="p-3 sm:p-4">Date</th>
                    <th className="p-3 sm:p-4">Status</th>
                    <th className="p-3 sm:p-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-3 sm:p-4 font-mono font-medium">#{order.id}</td>
                      <td className="p-3 sm:p-4">{new Date(order.orderDate).toLocaleDateString()}</td>
                      <td className="p-3 sm:p-4">
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
                      <td className="p-3 sm:p-4 text-right font-mono font-medium">₹{order.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
