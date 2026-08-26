import { api } from "@/lib/axios";
import { Product } from "@/types";

export interface OrderItemDTO {
  product: Product;
  quantity: number;
  price: number;
}

export interface OrderDTO {
  id: number;
  orderDate: string;
  orderStatus: string;
  totalPrice: number;
  orderItems: OrderItemDTO[];
}

export interface PaymentDTO {
  id: number;
  paymentStatus: string;
  paymentMethod: string;
  razorpayOrderId: string;
  amount: number;
}

export interface PaymentVerificationRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentVerificationResponse {
  status: string;
  message: string;
}

export const orderService = {
  placeOrder: async (addressId: number) => {
    const response = await api.post<OrderDTO>(`/orders?addressId=${addressId}`);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get<OrderDTO[]>("/orders/my");
    return response.data;
  },

  getOrderById: async (id: number) => {
    const response = await api.get<OrderDTO>(`/orders/${id}`);
    return response.data;
  },

  createPayment: async (orderId: number) => {
    const response = await api.post<PaymentDTO>(`/payments?orderId=${orderId}`);
    return response.data;
  },

  verifyPayment: async (request: PaymentVerificationRequest) => {
    const response = await api.post<PaymentVerificationResponse>("/payments/verify", request);
    return response.data;
  },

  cancelOrder: async (id: number) => {
    const response = await api.put<OrderDTO>(`/orders/${id}/cancel`);
    return response.data;
  },

  getAllOrders: async (page = 0, size = 10) => {
    const response = await api.get<any>("/orders", {
      params: { page, size },
    });
    return response.data;
  },

  updateOrderStatus: async (id: number, status: string) => {
    const response = await api.put<OrderDTO>(`/orders/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },
};
