"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { orderService } from "@/services/orderService";
import { addressService, AddressDTO } from "@/services/addressService";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  User, 
  Package, 
  MapPin, 
  Loader2, 
  Edit2, 
  Trash2, 
  Plus, 
  Check, 
  MapPinOff 
} from "lucide-react";
import ConfirmModal from "@/components/shared/ConfirmModal";

type TabType = "profile" | "orders" | "addresses";

const addressFormSchema = z.object({
  doorNumber: z.string().optional(),
  street: z.string().min(5, "Street address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  district: z.string().optional(),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().length(6, "Postal code must be exactly 6 digits"),
  country: z.string().min(2, "Country is required"),
  isDefault: z.boolean().optional(),
});

type AddressFormValues = z.infer<typeof addressFormSchema>;

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const handleSignOut = () => {
    logout();
    router.push("/");
  };

  // Queries
  const { data: orders, isLoading: isOrdersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: orderService.getMyOrders,
    enabled: activeTab === "orders",
  });

  const { data: addresses, isLoading: isAddressesLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: addressService.getMyAddresses,
    enabled: activeTab === "addresses",
  });

  // react-hook-form setup
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      doorNumber: "",
      street: "",
      city: "",
      district: "",
      state: "",
      postalCode: "",
      country: "India",
      isDefault: false,
    },
  });

  // Cancel Order Mutation
  const cancelOrderMutation = useMutation({
    mutationFn: orderService.cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || err?.message || "Failed to cancel order");
    }
  });

  const handleCancelOrder = (orderId: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Cancel Order",
      message: "Are you sure you want to cancel this order?",
      confirmText: "Cancel Order",
      cancelText: "Keep Order",
      isDestructive: true,
      onConfirm: () => {
        cancelOrderMutation.mutate(orderId);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };



  // Address Mutations
  const addAddressMutation = useMutation({
    mutationFn: addressService.addAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      resetAddressForm();
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AddressDTO }) => 
      addressService.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      resetAddressForm();
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: addressService.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  const setDefaultAddressMutation = useMutation({
    mutationFn: addressService.setDefaultAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setShowAddressForm(false);
    reset({
      doorNumber: "",
      street: "",
      city: "",
      district: "",
      state: "",
      postalCode: "",
      country: "India",
      isDefault: false,
    });
  };

  const handleEditAddressClick = (addr: AddressDTO) => {
    setEditingAddressId(addr.id || null);
    setShowAddressForm(true);
    setValue("doorNumber", addr.doorNumber || "");
    setValue("street", addr.street);
    setValue("city", addr.city);
    setValue("district", addr.district || "");
    setValue("state", addr.state);
    setValue("postalCode", addr.postalCode);
    setValue("country", addr.country || "India");
    setValue("isDefault", addr.isDefault || false);
  };

  const handleDeleteAddress = (addressId: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Address",
      message: "Are you sure you want to delete this address from your profile?",
      isDestructive: true,
      onConfirm: () => {
        deleteAddressMutation.mutate(addressId);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleSetDefaultAddress = (addressId: number) => {
    setDefaultAddressMutation.mutate(addressId);
  };

  const onAddressFormSubmit = (data: AddressFormValues) => {
    if (editingAddressId !== null) {
      updateAddressMutation.mutate({ id: editingAddressId, data });
    } else {
      addAddressMutation.mutate(data);
    }
  };

  const tabs = [
    { id: "orders", label: "Order History", icon: Package },
    { id: "addresses", label: "Address Book", icon: MapPin },
    { id: "profile", label: "Account Info", icon: User },
  ];

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-150 pb-8 mb-12">
          <div>
            <h1 className="text-4xl font-heading font-medium tracking-tight text-foreground">
              My Account
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user?.name || "Customer"}. Manage your orders and profile.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="rounded-none border-gray-250 text-sm tracking-wider uppercase mt-4 md:mt-0 cursor-pointer"
          >
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Navigation Sidebar */}
          <aside className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center space-x-3 px-6 py-4 text-sm font-medium transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-gray-50 text-black border-l-2 border-black"
                      : "text-muted-foreground hover:text-black hover:bg-gray-50/50"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Main Panel Content */}
          <div className="lg:col-span-3">
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-heading font-medium mb-6">Your Orders</h2>
                
                {isOrdersLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full rounded-none" />
                    <Skeleton className="h-32 w-full rounded-none" />
                  </div>
                ) : !orders || orders.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50/50 border border-dashed border-gray-200">
                    <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-150 p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4">
                          <div>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">Order ID</p>
                            <p className="font-mono font-medium text-sm">#{order.id}</p>
                          </div>
                          <div className="mt-2 sm:mt-0">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">Date</p>
                            <p className="text-sm font-medium">
                              {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "N/A"}
                            </p>
                          </div>
                          <div className="mt-2 sm:mt-0">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">Status</p>
                            <span className={`inline-block text-xs uppercase tracking-widest font-semibold px-2.5 py-0.5 mt-1 border ${
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
                          </div>
                          <div className="mt-2 sm:mt-0 font-mono font-semibold text-base text-black">
                            ₹{order.totalPrice}
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="divide-y divide-gray-100">
                          {order.orderItems?.map((item, idx) => (
                            <div key={idx} className="py-3.5 flex justify-between text-sm items-center">
                              <div className="flex items-center gap-3">
                                <div className="space-y-0.5">
                                  <p className="font-heading font-medium text-gray-800">{item.product?.name || "Product"}</p>
                                  <p className="text-xs text-muted-foreground font-mono">₹{item.price} each</p>
                                </div>
                              </div>
                              <span className="font-mono font-medium text-neutral-800">
                                x{item.quantity} · ₹{item.price * item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Actions */}
                        {order.orderStatus === "PENDING" && (
                          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                            <Button
                              variant="outline"
                              onClick={() => handleCancelOrder(order.id)}
                              className="rounded-none border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 text-xs tracking-wider uppercase h-10 px-5 cursor-pointer transition-colors"
                              disabled={cancelOrderMutation.isPending}
                            >
                              {cancelOrderMutation.isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                "Cancel Order"
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-heading font-medium">Saved Addresses</h2>
                  {!showAddressForm && (
                    <Button 
                      onClick={() => setShowAddressForm(true)}
                      className="rounded-none bg-black text-white hover:bg-neutral-800 text-xs uppercase tracking-wider font-semibold h-11 px-5 flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Add Address
                    </Button>
                  )}
                </div>

                {/* Add / Edit Address Form */}
                {showAddressForm && (
                  <form onSubmit={handleSubmit(onAddressFormSubmit)} className="bg-neutral-50 border border-gray-200 p-6 space-y-6 animate-in fade-in-50 duration-200">
                    <h3 className="text-sm font-semibold uppercase tracking-wider border-b border-gray-250 pb-2">
                      {editingAddressId ? "Edit Address Details" : "Add New Delivery Address"}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Door Number */}
                      <div className="space-y-1.5">
                        <Label htmlFor="doorNumber" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                          Door / Flat Number
                        </Label>
                        <Input 
                          id="doorNumber" 
                          placeholder="e.g. Flat 3B, Apex Villa"
                          className="rounded-none border-gray-300 bg-white h-11 focus:border-black" 
                          {...register("doorNumber")} 
                        />
                      </div>

                      {/* Street Address */}
                      <div className="space-y-1.5">
                        <Label htmlFor="street" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                          Street / Area Name *
                        </Label>
                        <Input 
                          id="street" 
                          placeholder="e.g. 12th Main Road, Sector 4"
                          className="rounded-none border-gray-300 bg-white h-11 focus:border-black" 
                          {...register("street")} 
                        />
                        {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
                      </div>

                      {/* City */}
                      <div className="space-y-1.5">
                        <Label htmlFor="city" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                          City / Town *
                        </Label>
                        <Input 
                          id="city" 
                          className="rounded-none border-gray-300 bg-white h-11 focus:border-black" 
                          {...register("city")} 
                        />
                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                      </div>

                      {/* District */}
                      <div className="space-y-1.5">
                        <Label htmlFor="district" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                          District
                        </Label>
                        <Input 
                          id="district" 
                          className="rounded-none border-gray-300 bg-white h-11 focus:border-black" 
                          {...register("district")} 
                        />
                      </div>

                      {/* State */}
                      <div className="space-y-1.5">
                        <Label htmlFor="state" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                          State *
                        </Label>
                        <Input 
                          id="state" 
                          className="rounded-none border-gray-300 bg-white h-11 focus:border-black" 
                          {...register("state")} 
                        />
                        {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                      </div>

                      {/* PIN Code */}
                      <div className="space-y-1.5">
                        <Label htmlFor="postalCode" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                          PIN Code (6 digits) *
                        </Label>
                        <Input 
                          id="postalCode" 
                          maxLength={6}
                          placeholder="600001"
                          className="rounded-none border-gray-300 bg-white h-11 font-mono focus:border-black" 
                          {...register("postalCode")} 
                        />
                        {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>}
                      </div>

                      {/* Country */}
                      <div className="space-y-1.5">
                        <Label htmlFor="country" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                          Country *
                        </Label>
                        <Input 
                          id="country" 
                          className="rounded-none border-gray-300 bg-white h-11 focus:border-black" 
                          {...register("country")} 
                        />
                        {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                      </div>

                      {/* Default Checkbox */}
                      <div className="flex items-center gap-3 pt-6">
                        <input
                          id="isDefault"
                          type="checkbox"
                          className="w-4 h-4 rounded-none accent-black cursor-pointer"
                          {...register("isDefault")}
                        />
                        <Label htmlFor="isDefault" className="text-xs uppercase tracking-wider text-gray-800 font-semibold cursor-pointer select-none">
                          Set as Default Billing/Shipping address
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetAddressForm}
                        className="rounded-none border-gray-300 text-xs uppercase tracking-wider h-11 px-5 cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={addAddressMutation.isPending || updateAddressMutation.isPending}
                        className="rounded-none bg-black text-white hover:bg-neutral-800 text-xs uppercase tracking-wider font-semibold h-11 px-6 cursor-pointer flex items-center gap-2"
                      >
                        {(addAddressMutation.isPending || updateAddressMutation.isPending) && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        )}
                        {editingAddressId ? "Save Changes" : "Save Address"}
                      </Button>
                    </div>
                  </form>
                )}

                {isAddressesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-40 w-full rounded-none" />
                    <Skeleton className="h-40 w-full rounded-none" />
                  </div>
                ) : !addresses || addresses.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50/50 border border-dashed border-gray-200">
                    <MapPinOff className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">No addresses saved yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((addr) => (
                      <div 
                        key={addr.id} 
                        className={`border p-6 flex flex-col justify-between relative transition-all ${
                          addr.isDefault 
                            ? "border-black bg-white shadow-2xs" 
                            : "border-gray-200 bg-white hover:border-gray-400"
                        }`}
                      >
                        <div>
                          {addr.isDefault && (
                            <span className="absolute top-6 right-6 bg-black text-white text-[9px] uppercase tracking-widest px-2.5 py-1 font-semibold">
                              Default Address
                            </span>
                          )}
                          <p className="font-heading font-semibold text-neutral-800 text-sm mb-1 uppercase tracking-wider">
                            {addr.doorNumber ? `${addr.doorNumber}, ` : ""}{addr.street}
                          </p>
                          <p className="text-xs text-neutral-500 font-medium">
                            {addr.city}{addr.district ? `, ${addr.district}` : ""}, {addr.state}
                          </p>
                          <p className="text-xs text-neutral-500 font-medium mt-0.5">
                            PIN Code: <strong className="font-mono">{addr.postalCode}</strong>
                          </p>
                          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mt-2">
                            {addr.country || "India"}
                          </p>
                        </div>

                        {/* Card Action Controls */}
                        <div className="flex items-center justify-between pt-5 mt-5 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditAddressClick(addr)}
                              className="text-xs text-neutral-400 hover:text-black font-semibold flex items-center gap-1 cursor-pointer transition-colors p-1"
                              title="Edit address"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id!)}
                              className="text-xs text-neutral-400 hover:text-red-600 font-semibold flex items-center gap-1 cursor-pointer transition-colors p-1"
                              title="Delete address"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                          
                          {!addr.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(addr.id!)}
                              className="text-[11px] font-bold text-black hover:underline uppercase tracking-wide cursor-pointer p-1"
                            >
                              Set as Default
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-8 max-w-lg animate-in fade-in-50 duration-250">
                <h2 className="text-2xl font-heading font-medium">Account Details</h2>
                
                <div className="space-y-6 text-sm">
                  <div className="grid grid-cols-3 py-4 border-b border-gray-100">
                    <span className="text-muted-foreground uppercase tracking-wider text-xs font-semibold">Name</span>
                    <span className="col-span-2 font-medium text-foreground">{user?.name || "N/A"}</span>
                  </div>
                  <div className="grid grid-cols-3 py-4 border-b border-gray-100">
                    <span className="text-muted-foreground uppercase tracking-wider text-xs font-semibold">Email</span>
                    <span className="col-span-2 font-medium text-foreground">{user?.userName || "N/A"}</span>
                  </div>
                  <div className="grid grid-cols-3 py-4 border-b border-gray-100">
                    <span className="text-muted-foreground uppercase tracking-wider text-xs font-semibold">Phone</span>
                    <span className="col-span-2 font-medium text-foreground">{user?.phoneNumber || "N/A"}</span>
                  </div>
                  <div className="grid grid-cols-3 py-4 border-b border-gray-100">
                    <span className="text-muted-foreground uppercase tracking-wider text-xs font-semibold">Role Privilege</span>
                    <span className="col-span-2 font-mono text-xs font-bold text-black uppercase tracking-wider">
                      {user?.role || "USER"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        isDestructive={confirmModal.isDestructive}
      />
    </div>
  );
}
