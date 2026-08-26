import { api } from "@/lib/axios";
import { OrderDTO } from "./orderService";

export interface DashboardTotals {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

export const dashboardService = {
  getTotals: async () => {
    const response = await api.get<DashboardTotals>("/admin/dashboard/totals");
    return response.data;
  },

  getRecentOrders: async (limit = 5) => {
    const response = await api.get<OrderDTO[]>("/admin/dashboard/recent-orders", {
      params: { limit },
    });
    return response.data;
  },

  getTodaySales: async () => {
    const response = await api.get<number>("/admin/dashboard/sales/today");
    return response.data;
  },

  getMonthlySales: async () => {
    const response = await api.get<number>("/admin/dashboard/sales/monthly");
    return response.data;
  },
};
