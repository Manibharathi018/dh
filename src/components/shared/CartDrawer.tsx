"use client";

import { useCartStore } from "@/store/useCartStore";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, X, ShoppingBag } from "lucide-react";
import { getCloudinaryUrl } from "@/lib/utils";

export function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart } = useCartStore();

  const handleQuantityChange = async (itemId: number, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) {
      await removeFromCart(itemId);
    } else {
      await updateQuantity(itemId, newQty);
    }
  };

  const totalItems = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent side="right" showCloseButton={false} className="w-full sm:max-w-md p-0 flex flex-col bg-white">
        <SheetHeader className="p-6 border-b border-gray-100 flex flex-row items-center justify-between">
          <SheetTitle className="text-sm font-medium tracking-[0.2em] uppercase text-foreground">
            Your Cart ({totalItems})
          </SheetTitle>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {(!cart?.items || cart.items.length === 0) ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                 <ShoppingBag className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">Your cart is empty</p>
              <Button 
                onClick={() => setIsCartOpen(false)}
                className="mt-4 bg-foreground text-background rounded-none uppercase tracking-widest text-[10px]"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-xs text-center border-b border-gray-100 pb-4 tracking-wide text-foreground">
                You have unlocked free shipping!
                <div className="w-full bg-ink h-[2px] mt-2"></div>
              </div>

              {cart.items.map((item) => {
                const discount = item.product.discountPercentage || 0;
                const finalPrice = discount > 0 ? item.product.price - (item.product.price * (discount / 100)) : item.product.price;
                const mainImg = getCloudinaryUrl(item.product.imageUrls?.[0]) || "https://images.unsplash.com/photo-1610030006630-e6f8b3e8f4d4?auto=format&fit=crop&w=600&q=80";

                return (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-[106px] relative bg-gray-50 flex-shrink-0">
                      <Image 
                        src={mainImg} 
                        alt={item.product.name} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col flex-1 justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <Link href={`/products/${item.product.id}`} onClick={() => setIsCartOpen(false)} className="text-sm text-ink hover:text-sale transition-colors line-clamp-1">
                            {item.product.name}
                          </Link>
                          <div className="flex flex-col items-end">
                             {discount > 0 && <span className="text-[10px] text-gray-400 line-through">Rs. {item.product.price.toFixed(2)}</span>}
                             <span className="text-xs text-gray-500">Rs. {finalPrice.toFixed(2)}</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Size: M</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-gray-200 h-8">
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                            className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-ink hover:bg-gray-50 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                            className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-ink hover:bg-gray-50 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-rose-500 transition-colors p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cart?.items && cart.items.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-white">
            <Link href="/cart" onClick={() => setIsCartOpen(false)} className="text-[11px] underline tracking-widest uppercase block mb-4">
              Add order note
            </Link>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs uppercase tracking-widest">Subtotal</span>
              <span className="text-lg font-medium">Rs. {(cart.totalPrice || 0).toFixed(2)}</span>
            </div>
            <p className="text-[9px] text-muted-foreground text-right mb-6">
              Taxes and shipping calculated at checkout
            </p>
            <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
              <Button className="w-full h-12 bg-white text-ink border border-gray-200 rounded-none hover:bg-gray-50 uppercase tracking-[0.2em] text-[10px]">
                Check out
              </Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
