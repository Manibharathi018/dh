"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Trash2, ArrowLeft } from "lucide-react";
import { CartItem } from "@/types";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useCartStore();

  const getAvailableStock = (item: CartItem) => {
    if (item.product.hasDressSizes) {
      switch (item.size) {
        case "S": return item.product.sizeSQuantity || 0;
        case "M": return item.product.sizeMQuantity || 0;
        case "L": return item.product.sizeLQuantity || 0;
        case "XL": return item.product.sizeXLQuantity || 0;
        case "XXL": return item.product.sizeXXLQuantity || 0;
        default: return 0;
      }
    }
    if (item.product.hasShoeSizes) {
      switch (item.size) {
        case "7": return item.product.size7Quantity || 0;
        case "8": return item.product.size8Quantity || 0;
        case "9": return item.product.size9Quantity || 0;
        case "10": return item.product.size10Quantity || 0;
        case "11": return item.product.size11Quantity || 0;
        case "12": return item.product.size12Quantity || 0;
        case "13": return item.product.size13Quantity || 0;
        default: return 0;
      }
    }
    return item.product.quantity || 0;
  };

  const handleQtyChange = (item: CartItem, newQty: number) => {
    if (newQty < 1) return;
    const maxStock = getAvailableStock(item);
    if (newQty > maxStock) {
      alert(`Cannot exceed available stock of ${maxStock} units for this size.`);
      return;
    }
    updateQuantity(item.id, newQty);
  };

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-6 py-32 text-center max-w-md">
        <h2 className="text-3xl font-heading font-medium mb-4 text-foreground">Your Cart is Empty</h2>
        <p className="text-muted-foreground mb-8">
          It looks like you haven't added anything to your cart yet. Discover our premium collections to start shopping.
        </p>
        <Link href="/products" className="w-full inline-flex justify-center items-center h-14 bg-black text-white hover:bg-black/90 font-medium text-sm tracking-wider uppercase">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-heading font-medium tracking-tight mb-12">Shopping Bag</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-8">
            {cart.items.map((item) => (
              <div 
                key={item.id} 
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-100 pb-8 last:border-0"
              >
                {/* Product details */}
                <div className="flex items-center space-x-6">
                  <div className="relative w-24 h-32 bg-gray-50 overflow-hidden shrink-0">
                    <Image 
                      src={item.product.imageUrls?.[0] || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1620&auto=format&fit=crop"} 
                      alt={item.product.name} 
                      fill 
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">
                        {item.product.category?.name || "Apparel"}
                      </span>
                      {item.size && (
                        <span className="text-xs font-mono font-bold uppercase bg-neutral-100 px-2 py-0.5 rounded-[2px] text-neutral-800">
                          Size: {item.size}
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading font-medium text-lg text-foreground mt-1 mb-2">
                      {item.product.name}
                    </h3>
                    <span className="text-sm font-mono text-muted-foreground">₹{item.price} each</span>
                  </div>
                </div>

                {/* Actions & Price */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-6 sm:mt-0 space-y-3">
                  <div className="flex items-center border border-gray-200 h-10">
                    <button 
                      onClick={() => handleQtyChange(item, item.quantity - 1)}
                      className="px-3 text-gray-500 hover:text-black transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-medium select-none font-mono">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => handleQtyChange(item, item.quantity + 1)}
                      disabled={item.quantity >= getAvailableStock(item)}
                      className="px-3 text-gray-500 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="font-mono font-medium text-foreground">
                      ₹{item.price * item.quantity}
                    </span>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-[var(--color-destructive)] transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="bg-gray-50 p-8 border border-gray-100 space-y-6">
            <h3 className="font-heading font-medium text-xl border-b border-gray-200 pb-4">
              Order Summary
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono">₹{cart.totalPrice}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="font-mono text-emerald-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-foreground font-medium pt-4 border-t border-gray-200 text-base">
                <span>Total</span>
                <span className="font-mono">₹{cart.totalPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <Link href="/checkout" className="block w-full">
              <Button className="w-full h-14 rounded-none bg-foreground text-background hover:bg-[var(--color-destructive)] text-sm tracking-widest uppercase transition-colors">
                Proceed to Checkout
              </Button>
            </Link>

            <div className="text-center pt-4">
              <Link href="/products" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-3 h-3 mr-1" /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
