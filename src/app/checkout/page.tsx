"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addressService, AddressDTO } from "@/services/addressService";
import { orderService } from "@/services/orderService";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Plus, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const addressSchema = z.object({
  doorNumber: z.string().optional(),
  street: z.string().min(5, "Street address must be at least 5 characters"),
  district: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().length(6, "Postal code must be 6 digits"),
  country: z.string().min(2, "Country is required"),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { cart, clearCart } = useCartStore();
  
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "India" },
  });

  // Query addresses
  const { data: addresses, isLoading: isAddressesLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: addressService.getMyAddresses,
  });

  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddr = addresses.find((addr) => addr.isDefault);
      if (defaultAddr && defaultAddr.id) {
        setSelectedAddressId(defaultAddr.id);
      } else if (addresses[0].id) {
        setSelectedAddressId(addresses[0].id);
      }
    }
  }, [addresses]);

  // Add Address Mutation
  const addAddressMutation = useMutation({
    mutationFn: addressService.addAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setShowNewAddressForm(false);
      reset({ country: "India" });
    },
    onError: (error: any) => {
      console.error("Failed to add address:", error);
      alert(`Failed to save address: ${error?.response?.data?.message || error.message}`);
    }
  });

  const handleAddAddress = (data: AddressFormValues) => {
    addAddressMutation.mutate(data);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) return;
    setIsProcessingPayment(true);
    try {
      // 1. Place order
      const order = await orderService.placeOrder(selectedAddressId);
      
      // 2. Create Payment
      const paymentInfo = await orderService.createPayment(order.id);

      // 3. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_RAZORPAY_KEY_ID) || "rzp_live_TUljEIHmqWOw13",
        amount: paymentInfo.amount,
        currency: "INR",
        name: "DHANYA FACTORY OUTLET",
        description: `Payment for Order #${order.id}`,
        order_id: paymentInfo.razorpayOrderId,
        handler: async (response: any) => {
          try {
            // 4. Verify Payment
            await orderService.verifyPayment({
              razorpayOrderId: paymentInfo.razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            clearCart();
            router.push(`/checkout/success?orderId=${order.id}`);
          } catch (err) {
            router.push("/checkout/failed");
          }
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
          }
        }
      };

      // If Razorpay SDK is loaded
      if ((window as any).Razorpay) {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        console.error("Razorpay SDK failed to load.");
        alert("Unable to start payment. Please try again.");
        setIsProcessingPayment(false);
      }
    } catch (err) {
      console.error(err);
      setIsProcessingPayment(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-6 py-32 text-center">
        <h2 className="text-2xl font-heading mb-4">No Items for Checkout</h2>
        <Link href="/products" className="text-sm font-medium hover:text-[var(--color-destructive)] border-b border-black pb-0.5">
          Go Shop Products
        </Link>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      
      <main className="bg-white min-h-screen py-16">
        <div className="container mx-auto px-6 max-w-5xl">
          <h1 className="text-4xl font-heading font-medium tracking-tight mb-12">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
            {/* Delivery Details */}
            <div className="lg:col-span-2 space-y-10">
              <div>
                <h2 className="text-xl font-heading font-medium mb-6">1. Delivery Address</h2>
                
                {isAddressesLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full rounded-none" />
                    <Skeleton className="h-20 w-full rounded-none" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses?.map((addr, idx) => (
                      <div
                        key={addr.id ?? `addr-${idx}`}
                        onClick={() => setSelectedAddressId(addr.id || null)}
                        className={`p-6 border cursor-pointer transition-all flex items-start justify-between ${
                          selectedAddressId === addr.id
                            ? "border-black bg-gray-50/50"
                            : "border-gray-200 hover:border-black"
                        }`}
                      >
                        <div className="text-sm text-gray-600 leading-relaxed">
                          <p className="font-medium text-foreground mb-1">
                            {addr.doorNumber ? `${addr.doorNumber}, ` : ""}{addr.street}
                          </p>
                          <p>{addr.city}, {addr.district ? `${addr.district}, ` : ""}{addr.state} - {addr.postalCode}</p>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mt-2">{addr.country}</p>
                        </div>
                        {selectedAddressId === addr.id && (
                          <div className="w-5 h-5 bg-black text-white flex items-center justify-center rounded-full shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    ))}

                    {!showNewAddressForm ? (
                      <Button
                        variant="outline"
                        onClick={() => setShowNewAddressForm(true)}
                        className="w-full h-14 border-dashed border-gray-300 hover:border-black rounded-none flex items-center justify-center space-x-2 text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add New Address</span>
                      </Button>
                    ) : (
                      <form onSubmit={handleSubmit(handleAddAddress)} className="p-6 border border-black space-y-4">
                        <h3 className="text-sm uppercase tracking-wider font-semibold mb-4">New Address</h3>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2 col-span-1">
                            <Label htmlFor="doorNumber" className="text-xs text-muted-foreground">Door/Flat No.</Label>
                            <Input id="doorNumber" className="rounded-none border-gray-200" {...register("doorNumber")} />
                          </div>
                          <div className="space-y-2 col-span-2">
                            <Label htmlFor="street" className="text-xs text-muted-foreground">Street Address</Label>
                            <Input id="street" className="rounded-none border-gray-200" {...register("street")} />
                            {errors.street && <p className="text-red-500 text-xs">{errors.street.message}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2 col-span-1">
                            <Label htmlFor="city" className="text-xs text-muted-foreground">City</Label>
                            <Input id="city" className="rounded-none border-gray-200" {...register("city")} />
                            {errors.city && <p className="text-red-500 text-xs">{errors.city.message}</p>}
                          </div>
                          <div className="space-y-2 col-span-1">
                            <Label htmlFor="district" className="text-xs text-muted-foreground">District</Label>
                            <Input id="district" className="rounded-none border-gray-200" {...register("district")} />
                          </div>
                          <div className="space-y-2 col-span-1">
                            <Label htmlFor="state" className="text-xs text-muted-foreground">State</Label>
                            <Input id="state" className="rounded-none border-gray-200" {...register("state")} />
                            {errors.state && <p className="text-red-500 text-xs">{errors.state.message}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="postalCode" className="text-xs text-muted-foreground">PIN Code</Label>
                            <Input id="postalCode" className="rounded-none border-gray-200" {...register("postalCode")} />
                            {errors.postalCode && <p className="text-red-500 text-xs">{errors.postalCode.message}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="country" className="text-xs text-muted-foreground">Country</Label>
                            <Input id="country" className="rounded-none border-gray-200" {...register("country")} />
                            {errors.country && <p className="text-red-500 text-xs">{errors.country.message}</p>}
                          </div>
                        </div>

                        <div className="flex space-x-3 pt-2">
                          <Button type="submit" disabled={addAddressMutation.isPending} className="rounded-none bg-black text-white hover:bg-black/90">
                            {addAddressMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setShowNewAddressForm(false)} className="rounded-none">
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Checkout side panel */}
            <div className="bg-gray-50 p-8 border border-gray-100 space-y-6">
              <h3 className="font-heading font-medium text-xl border-b border-gray-200 pb-4">
                Order Review
              </h3>

              <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="py-4 flex justify-between text-sm">
                    <span className="text-gray-600 line-clamp-1">{item.product.name} (x{item.quantity})</span>
                    <span className="font-mono ml-4 shrink-0">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-mono">₹{cart.totalPrice}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="font-mono">₹99</span>
                </div>
                <div className="flex justify-between text-foreground font-medium pt-3 border-t border-gray-200 text-base">
                  <span>Total</span>
                  <span className="font-mono flex items-center gap-2">
                    <span className="line-through text-muted-foreground text-sm font-normal">₹{cart.totalPrice + 99}</span>
                    <span>₹{cart.totalPrice}</span>
                  </span>
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={!selectedAddressId || isProcessingPayment}
                className="w-full h-14 rounded-none bg-foreground text-background hover:bg-[var(--color-destructive)] text-sm tracking-widest uppercase transition-colors"
              >
                {isProcessingPayment ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Proceed to Payment"
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
