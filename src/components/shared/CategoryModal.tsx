"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService, CategoryDTO } from "@/services/categoryService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Loader2 } from "lucide-react";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCat: CategoryDTO) => void;
  defaultParentId?: number | null;
  mode: "category" | "subcategory" | "edit";
  categoryToEdit?: CategoryDTO | null;
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSuccess,
  defaultParentId,
  mode,
  categoryToEdit,
}: CategoryModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch categories to populate parent options
  const { data: categories = [] as CategoryDTO[] } = useQuery<CategoryDTO[]>({
    queryKey: ["admin-categories-list"],
    queryFn: categoryService.getAllCategories,
    enabled: isOpen,
  });

  const mainCategories = categories.filter((c) => !c.parentId);

  // Sync state with default values when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorMsg("");
      if (mode === "edit" && categoryToEdit) {
        setName(categoryToEdit.name || "");
        setDescription(categoryToEdit.description || "");
        setParentId(categoryToEdit.parentId || null);
        setAddress(categoryToEdit.address || "");
      } else {
        setName("");
        setDescription("");
        setAddress("");
        if (mode === "subcategory") {
          setParentId(defaultParentId || (mainCategories[0]?.id || null));
        } else {
          setParentId(null);
        }
      }
    }
  }, [isOpen, defaultParentId, mode, categories, categoryToEdit]);

  const addCategoryMutation = useMutation({
    mutationFn: async (payload: CategoryDTO) => {
      if (mode === "edit" && categoryToEdit?.id) {
        return await categoryService.updateCategory(categoryToEdit.id, payload);
      } else {
        return await categoryService.createCategory(payload);
      }
    },
    onSuccess: (newCat) => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-categories-list"] });
      queryClient.invalidateQueries({ queryKey: ["categories-all"] });
      onSuccess(newCat);
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err?.message || "Failed to save category.");
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Category name is required.");
      return;
    }

    if (mode === "subcategory" && !parentId) {
      setErrorMsg("Please select a parent category for the subcategory.");
      return;
    }

    const payload: CategoryDTO = {
      name: name.trim(),
      description: description.trim() || `${mode === "subcategory" ? "Collection subcategory" : "Collection category"}`,
      imageUrl: categoryToEdit?.imageUrl || "",
      address: address.trim(),
      active: categoryToEdit ? categoryToEdit.active : true,
      parentId: (mode === "subcategory" || (mode === "edit" && parentId)) && parentId ? parentId : undefined,
    };

    addCategoryMutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white border border-black p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-heading font-medium text-black uppercase tracking-wider mb-4">
          {mode === "edit"
            ? `Edit Category`
            : mode === "subcategory"
            ? "Create Subcategory"
            : "Create Category"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <p className="text-red-500 text-xs font-semibold">{errorMsg}</p>
          )}

          {mode === "subcategory" && (
            <div className="space-y-1.5">
              <Label htmlFor="modalParentSelect" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Parent Category
              </Label>
              <select
                id="modalParentSelect"
                value={parentId || ""}
                disabled={!!defaultParentId}
                onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
                className="w-full h-11 px-3 border border-gray-300 focus:border-black bg-white rounded-none text-xs sm:text-sm outline-none cursor-pointer disabled:bg-neutral-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <option value="">Select Parent Category</option>
                {mainCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {mode === "edit" && categoryToEdit?.parentId && (
            <div className="space-y-1.5">
              <Label htmlFor="modalParentSelectEdit" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Parent Category
              </Label>
              <select
                id="modalParentSelectEdit"
                value={parentId || ""}
                onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
                className="w-full h-11 px-3 border border-gray-300 focus:border-black bg-white rounded-none text-xs sm:text-sm outline-none cursor-pointer"
              >
                <option value="">Select Parent Category</option>
                {mainCategories
                  .filter((cat) => cat.id !== categoryToEdit.id)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="modalNameInput" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Name *
            </Label>
            <Input
              id="modalNameInput"
              placeholder={mode === "subcategory" ? "e.g. Shirts, Jeans, Shoes" : "e.g. Men, Women, Accessories"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-none border-gray-300 h-11 focus:border-black"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="modalAddressInput" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Image URL (Cloudinary)
            </Label>
            <Input
              id="modalAddressInput"
              placeholder="e.g. https://res.cloudinary.com/..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="rounded-none border-gray-300 h-11 focus:border-black"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="modalDescInput" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Description
            </Label>
            <textarea
              id="modalDescInput"
              placeholder="Enter category details..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 focus:outline-none focus:ring-0 focus:border-black text-sm bg-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-none h-11 px-5 uppercase text-[10px] tracking-wider font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addCategoryMutation.isPending}
              className="rounded-none bg-black text-white hover:bg-neutral-800 h-11 px-6 uppercase text-[10px] tracking-wider font-semibold flex items-center gap-1.5"
            >
              {addCategoryMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
