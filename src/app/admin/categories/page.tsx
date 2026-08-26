"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService, CategoryDTO } from "@/services/categoryService";
import { productService } from "@/services/productService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Loader2, Search, X, FolderTree, Edit3, Eye, Layers } from "lucide-react";
import { getCloudinaryUrl } from "@/lib/utils";
import ConfirmModal from "@/components/shared/ConfirmModal";
import CategoryModal from "@/components/shared/CategoryModal";

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal open states
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddSubcategoryOpen, setIsAddSubcategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryDTO | null>(null);

  // Deletion modals states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<{
    open: boolean;
    name: string;
    productsCount: number;
    subcategoriesCount: number;
  } | null>(null);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Fetch categories
  const { data: categories = [] as CategoryDTO[], isLoading: isCategoriesLoading } = useQuery<CategoryDTO[]>({
    queryKey: ["admin-categories"],
    queryFn: categoryService.getAllCategories,
  });

  // Fetch all products (to count associations)
  const { data: productsData } = useQuery({
    queryKey: ["admin-all-products-for-counting"],
    queryFn: () => productService.getAllProducts(0, 1000),
  });

  const products = productsData?.content || [];

  // Delete Category Mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-categories-list"] });
      setToast({ type: "success", message: "Category deleted successfully." });
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || "Failed to delete category.";
      setToast({ type: "error", message: msg });
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    },
  });

  const handleDeleteClick = (cat: CategoryDTO) => {
    if (!cat.id) return;

    const linkedProductsCount = products.filter(
      (p) =>
        p.category?.id === cat.id ||
        p.category?.name?.toLowerCase() === cat.name.toLowerCase()
    ).length;

    // Check for subcategories
    const linkedSubcategoriesCount = categories.filter((c) => c.parentId === cat.id).length;

    if (linkedProductsCount > 0 || linkedSubcategoriesCount > 0) {
      setDeleteWarning({
        open: true,
        name: cat.name,
        productsCount: linkedProductsCount,
        subcategoriesCount: linkedSubcategoriesCount,
      });
    } else {
      setCategoryToDelete(cat.id);
      setDeleteConfirmOpen(true);
    }
  };

  const parentCategories = categories.filter((c) => !c.parentId);

  // Search Filter
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredParents = parentCategories.filter((parent) => {
    if (!normalizedQuery) return true;
    const nameMatch = parent.name?.toLowerCase().includes(normalizedQuery);
    const descMatch = parent.description?.toLowerCase().includes(normalizedQuery);
    // Include parent if any of its children match search
    const childrenMatch = categories
      .filter((c) => c.parentId === parent.id)
      .some(
        (child) =>
          child.name?.toLowerCase().includes(normalizedQuery) ||
          child.description?.toLowerCase().includes(normalizedQuery)
      );
    return nameMatch || descMatch || childrenMatch;
  });

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-medium tracking-tight">Categories</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Define main departments, custom subcategories, slugs, and count listings.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full h-11 sm:h-12 pl-10 pr-9 border border-gray-200 focus:border-black bg-white rounded-none text-xs sm:text-sm outline-none transition-colors placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setIsAddCategoryOpen(true)}
              className="rounded-none bg-black text-white hover:bg-neutral-800 text-xs sm:text-sm uppercase tracking-wider h-11 sm:h-12 px-5 flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Category
            </Button>
            <Button
              onClick={() => {
                setSelectedParentId(null);
                setIsAddSubcategoryOpen(true);
              }}
              variant="outline"
              className="rounded-none text-xs sm:text-sm uppercase tracking-wider h-11 sm:h-12 px-5 flex items-center gap-2 cursor-pointer border-gray-300 hover:border-black"
            >
              <Plus className="w-4 h-4" /> Add Subcategory
            </Button>
          </div>
        </div>
      </div>

      {/* Dynamic Categories Grid Tree */}
      {isCategoriesLoading ? (
        <div className="bg-white border border-gray-150 p-6 space-y-4 shadow-2xs">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white border border-gray-150 p-12 text-center text-muted-foreground text-sm shadow-2xs">
          <p className="mb-4">No categories created yet.</p>
          <Button
            onClick={() => setIsAddCategoryOpen(true)}
            className="rounded-none bg-black text-white hover:bg-neutral-800 text-xs uppercase tracking-wider h-11 px-6 shrink-0 cursor-pointer"
          >
            Create First Category
          </Button>
        </div>
      ) : filteredParents.length === 0 ? (
        <div className="bg-white border border-gray-150 p-12 text-center text-muted-foreground text-sm shadow-2xs">
          <p>No categories found matching &ldquo;{searchQuery}&rdquo;.</p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-3 text-xs uppercase tracking-widest font-bold underline text-black cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredParents.map((parent) => {
            const subcats = categories.filter((c) => c.parentId === parent.id);
            const parentProdCount = products.filter(
              (p) =>
                p.category?.id === parent.id ||
                p.category?.name?.toLowerCase() === parent.name.toLowerCase()
            ).length;

            return (
              <div key={parent.id} className="bg-white border border-gray-200 shadow-2xs overflow-hidden">
                {/* Parent Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 bg-neutral-50/50 border-b border-gray-100 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 relative overflow-hidden rounded-[2px] border border-neutral-200 bg-neutral-100 shrink-0">
                      {parent.imageUrl ? (
                        <Image
                          src={getCloudinaryUrl(parent.imageUrl) || parent.imageUrl}
                          alt={parent.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-mono">
                          DFO
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-semibold text-lg text-black capitalize">
                          {parent.name}
                        </h3>
                        <span className="text-[10px] bg-neutral-200 text-neutral-800 px-2 py-0.5 font-mono uppercase tracking-wider font-semibold">
                          Main Category
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {parent.description || "No description provided."}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                        Slug: /{parent.slug}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <span className="text-xs font-mono font-medium text-gray-600 bg-gray-150 px-2.5 py-1 rounded-[2px] shrink-0 mr-2">
                      {parentProdCount} products
                    </span>

                    <Link
                      href={`/admin/products?search=${encodeURIComponent(parent.name)}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-black bg-white hover:bg-neutral-50 border border-gray-250 px-2.5 py-1.5 rounded-[2px] transition-all cursor-pointer shadow-2xs"
                      title="Inspect products in this category"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </Link>

                    <button
                      onClick={() => {
                        setSelectedParentId(parent.id || null);
                        setIsAddSubcategoryOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-black bg-white hover:bg-neutral-50 border border-gray-250 px-2.5 py-1.5 rounded-[2px] transition-all cursor-pointer shadow-2xs"
                      title="Add subcategory"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Sub</span>
                    </button>

                    <button
                      onClick={() => {
                        setCategoryToEdit(parent);
                        setIsEditCategoryOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-black bg-white hover:bg-neutral-50 border border-gray-250 px-2.5 py-1.5 rounded-[2px] transition-all cursor-pointer shadow-2xs"
                      title="Edit Category"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteClick(parent)}
                      className="text-gray-400 hover:text-[var(--color-destructive)] transition-colors p-2 rounded-[2px] hover:bg-red-50 cursor-pointer"
                      title="Remove Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subcategories Indented List */}
                <div className="p-4 sm:p-5 bg-white divide-y divide-neutral-100">
                  {subcats.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-2 pl-4">
                      No subcategories created under {parent.name} yet.
                    </p>
                  ) : (
                    subcats.map((sub) => {
                      const subProdCount = products.filter(
                        (p) =>
                          p.category?.id === sub.id ||
                          p.category?.name?.toLowerCase() === sub.name.toLowerCase()
                      ).length;

                      return (
                        <div
                          key={sub.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3.5 pl-6 sm:pl-8 gap-3"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-gray-300 font-mono mr-1">└──</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-heading font-medium text-sm text-black capitalize">
                                  {sub.name}
                                </h4>
                                <span className="text-[9px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 font-mono uppercase font-medium">
                                  Subcategory
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                Slug: /{sub.slug}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <span className="text-[10px] font-mono font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-[2px] shrink-0 mr-1">
                              {subProdCount} products
                            </span>

                            <Link
                              href={`/admin/products?search=${encodeURIComponent(sub.name)}`}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-black bg-white hover:bg-neutral-50 border border-gray-200 px-2 py-1 rounded-[2px] transition-all cursor-pointer shadow-2xs"
                              title="Inspect products in this subcategory"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Inspect</span>
                            </Link>

                            <button
                              onClick={() => {
                                setCategoryToEdit(sub);
                                setIsEditCategoryOpen(true);
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-black bg-white hover:bg-neutral-50 border border-gray-200 px-2 py-1 rounded-[2px] transition-all cursor-pointer shadow-2xs"
                              title="Edit Subcategory"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleDeleteClick(sub)}
                              className="text-gray-400 hover:text-[var(--color-destructive)] transition-colors p-1.5 rounded-[2px] hover:bg-red-50 cursor-pointer"
                              title="Remove Subcategory"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* reusable CategoryModal components */}
      <CategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        mode="category"
        onSuccess={(newCat) => {
          setToast({ type: "success", message: `Category "${newCat.name}" created successfully!` });
          queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
        }}
      />

      <CategoryModal
        isOpen={isAddSubcategoryOpen}
        onClose={() => {
          setIsAddSubcategoryOpen(false);
          setSelectedParentId(null);
        }}
        mode="subcategory"
        defaultParentId={selectedParentId}
        onSuccess={(newCat) => {
          setToast({ type: "success", message: `Subcategory "${newCat.name}" created successfully!` });
          queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
        }}
      />

      <CategoryModal
        isOpen={isEditCategoryOpen}
        onClose={() => {
          setIsEditCategoryOpen(false);
          setCategoryToEdit(null);
        }}
        mode="edit"
        categoryToEdit={categoryToEdit}
        onSuccess={(savedCat) => {
          setToast({ type: "success", message: `Category "${savedCat.name}" updated successfully!` });
          queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
        }}
      />

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete Category"
        message="Are you sure you want to remove this category? This action cannot be undone."
        onConfirm={() => {
          if (categoryToDelete) {
            deleteCategoryMutation.mutate(categoryToDelete);
          }
        }}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setCategoryToDelete(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />

      {/* Safety dependency check warning overlay modal */}
      {deleteWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white border border-black p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setDeleteWarning(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-heading font-semibold text-red-600 uppercase tracking-wider mb-4">
              Cannot delete &ldquo;{deleteWarning.name}&rdquo;
            </h3>
            <div className="space-y-4 text-sm text-gray-700">
              <p>This category still contains:</p>
              <ul className="list-disc pl-5 space-y-1 font-semibold text-black">
                {deleteWarning.productsCount > 0 && (
                  <li>• {deleteWarning.productsCount} products</li>
                )}
                {deleteWarning.subcategoriesCount > 0 && (
                  <li>• {deleteWarning.subcategoriesCount} subcategories</li>
                )}
              </ul>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Please delete all subcategories and move or remove all product listings inside this category first.
              </p>
              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => setDeleteWarning(null)}
                  className="rounded-none bg-black text-white hover:bg-neutral-800 h-10 px-6 uppercase text-[10px] tracking-wider font-semibold cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
