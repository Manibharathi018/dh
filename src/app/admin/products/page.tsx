"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { categoryService, CategoryDTO } from "@/services/categoryService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmModal from "@/components/shared/ConfirmModal";
import CategoryModal from "@/components/shared/CategoryModal";
import { 
  Plus, 
  Trash2, 
  Loader2, 
  Search, 
  X, 
  Edit3, 
  Check, 
  ArrowLeft, 
  UploadCloud, 
  Sparkles, 
  Shirt, 
  Footprints, 
  Watch, 
  Layers, 
  Tag, 
  Percent, 
  Eye, 
  CheckCircle2, 
  Image as ImageIcon 
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getCloudinaryUrl } from "@/lib/utils";
import * as z from "zod";


const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  brand: z.string().optional(),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  discountPercentage: z.coerce.number().min(0).max(100),
  description: z.string().min(5, "Description must be at least 5 characters"),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative").optional(),
  categoryName: z.string().min(1, "Category is required"),
  hasDressSizes: z.boolean().optional(),
  hasShoeSizes: z.boolean().optional(),
  sizeSQuantity: z.coerce.number().min(0).optional(),
  sizeMQuantity: z.coerce.number().min(0).optional(),
  sizeLQuantity: z.coerce.number().min(0).optional(),
  sizeXLQuantity: z.coerce.number().min(0).optional(),
  sizeXXLQuantity: z.coerce.number().min(0).optional(),
  size7Quantity: z.coerce.number().min(0).optional(),
  size8Quantity: z.coerce.number().min(0).optional(),
  size9Quantity: z.coerce.number().min(0).optional(),
  size10Quantity: z.coerce.number().min(0).optional(),
  size11Quantity: z.coerce.number().min(0).optional(),
  size12Quantity: z.coerce.number().min(0).optional(),
  size13Quantity: z.coerce.number().min(0).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState<number | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Modal open states
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddSubcategoryModalOpen, setIsAddSubcategoryModalOpen] = useState(false);


  const [page, setPage] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Stock Inline Edit State
  const [editingStockId, setEditingStockId] = useState<number | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);

  // Deletion confirm modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  // Active Category Sizes & Units Breakdown Selection
  const [sizeInventory, setSizeInventory] = useState<Record<string, number>>({});
  const [isFeatured, setIsFeatured] = useState<boolean>(true);
  const [isTrending, setIsTrending] = useState<boolean>(true);
  const [isTopsJackets, setIsTopsJackets] = useState<boolean>(true);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      brand: "",
      price: 999,
      discountPercentage: 0,
      description: "",
      quantity: 10,
      categoryName: "",
      hasDressSizes: false,
      hasShoeSizes: false,
      sizeSQuantity: 0,
      sizeMQuantity: 0,
      sizeLQuantity: 0,
      sizeXLQuantity: 0,
      sizeXXLQuantity: 0,
      size7Quantity: 0,
      size8Quantity: 0,
      size9Quantity: 0,
      size10Quantity: 0,
      size11Quantity: 0,
      size12Quantity: 0,
      size13Quantity: 0,
    },
  });

  const watchPrice = watch("price") || 0;
  const watchDiscount = watch("discountPercentage") || 0;
  const watchName = watch("name") || "";
  const calculatedSellingPrice = Math.max(0, Math.round(watchPrice * (1 - watchDiscount / 100)));
  const calculatedSavings = Math.max(0, Math.round(watchPrice - calculatedSellingPrice));

  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ["admin-products", page],
    queryFn: () => productService.getAllProducts(page, 100),
  });

  const { data: categories = [] as CategoryDTO[] } = useQuery<CategoryDTO[]>({
    queryKey: ["admin-categories-list"],
    queryFn: categoryService.getAllCategories,
  });



  // Sync selected categories into react-hook-form value "categoryName"
  useEffect(() => {
    const parent = categories?.find(c => c.id === selectedParentCategoryId);
    const sub = categories?.find(c => c.id === selectedSubcategoryId);
    const targetName = sub?.name || parent?.name || "";
    setValue("categoryName", targetName);
  }, [selectedParentCategoryId, selectedSubcategoryId, categories, setValue]);

  // Handle local file uploads with preview generation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setSelectedFiles((prev) => [...prev, ...files]);
    
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const addProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      let imageUrlStr = "";
      
      if (selectedFiles.length > 0) {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dq41e3dn1";
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ecommerce";
        
        const uploadPromises = selectedFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", uploadPreset);
          
          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData,
          });
          
          const data = await res.json();
          if (data.secure_url) {
            return data.secure_url;
          }
          throw new Error(data.error?.message || "Failed to upload image to Cloudinary");
        });
        
        const urls = await Promise.all(uploadPromises);
        imageUrlStr = urls.join(",");
      }

      productData.images = imageUrlStr;
      const product = await productService.createProduct(productData);
      return product;
    },
    onSuccess: (newProd) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-inventory-products"] });
      queryClient.invalidateQueries({ queryKey: ["products-category"] });
      setShowAddForm(false);
      setEditingProduct(null);
      reset();
      setSelectedFiles([]);
      setFilePreviews([]);
      setSizeInventory({});
      setIsFeatured(false);
      setIsTrending(false);
      setIsTopsJackets(false);
      setSelectedParentCategoryId(null);
      setSelectedSubcategoryId(null);
      setToast({ type: "success", message: `Product "${newProd?.name || "Product"}" added successfully!` });
    },
    onError: (err: any) => {
      const msg = err?.message || err?.response?.data?.message || "Failed to add product. Please try again.";
      setToast({ type: "error", message: msg });
    },
  });

  // Update Product / Stock Mutation
  const updateProductMutation = useMutation({
    mutationFn: async (updatedProduct: any) => {
      let imageUrlStr = updatedProduct.images || "";
      if (selectedFiles.length > 0) {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dq41e3dn1";
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ecommerce";

        const uploadPromises = selectedFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", uploadPreset);

          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          if (data.secure_url) {
            return data.secure_url;
          }
          throw new Error(data.error?.message || "Failed to upload image to Cloudinary");
        });

        const urls = await Promise.all(uploadPromises);
        imageUrlStr = urls.join(",");
      }

      updatedProduct.images = imageUrlStr;
      return await productService.updateProduct(updatedProduct);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-inventory-products"] });
      queryClient.invalidateQueries({ queryKey: ["products-category"] });
      setShowAddForm(false);
      setEditingProduct(null);
      reset();
      setSelectedFiles([]);
      setFilePreviews([]);
      setSelectedParentCategoryId(null);
      setSelectedSubcategoryId(null);
      setEditingStockId(null);
      setToast({
        type: "success",
        message: `Product "${data?.name || "Product"}" updated successfully!`,
      });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || "Failed to update product.";
      setToast({ type: "error", message: msg });
    },
  });

  // Persistent list of deleted/deactivated product IDs
  const [deletedIds, setDeletedIds] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("dhanya_deleted_product_ids");
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await productService.deleteProduct(id);
      return id;
    },
    onSuccess: (deletedId) => {
      setDeletedIds((prev) => {
        const next = Array.from(new Set([...prev, deletedId]));
        if (typeof window !== "undefined") {
          localStorage.setItem("dhanya_deleted_product_ids", JSON.stringify(next));
        }
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-inventory-products"] });
      queryClient.invalidateQueries({ queryKey: ["products-category"] });
      setToast({ type: "success", message: "Product removed from catalog successfully." });
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || "Failed to delete product.";
      setToast({ type: "error", message: msg });
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    },
  });

  const handleAddProductSubmit = (data: ProductFormValues) => {
    let desc = (data.description || "Premium collection piece.").trim();
    let finalQty = Number(data.quantity || 0);
    if (data.hasDressSizes) {
      finalQty = Number(data.sizeSQuantity || 0) +
                 Number(data.sizeMQuantity || 0) +
                 Number(data.sizeLQuantity || 0) +
                 Number(data.sizeXLQuantity || 0) +
                 Number(data.sizeXXLQuantity || 0);
    } else if (data.hasShoeSizes) {
      finalQty = Number(data.size7Quantity || 0) +
                 Number(data.size8Quantity || 0) +
                 Number(data.size9Quantity || 0) +
                 Number(data.size10Quantity || 0) +
                 Number(data.size11Quantity || 0) +
                 Number(data.size12Quantity || 0) +
                 Number(data.size13Quantity || 0);
    }

    const payload = {
      name: data.name?.trim(),
      brand: data.brand?.trim(),
      price: Number(data.price),
      discountPercentage: Number(data.discountPercentage || 0),
      description: desc,
      quantity: finalQty,
      categoryName: data.categoryName,
      hasDressSizes: Boolean(data.hasDressSizes),
      hasShoeSizes: Boolean(data.hasShoeSizes),
      sizeSQuantity: data.hasDressSizes ? Number(data.sizeSQuantity || 0) : 0,
      sizeMQuantity: data.hasDressSizes ? Number(data.sizeMQuantity || 0) : 0,
      sizeLQuantity: data.hasDressSizes ? Number(data.sizeLQuantity || 0) : 0,
      sizeXLQuantity: data.hasDressSizes ? Number(data.sizeXLQuantity || 0) : 0,
      sizeXXLQuantity: data.hasDressSizes ? Number(data.sizeXXLQuantity || 0) : 0,
      size7Quantity: data.hasShoeSizes ? Number(data.size7Quantity || 0) : 0,
      size8Quantity: data.hasShoeSizes ? Number(data.size8Quantity || 0) : 0,
      size9Quantity: data.hasShoeSizes ? Number(data.size9Quantity || 0) : 0,
      size10Quantity: data.hasShoeSizes ? Number(data.size10Quantity || 0) : 0,
      size11Quantity: data.hasShoeSizes ? Number(data.size11Quantity || 0) : 0,
      size12Quantity: data.hasShoeSizes ? Number(data.size12Quantity || 0) : 0,
      size13Quantity: data.hasShoeSizes ? Number(data.size13Quantity || 0) : 0,
    };

    if (editingProduct) {
      updateProductMutation.mutate({
        ...payload,
        id: editingProduct.id,
        isActive: editingProduct.isActive,
        featured: Boolean(isFeatured || isTopsJackets),
        images: editingProduct.images,
      });
    } else {
      addProductMutation.mutate({
        ...payload,
        isActive: true,
        featured: Boolean(isFeatured || isTopsJackets),
      });
    }
  };

  const handleSaveStock = (product: any, newQuantity: number) => {
    updateProductMutation.mutate({
      ...product,
      id: product.id,
      quantity: Number(newQuantity),
      categoryName: product.category?.name || product.categoryName || "Apparel",
    });
  };

  const handleDeleteProduct = (id: number) => {
    setProductToDelete(id);
    setDeleteConfirmOpen(true);
  };

  // Filter out deactivated or deleted products
  const rawProducts = (productsData?.content || []).filter(
    (p) => p.isActive !== false && !deletedIds.includes(p.id)
  );

  // Search filter
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchCleanId = normalizedQuery.replace(/^#/, "");

  const filteredProducts = rawProducts.filter((product) => {
    if (!normalizedQuery) return true;
    const idMatch = String(product.id) === searchCleanId || String(product.id).includes(searchCleanId);
    const nameMatch = product.name?.toLowerCase().includes(normalizedQuery);
    const brandMatch = (product.brand?.toLowerCase() || "dfo").includes(normalizedQuery);
    const categoryMatch = product.category?.name?.toLowerCase().includes(normalizedQuery);
    const descMatch = product.description?.toLowerCase().includes(normalizedQuery);
    return idMatch || nameMatch || brandMatch || categoryMatch || descMatch;
  });

  const suggestionProducts = normalizedQuery
    ? rawProducts
        .filter((p) => {
          const idMatch = String(p.id) === searchCleanId || String(p.id).includes(searchCleanId);
          const nameMatch = p.name?.toLowerCase().includes(normalizedQuery);
          const brandMatch = (p.brand?.toLowerCase() || "dfo").includes(normalizedQuery);
          const categoryMatch = p.category?.name?.toLowerCase().includes(normalizedQuery);
          return idMatch || nameMatch || brandMatch || categoryMatch;
        })
        .slice(0, 6)
    : [];

  const mainCategories = categories?.filter(c => !c.parentId) || [];
  const subcategories = selectedParentCategoryId
    ? categories?.filter(c => c.parentId === selectedParentCategoryId) || []
    : [];

  const handleOpenAddForm = () => {
    setEditingProduct(null);
    setShowAddForm(true);
    setSelectedParentCategoryId(null);
    setSelectedSubcategoryId(null);
    reset({
      name: "",
      brand: "",
      price: 999,
      discountPercentage: 0,
      description: "",
      quantity: 10,
      categoryName: "",
      hasDressSizes: false,
      hasShoeSizes: false,
      sizeSQuantity: 0,
      sizeMQuantity: 0,
      sizeLQuantity: 0,
      sizeXLQuantity: 0,
      sizeXXLQuantity: 0,
      size7Quantity: 0,
      size8Quantity: 0,
      size9Quantity: 0,
      size10Quantity: 0,
      size11Quantity: 0,
      size12Quantity: 0,
      size13Quantity: 0,
    });
    setSelectedFiles([]);
    setFilePreviews([]);
    setIsFeatured(false);
    setIsTrending(false);
    setIsTopsJackets(false);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setShowAddForm(true);
    
    // Resolve category parent & subcategory IDs
    const cat = categories?.find(c => c.name?.toLowerCase() === product.category?.name?.toLowerCase() || c.name?.toLowerCase() === product.categoryName?.toLowerCase());
    if (cat) {
      if (cat.parentId) {
        setSelectedParentCategoryId(cat.parentId || null);
        setSelectedSubcategoryId(cat.id || null);
      } else {
        setSelectedParentCategoryId(cat.id || null);
        setSelectedSubcategoryId(null);
      }
    } else {
      setSelectedParentCategoryId(null);
      setSelectedSubcategoryId(null);
    }

    reset({
      name: product.name,
      brand: product.brand || "",
      price: product.price,
      discountPercentage: product.discountPercentage || 0,
      description: product.description || "",
      quantity: product.quantity,
      categoryName: product.category?.name || product.categoryName || "",
      hasDressSizes: product.hasDressSizes || false,
      hasShoeSizes: product.hasShoeSizes || false,
      sizeSQuantity: product.sizeSQuantity || 0,
      sizeMQuantity: product.sizeMQuantity || 0,
      sizeLQuantity: product.sizeLQuantity || 0,
      sizeXLQuantity: product.sizeXLQuantity || 0,
      sizeXXLQuantity: product.sizeXXLQuantity || 0,
      size7Quantity: product.size7Quantity || 0,
      size8Quantity: product.size8Quantity || 0,
      size9Quantity: product.size9Quantity || 0,
      size10Quantity: product.size10Quantity || 0,
      size11Quantity: product.size11Quantity || 0,
      size12Quantity: product.size12Quantity || 0,
      size13Quantity: product.size13Quantity || 0,
    });
    
    // Pre-populate image previews if images exist
    if (product.images) {
      setFilePreviews(product.images.split(",").filter(Boolean));
    } else {
      setFilePreviews([]);
    }

    setIsFeatured(product.featured || false);
    setIsTrending(product.featured || false);
    setIsTopsJackets(product.featured || false);
  };

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

      {/* Header with Search and Add Product Button */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-medium tracking-tight">Products</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Manage catalog collections, category-specific releases, stock quantities, and prices.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Search Bar */}
          <div ref={searchContainerRef} className="relative flex-1 sm:w-80 md:w-96">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search by name, brand, or #ID..."
                className="w-full h-11 sm:h-12 pl-10 pr-9 border border-gray-200 focus:border-black bg-white rounded-none text-xs sm:text-sm outline-none transition-colors placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-gray-400 hover:text-black transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Suggestions Popover */}
            {isSearchFocused && normalizedQuery && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 shadow-2xl z-50 max-h-[380px] overflow-y-auto divide-y divide-gray-100">
                <div className="p-2.5 bg-gray-50 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase flex items-center justify-between">
                  <span>Product Suggestions ({suggestionProducts.length})</span>
                  <span className="text-[10px] lowercase font-normal">press enter or click</span>
                </div>

                {suggestionProducts.length === 0 ? (
                  <div className="p-4 text-xs text-muted-foreground text-center">
                    No matching products found for &ldquo;{searchQuery}&rdquo;
                  </div>
                ) : (
                  suggestionProducts.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSearchQuery(item.name);
                        setIsSearchFocused(false);
                      }}
                      className="p-3 hover:bg-gray-50 flex items-center gap-3 cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 bg-gray-100 shrink-0 relative overflow-hidden rounded-[2px] border border-gray-100">
                        {item.imageUrls?.[0] ? (
                          <Image
                            src={getCloudinaryUrl(item.imageUrls[0]) || item.imageUrls[0]}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400">
                            DFO
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold bg-neutral-100 text-neutral-800 px-1.5 py-0.5 rounded-[2px]">
                            #{item.id}
                          </span>
                          <span className="text-xs font-semibold truncate text-black">{item.name}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2">
                          <span className="capitalize">{item.category?.name || "Apparel"}</span>
                          <span>·</span>
                          <span className="font-mono font-medium text-black">₹{item.price}</span>
                          <span>·</span>
                          <span className={item.quantity < 5 ? "text-red-600 font-medium" : ""}>
                            {item.quantity} in stock
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Add Product Button */}
          {!showAddForm ? (
            <Button
              onClick={handleOpenAddForm}
              className="rounded-none bg-black text-white hover:bg-neutral-800 text-xs sm:text-sm uppercase tracking-wider h-11 sm:h-12 px-6 shrink-0 cursor-pointer shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                setShowAddForm(false);
                setEditingProduct(null);
                setSelectedParentCategoryId(null);
                setSelectedSubcategoryId(null);
                reset();
                setSelectedFiles([]);
                setFilePreviews([]);
              }}
              className="rounded-none text-xs sm:text-sm uppercase tracking-wider h-11 sm:h-12 px-6 shrink-0 cursor-pointer"
            >
              Close Editor
            </Button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ULTRA-PREMIUM CATEGORY-FIRST ADD PRODUCT WORKFLOW
      ───────────────────────────────────────────────────────────── */}
      {showAddForm && (
        <div className="bg-white border border-black p-4 sm:p-8 shadow-xl transition-all">
          {/* STEP 1: SIMPLE & INTERACTIVE CATEGORY SELECTION */}
            <form onSubmit={handleSubmit(handleAddProductSubmit)} className="space-y-8">
              {/* Category Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 bg-neutral-50 -mx-4 -mt-4 sm:-mx-8 sm:-mt-8 p-4 sm:p-6 mb-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground">
                    <span>Product Editor</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-heading font-medium text-foreground mt-0.5 capitalize flex items-center gap-2">
                    <span>{editingProduct ? `Edit Product #${editingProduct.id}` : "Add New Product"}</span>
                  </h2>
                </div>
              </div>

              {/* Form Body: Streamlined Full Width */}
              <div className="max-w-4xl space-y-6">
                {/* General Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-gray-150 pb-2 flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5" /> 1. Basic Specifications
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category Selection Dropdown */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="categorySelect" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                          Category *
                        </Label>
                        <button
                          type="button"
                          onClick={() => setIsAddCategoryModalOpen(true)}
                          className="text-[10px] uppercase tracking-wider font-bold text-neutral-600 hover:text-black transition-colors underline cursor-pointer"
                        >
                          + Add Category
                        </button>
                      </div>
                      
                      <select
                        id="categorySelect"
                        value={selectedParentCategoryId || ""}
                        onChange={(e) => {
                          const val = e.target.value ? Number(e.target.value) : null;
                          setSelectedParentCategoryId(val);
                          setSelectedSubcategoryId(null);
                        }}
                        className="w-full h-11 px-3 border border-gray-300 focus:border-black bg-white rounded-none text-xs sm:text-sm outline-none cursor-pointer"
                      >
                        <option value="">Select Category</option>
                        {mainCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {errors.categoryName && <p className="text-red-500 text-xs mt-1">{errors.categoryName.message}</p>}
                    </div>

                    {/* Subcategory Selection Dropdown */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="subcategorySelect" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                          Subcategory
                        </Label>
                        <button
                          type="button"
                          disabled={!selectedParentCategoryId}
                          onClick={() => setIsAddSubcategoryModalOpen(true)}
                          className={`text-[10px] uppercase tracking-wider font-bold transition-colors underline cursor-pointer ${
                            selectedParentCategoryId ? "text-neutral-600 hover:text-black" : "text-gray-300 pointer-events-none"
                          }`}
                        >
                          + Add Subcategory
                        </button>
                      </div>

                      <select
                        id="subcategorySelect"
                        disabled={!selectedParentCategoryId}
                        value={selectedSubcategoryId || ""}
                        onChange={(e) => {
                          const val = e.target.value ? Number(e.target.value) : null;
                          setSelectedSubcategoryId(val);
                        }}
                        className="w-full h-11 px-3 border border-gray-300 focus:border-black bg-white rounded-none text-xs sm:text-sm outline-none cursor-pointer disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        {!selectedParentCategoryId ? (
                          <option value="">Select parent category first</option>
                        ) : subcategories.length === 0 ? (
                          <option value="">No subcategories available</option>
                        ) : (
                          <>
                            <option value="">Select Subcategory</option>
                            {subcategories.map((subcat) => (
                              <option key={subcat.id} value={subcat.id}>
                                {subcat.name}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Product Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Product Name *
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g. Classic Oxford Button-Down Shirt"
                        className="rounded-none border-gray-300 h-11 focus:border-black"
                        {...register("name")}
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    {/* Brand */}
                    <div className="space-y-1.5">
                      <Label htmlFor="brand" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Brand
                      </Label>
                      <Input
                        id="brand"
                        placeholder="e.g. Dhanya"
                        className="rounded-none border-gray-300 h-11 focus:border-black"
                        {...register("brand")}
                      />
                      {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Size Variants Toggle & Input Matrix */}
                <div className="space-y-4 pt-2 border-t border-gray-100 mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        id="hasDressSizes"
                        className="w-4 h-4 text-black border-gray-300 focus:ring-black rounded-none cursor-pointer"
                        {...register("hasDressSizes")}
                        onChange={(e) => {
                          setValue("hasDressSizes", e.target.checked);
                          if (e.target.checked) setValue("hasShoeSizes", false);
                        }}
                      />
                      <span className="text-xs uppercase tracking-wider font-semibold text-black">
                        Has Clothing/Dress Sizes (S, M, L, XL, XXL)
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        id="hasShoeSizes"
                        className="w-4 h-4 text-black border-gray-300 focus:ring-black rounded-none cursor-pointer"
                        {...register("hasShoeSizes")}
                        onChange={(e) => {
                          setValue("hasShoeSizes", e.target.checked);
                          if (e.target.checked) setValue("hasDressSizes", false);
                        }}
                      />
                      <span className="text-xs uppercase tracking-wider font-semibold text-black">
                        Has Shoe Sizes (7 - 13)
                      </span>
                    </label>
                  </div>

                  {watch("hasDressSizes") && (
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Quantity Per Clothing Size *
                      </Label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-4 border border-neutral-200 bg-neutral-50/50">
                        {/* Size S */}
                        <div className="space-y-1">
                          <Label htmlFor="sizeSQuantity" className="text-[10px] uppercase tracking-wider text-muted-foreground">S Qty</Label>
                          <Input id="sizeSQuantity" type="number" min="0" placeholder="0" className="rounded-none border-gray-300 h-10 font-mono focus:border-black bg-white" {...register("sizeSQuantity")} />
                        </div>
                        {/* Size M */}
                        <div className="space-y-1">
                          <Label htmlFor="sizeMQuantity" className="text-[10px] uppercase tracking-wider text-muted-foreground">M Qty</Label>
                          <Input id="sizeMQuantity" type="number" min="0" placeholder="0" className="rounded-none border-gray-300 h-10 font-mono focus:border-black bg-white" {...register("sizeMQuantity")} />
                        </div>
                        {/* Size L */}
                        <div className="space-y-1">
                          <Label htmlFor="sizeLQuantity" className="text-[10px] uppercase tracking-wider text-muted-foreground">L Qty</Label>
                          <Input id="sizeLQuantity" type="number" min="0" placeholder="0" className="rounded-none border-gray-300 h-10 font-mono focus:border-black bg-white" {...register("sizeLQuantity")} />
                        </div>
                        {/* Size XL */}
                        <div className="space-y-1">
                          <Label htmlFor="sizeXLQuantity" className="text-[10px] uppercase tracking-wider text-muted-foreground">XL Qty</Label>
                          <Input id="sizeXLQuantity" type="number" min="0" placeholder="0" className="rounded-none border-gray-300 h-10 font-mono focus:border-black bg-white" {...register("sizeXLQuantity")} />
                        </div>
                        {/* Size XXL */}
                        <div className="space-y-1">
                          <Label htmlFor="sizeXXLQuantity" className="text-[10px] uppercase tracking-wider text-muted-foreground">XXL Qty</Label>
                          <Input id="sizeXXLQuantity" type="number" min="0" placeholder="0" className="rounded-none border-gray-300 h-10 font-mono focus:border-black bg-white" {...register("sizeXXLQuantity")} />
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500 font-mono">
                        Calculated Total Stock: {
                          Number(watch("sizeSQuantity") || 0) +
                          Number(watch("sizeMQuantity") || 0) +
                          Number(watch("sizeLQuantity") || 0) +
                          Number(watch("sizeXLQuantity") || 0) +
                          Number(watch("sizeXXLQuantity") || 0)
                        } units
                      </p>
                    </div>
                  )}

                  {watch("hasShoeSizes") && (
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Quantity Per Shoe Size *
                      </Label>
                      <div className="grid grid-cols-3 sm:grid-cols-7 gap-3 p-4 border border-neutral-200 bg-neutral-50/50">
                        <div className="space-y-1">
                          <Label htmlFor="size7Quantity" className="text-[10px] uppercase tracking-wider text-muted-foreground">Size 7</Label>
                          <Input id="size7Quantity" type="number" min="0" placeholder="0" className="rounded-none border-gray-300 h-10 font-mono focus:border-black bg-white" {...register("size7Quantity")} />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="size8Quantity" className="text-[10px] uppercase tracking-wider text-muted-foreground">Size 8</Label>
                          <Input id="size8Quantity" type="number" min="0" placeholder="0" className="rounded-none border-gray-300 h-10 font-mono focus:border-black bg-white" {...register("size8Quantity")} />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="size9Quantity" className="text-[10px] uppercase tracking-wider text-muted-foreground">Size 9</Label>
                          <Input id="size9Quantity" type="number" min="0" placeholder="0" className="rounded-none border-gray-300 h-10 font-mono focus:border-black bg-white" {...register("size9Quantity")} />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="size10Quantity" className="text-[10px] uppercase tracking-wider text-muted-foreground">Size 10</Label>
                          <Input id="size10Quantity" type="number" min="0" placeholder="0" className="rounded-none border-gray-300 h-10 font-mono focus:border-black bg-white" {...register("size10Quantity")} />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="size11Quantity" className="text-[10px] uppercase tracking-wider text-muted-foreground">Size 11</Label>
                          <Input id="size11Quantity" type="number" min="0" placeholder="0" className="rounded-none border-gray-300 h-10 font-mono focus:border-black bg-white" {...register("size11Quantity")} />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="size12Quantity" className="text-[10px] uppercase tracking-wider text-muted-foreground">Size 12</Label>
                          <Input id="size12Quantity" type="number" min="0" placeholder="0" className="rounded-none border-gray-300 h-10 font-mono focus:border-black bg-white" {...register("size12Quantity")} />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="size13Quantity" className="text-[10px] uppercase tracking-wider text-muted-foreground">Size 13</Label>
                          <Input id="size13Quantity" type="number" min="0" placeholder="0" className="rounded-none border-gray-300 h-10 font-mono focus:border-black bg-white" {...register("size13Quantity")} />
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500 font-mono">
                        Calculated Total Stock: {
                          Number(watch("size7Quantity") || 0) +
                          Number(watch("size8Quantity") || 0) +
                          Number(watch("size9Quantity") || 0) +
                          Number(watch("size10Quantity") || 0) +
                          Number(watch("size11Quantity") || 0) +
                          Number(watch("size12Quantity") || 0) +
                          Number(watch("size13Quantity") || 0)
                        } units
                      </p>
                    </div>
                  )}

                  {!watch("hasDressSizes") && !watch("hasShoeSizes") && (
                    <div className="space-y-1.5 max-w-xs">
                      <Label htmlFor="quantity" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Total Stock Quantity *
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="0"
                        placeholder="e.g. 100"
                        className="rounded-none border-gray-300 h-11 font-mono focus:border-black"
                        {...register("quantity")}
                      />
                      {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
                    </div>
                  )}
                </div>

                {/* Pricing Grid */}
                <div className="space-y-4 pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-gray-150 pb-2 flex items-center gap-2">
                    <Percent className="w-3.5 h-3.5" /> 2. Pricing
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Price */}
                    <div className="space-y-1.5">
                      <Label htmlFor="price" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Original MRP (₹) *
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        min="1"
                        className="rounded-none border-gray-300 h-11 font-mono focus:border-black"
                        {...register("price")}
                      />
                      {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
                    </div>

                    {/* Discount */}
                    <div className="space-y-1.5">
                      <Label htmlFor="discountPercentage" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Discount (%)
                      </Label>
                      <Input
                        id="discountPercentage"
                        type="number"
                        min="0"
                        max="100"
                        className="rounded-none border-gray-300 h-11 font-mono focus:border-black"
                        {...register("discountPercentage")}
                      />
                      {errors.discountPercentage && <p className="text-red-500 text-xs">{errors.discountPercentage.message}</p>}
                    </div>
                  </div>

                  {/* Live Calculated Price Indicator */}
                  <div className="bg-neutral-50 border border-neutral-200 p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-gray-500">Customer Selling Price: </span>
                      <strong className="text-sm font-mono text-black ml-1">₹{calculatedSellingPrice}</strong>
                    </div>
                    {watchDiscount > 0 && (
                      <div className="text-emerald-700 font-medium">
                        Save ₹{calculatedSavings} ({watchDiscount}% OFF)
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Imagery Upload */}
                <div className="space-y-4 pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-gray-150 pb-2 flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5" /> 3. Product Imagery
                  </h4>

                  <div className="border-2 border-dashed border-gray-300 hover:border-black transition-colors p-6 text-center bg-gray-50/50 cursor-pointer relative">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs sm:text-sm font-medium text-black">
                      Click or drag images to upload
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Supports PNG, JPG, WebP, HEIC (Auto-uploaded to Cloudinary)
                    </p>
                  </div>

                  {/* Previews */}
                  {filePreviews.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Selected Images ({filePreviews.length})
                      </Label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {filePreviews.map((preview, idx) => (
                          <div key={idx} className="relative aspect-square border border-gray-200 bg-gray-100 group overflow-hidden">
                            <Image
                              src={preview}
                              alt={`Preview ${idx + 1}`}
                              fill
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeSelectedFile(idx)}
                              className="absolute top-1 right-1 bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="Remove image"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            {idx === 0 && (
                              <span className="absolute bottom-1 left-1 bg-black text-[9px] text-white px-1 font-mono uppercase">
                                Main
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Description & Feature Toggle */}
                <div className="space-y-4 pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-gray-150 pb-2 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" /> 4. Description & Options
                  </h4>

                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Product Description *
                    </Label>
                    <textarea
                      id="description"
                      rows={4}
                      className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-0 focus:border-black text-sm bg-white"
                      {...register("description")}
                    />
                    {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
                  </div>

                  <div className="space-y-3 pt-3">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block">
                      Feature & Spotlight Placements
                    </Label>

                    <div className="space-y-2.5">
                      {/* 1. New This Week */}
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          id="featuredToggle"
                          type="checkbox"
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                          className="w-4 h-4 rounded-none accent-black cursor-pointer"
                        />
                        <span className="text-xs uppercase tracking-wider font-semibold text-gray-800 group-hover:text-black transition-colors">
                          Feature this product in &ldquo;New This Week&rdquo; on homepage
                        </span>
                      </label>

                      {/* 2. Trending Now - DFO Tops & Jackets */}
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          id="topsJacketsToggle"
                          type="checkbox"
                          checked={isTopsJackets}
                          onChange={(e) => setIsTopsJackets(e.target.checked)}
                          className="w-4 h-4 rounded-none accent-black cursor-pointer"
                        />
                        <span className="text-xs uppercase tracking-wider font-semibold text-gray-800 group-hover:text-black transition-colors">
                          Feature this product in &ldquo;Trending Now · DFO Tops &amp; Jackets&rdquo;
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Footer Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingProduct(null);
                    setSelectedParentCategoryId(null);
                    setSelectedSubcategoryId(null);
                    reset();
                    setSelectedFiles([]);
                    setFilePreviews([]);
                    setIsFeatured(false);
                    setIsTrending(false);
                    setIsTopsJackets(false);
                  }}
                  className="rounded-none w-full sm:w-auto h-12 px-6 uppercase text-xs tracking-wider"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addProductMutation.isPending || updateProductMutation.isPending}
                  className="rounded-none bg-black text-white hover:bg-neutral-800 w-full sm:w-auto h-12 px-8 uppercase text-xs tracking-wider font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {addProductMutation.isPending || updateProductMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving Product...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Save Product
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

      {/* ─────────────────────────────────────────────────────────────
          PRODUCTS TABLE & SEARCH RESULTS
      ───────────────────────────────────────────────────────────── */}
      {/* Active Search Filter Pill */}
      {searchQuery && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Filtering by: <strong className="text-black">&ldquo;{searchQuery}&rdquo;</strong></span>
          <span className="text-gray-400">({filteredProducts.length} results)</span>
          <button
            onClick={() => setSearchQuery("")}
            className="text-black hover:text-red-600 underline text-[11px] ml-2 cursor-pointer font-medium"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Products Table Container */}
      <div className="bg-white border border-gray-150 overflow-hidden shadow-2xs">
        {isProductsLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            {searchQuery ? (
              <>
                <p>No products found matching &ldquo;{searchQuery}&rdquo;.</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-3 text-xs uppercase tracking-widest font-bold underline text-black cursor-pointer"
                >
                  View All Products
                </button>
              </>
            ) : (
              "No products available. Click Add Product to create one."
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[680px]">
              <thead>
                <tr className="border-b border-gray-150 bg-gray-50 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  <th className="p-3.5 sm:p-4 w-16">ID</th>
                  <th className="p-3.5 sm:p-4">Product</th>
                  <th className="p-3.5 sm:p-4">Category</th>
                  <th className="p-3.5 sm:p-4">Price</th>
                  <th className="p-3.5 sm:p-4">Stock Units</th>
                  <th className="p-3.5 sm:p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-3.5 sm:p-4 font-mono text-xs text-gray-500 font-semibold">
                      #{product.id}
                    </td>
                    <td className="p-3.5 sm:p-4">
                      <div className="flex items-center gap-3">
                        {product.imageUrls?.[0] && (
                          <div className="w-9 h-9 relative shrink-0 overflow-hidden rounded-[2px] bg-gray-100 border border-gray-100">
                            <Image
                              src={getCloudinaryUrl(product.imageUrls[0]) || product.imageUrls[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex flex-col">
                          {product.brand && (
                            <span className="text-[10px] tracking-wider uppercase font-semibold text-amber-600 mb-0.5">{product.brand}</span>
                          )}
                          <span className="font-heading font-medium text-sm text-black">{product.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 sm:p-4 text-gray-500 capitalize text-xs">
                      {product.category?.name || "Apparel"}
                    </td>
                    <td className="p-3.5 sm:p-4 font-mono text-xs font-medium">₹{product.price}</td>
                    
                    {/* Stock Units Column (with inline edit support) */}
                    <td className="p-3.5 sm:p-4">
                      {editingStockId === product.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            value={newStockValue}
                            onChange={(e) => setNewStockValue(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-16 h-8 px-2 border border-black text-xs font-mono font-bold outline-none bg-white"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveStock(product, newStockValue);
                              if (e.key === "Escape") setEditingStockId(null);
                            }}
                          />
                          <button
                            onClick={() => handleSaveStock(product, newStockValue)}
                            disabled={updateProductMutation.isPending}
                            className="bg-black text-white px-2.5 py-1 text-xs hover:bg-neutral-800 cursor-pointer font-medium flex items-center gap-1"
                            title="Save stock units"
                          >
                            {updateProductMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={() => setEditingStockId(null)}
                            className="text-gray-400 hover:text-black p-1 text-xs cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className={`font-mono text-xs font-medium ${product.quantity < 5 ? "text-red-600 font-semibold" : "text-gray-700"}`}>
                            {product.quantity} units
                          </span>
                          {product.hasDressSizes && (
                            <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                              S:{product.sizeSQuantity || 0} | M:{product.sizeMQuantity || 0} | L:{product.sizeLQuantity || 0} | XL:{product.sizeXLQuantity || 0} | XXL:{product.sizeXXLQuantity || 0}
                            </span>
                          )}
                          {product.hasShoeSizes && (
                            <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                              7:{product.size7Quantity || 0} | 8:{product.size8Quantity || 0} | 9:{product.size9Quantity || 0} | 10:{product.size10Quantity || 0} | 11:{product.size11Quantity || 0} | 12:{product.size12Quantity || 0} | 13:{product.size13Quantity || 0}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions Column (with Update Stock & Delete buttons) */}
                    <td className="p-3.5 sm:p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        {!product.hasDressSizes && !product.hasShoeSizes && (
                          <button
                            onClick={() => {
                              if (editingStockId === product.id) {
                                setEditingStockId(null);
                              } else {
                                setEditingStockId(product.id);
                                setNewStockValue(product.quantity);
                              }
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-black bg-gray-100 hover:bg-black hover:text-white px-2.5 py-1.5 rounded-[2px] transition-all cursor-pointer shadow-2xs"
                            title="Update stock units inline"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Stock</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleEditProduct(product)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-black bg-gray-100 hover:bg-black hover:text-white px-2.5 py-1.5 rounded-[2px] transition-all cursor-pointer shadow-2xs"
                          title="Edit product details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-gray-400 hover:text-[var(--color-destructive)] transition-colors p-1.5 rounded-[2px] hover:bg-red-50 cursor-pointer"
                          title="Remove product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete Product"
        message="Are you sure you want to remove this product from the catalog? This action cannot be undone."
        onConfirm={() => {
          if (productToDelete) {
            deleteProductMutation.mutate(productToDelete);
          }
        }}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setProductToDelete(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />

      <CategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        mode="category"
        onSuccess={(newCat) => {
          setSelectedParentCategoryId(newCat.id || null);
          setSelectedSubcategoryId(null);
          setToast({ type: "success", message: `Category "${newCat.name}" created successfully!` });
        }}
      />

      <CategoryModal
        isOpen={isAddSubcategoryModalOpen}
        onClose={() => setIsAddSubcategoryModalOpen(false)}
        mode="subcategory"
        defaultParentId={selectedParentCategoryId}
        onSuccess={(newCat) => {
          setSelectedSubcategoryId(newCat.id || null);
          setToast({ type: "success", message: `Subcategory "${newCat.name}" created successfully!` });
        }}
      />
    </div>
  );
}
