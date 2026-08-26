"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal, ChevronDown, Check, X } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FilterSortBarProps {
  productsCount: number;
  priceRange: [number, number];
  setPriceRange: (val: [number, number]) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
  onClearFilters: () => void;
  sortBy: string;
  setSortBy: (val: string) => void;
}

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Alphabetically, A-Z", value: "name,asc" },
  { label: "Alphabetically, Z-A", value: "name,desc" },
  { label: "Price, low to high", value: "price,asc" },
  { label: "Price, high to low", value: "price,desc" },
];

export function FilterSortBar({
  productsCount,
  priceRange,
  setPriceRange,
  inStockOnly,
  setInStockOnly,
  onClearFilters,
  sortBy,
  setSortBy
}: FilterSortBarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ price: true, availability: true });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const currentSortLabel = SORT_OPTIONS.find(opt => opt.value === sortBy)?.label || "Featured";

  return (
    <div className="flex flex-col md:flex-row justify-between items-center py-4 border-b border-border/40 mb-8 gap-4 md:gap-0">
      {/* Left: Product count */}
      <div className="text-sm text-foreground font-medium">
        {productsCount} products
      </div>

      {/* Right: Filter & Sort Actions */}
      <div className="flex items-center gap-6">
        
        {/* Filter Drawer Trigger */}
        <Sheet>
          <SheetTrigger className="flex items-center gap-2 text-sm font-medium hover:text-[#8B6914] transition-colors group">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground group-hover:text-[#8B6914] transition-colors" />
            <span>Filter</span>
          </SheetTrigger>
          
          <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-white border-l-0">
            {/* Drawer Header */}
            <SheetHeader className="p-6 border-b border-border/40 text-left relative flex flex-row items-center justify-between">
              <SheetTitle className="text-sm font-sans tracking-[0.15em] uppercase font-medium">
                Filter
              </SheetTitle>
              {/* Note: sheet.tsx auto-injects a close button, but we can customize or let it be */}
            </SheetHeader>

            {/* Drawer Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* PRICE Section */}
              <div className="border-b border-border/30 pb-4">
                <button 
                  onClick={() => toggleSection('price')}
                  className="flex items-center justify-between w-full text-left font-sans text-xs tracking-widest uppercase font-medium"
                >
                  Price
                  <span className="text-lg font-light">{openSections['price'] ? '-' : '+'}</span>
                </button>
                
                {openSections['price'] && (
                  <div className="pt-6 pb-2 space-y-5 animate-in fade-in slide-in-from-top-2">
                    <Slider
                      defaultValue={[0, 10000]}
                      value={priceRange}
                      max={10000}
                      step={100}
                      onValueChange={(val) => setPriceRange(val as [number, number])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground font-mono">
                      <span>₹{priceRange[0]}</span>
                      <span>₹{priceRange[1]}+</span>
                    </div>
                  </div>
                )}
              </div>

              {/* AVAILABILITY Section (Replacing Color/Size for now) */}
              <div className="border-b border-border/30 pb-4">
                <button 
                  onClick={() => toggleSection('availability')}
                  className="flex items-center justify-between w-full text-left font-sans text-xs tracking-widest uppercase font-medium"
                >
                  Availability
                  <span className="text-lg font-light">{openSections['availability'] ? '-' : '+'}</span>
                </button>
                
                {openSections['availability'] && (
                  <div className="pt-6 pb-2 animate-in fade-in slide-in-from-top-2">
                    <button
                      onClick={() => setInStockOnly(!inStockOnly)}
                      className="flex items-center space-x-3 text-sm text-foreground hover:text-muted-foreground transition-colors"
                    >
                      <div className={`w-4 h-4 border flex items-center justify-center rounded-none ${inStockOnly ? "bg-black border-black text-white" : "border-gray-300"}`}>
                        {inStockOnly && <Check className="w-3 h-3" />}
                      </div>
                      <span>In Stock Only</span>
                    </button>
                  </div>
                )}
              </div>

              {/* DUMMY COLOR Section */}
              <div className="border-b border-border/30 pb-4">
                <button 
                  onClick={() => toggleSection('color')}
                  className="flex items-center justify-between w-full text-left font-sans text-xs tracking-widest uppercase font-medium"
                >
                  Color
                  <span className="text-lg font-light">{openSections['color'] ? '-' : '+'}</span>
                </button>
                {openSections['color'] && (
                  <div className="pt-4 pb-2 text-xs text-muted-foreground">
                    No color variants available for these items.
                  </div>
                )}
              </div>

              {/* DUMMY SIZE Section */}
              <div className="border-b border-border/30 pb-4">
                <button 
                  onClick={() => toggleSection('size')}
                  className="flex items-center justify-between w-full text-left font-sans text-xs tracking-widest uppercase font-medium"
                >
                  Size
                  <span className="text-lg font-light">{openSections['size'] ? '-' : '+'}</span>
                </button>
                {openSections['size'] && (
                  <div className="pt-4 pb-2 text-xs text-muted-foreground">
                    No size variants available for these items.
                  </div>
                )}
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-6 bg-white border-t border-border/20 flex flex-col gap-4">
              <SheetClose className="w-full bg-[#3B2C21] hover:bg-[#2A1F17] text-white py-3.5 text-xs tracking-[0.15em] uppercase font-medium transition-colors">
                Apply
              </SheetClose>
              <button 
                onClick={onClearFilters}
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors mx-auto"
              >
                Remove all
              </button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Separator */}
        <div className="w-[1px] h-4 bg-border/60"></div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-medium hover:text-[#8B6914] transition-colors group outline-none">
            <span className="text-muted-foreground group-hover:text-[#8B6914] transition-colors">Sort by:</span>
            <span>{currentSortLabel}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-none border-border/40 shadow-xl p-2 bg-white">
            {SORT_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className="text-sm py-2 px-3 cursor-pointer rounded-none hover:bg-gray-50 focus:bg-gray-50 focus:text-foreground flex justify-between items-center"
              >
                {opt.label}
                {sortBy === opt.value && <Check className="w-4 h-4 text-muted-foreground" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </div>
  );
}
