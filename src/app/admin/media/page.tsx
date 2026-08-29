"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaService, MediaContent } from "@/services/mediaService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Loader2, UploadCloud, X, Film, Image as ImageIcon } from "lucide-react";
import { getCloudinaryUrl } from "@/lib/utils";

export default function AdminMedia() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  
  // Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"banner" | "review" | "experience">("banner");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Fetch all media types
  const { data: banners = [], isLoading: bannersLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: mediaService.getBanners,
  });

  const { data: reviewVideos = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: mediaService.getReviewVideos,
  });

  const { data: experienceVideos = [], isLoading: experienceLoading } = useQuery({
    queryKey: ["admin-experience"],
    queryFn: mediaService.getExperienceCollection,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  // Upload to Cloudinary & register with backend
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setToast({ type: "error", message: "Please select a file to upload." });
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload file directly to Cloudinary
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dq41e3dn1";
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ecommerce";
      
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", uploadPreset);

      const isVideo = selectedFile.type.startsWith("video/");
      const resourceType = isVideo ? "video" : "image";

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.secure_url) {
        throw new Error(data.error?.message || "Cloudinary upload failed.");
      }

      const uploadedUrl = data.secure_url;

      // 2. Submit URL to correct backend endpoint
      if (mediaType === "banner") {
        await mediaService.addBanner(uploadedUrl);
        queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      } else if (mediaType === "review") {
        await mediaService.addReviewVideo(uploadedUrl);
        queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      } else if (mediaType === "experience") {
        await mediaService.addExperienceCollection(uploadedUrl);
        queryClient.invalidateQueries({ queryKey: ["admin-experience"] });
      }

      setToast({ type: "success", message: "Media content uploaded and registered successfully." });
      clearSelectedFile();
    } catch (err: any) {
      console.error(err);
      setToast({ type: "error", message: err.message || "Failed to upload media." });
    } finally {
      setIsUploading(false);
    }
  };

  // Delete Media Mutation
  const deleteMediaMutation = useMutation({
    mutationFn: mediaService.deleteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin-experience"] });
      setToast({ type: "success", message: "Media deleted successfully." });
    },
    onError: (err: any) => {
      setToast({ type: "error", message: err.message || "Failed to delete media." });
    },
  });

  const handleDeleteMedia = (id: number) => {
    if (confirm("Are you sure you want to delete this media item?")) {
      deleteMediaMutation.mutate(id);
    }
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

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-medium tracking-tight">Media & Banners</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          Manage promotional banners, review videos, and collection experience showreels.
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white border border-gray-200 p-6 shadow-2xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-black mb-4">Upload New Media</h2>
        <form onSubmit={handleUploadSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="mediaType" className="text-xs uppercase tracking-wider font-semibold">Media Category</Label>
              <select
                id="mediaType"
                value={mediaType}
                onChange={(e) => {
                  setMediaType(e.target.value as any);
                  clearSelectedFile();
                }}
                className="w-full h-11 px-3 border border-gray-300 focus:border-black bg-white rounded-none text-xs sm:text-sm outline-none cursor-pointer"
              >
                <option value="banner">Homepage Banner Image</option>
                <option value="review">Customer Review Video</option>
                <option value="experience">Experience Our Collection Video</option>
              </select>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 hover:border-black transition-colors p-6 text-center bg-gray-50/50 cursor-pointer relative">
            <input
              type="file"
              accept={mediaType === "banner" ? "image/*" : "video/*"}
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-medium text-black">
              Click or drag to select {mediaType === "banner" ? "an image" : "a video"} file
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              {mediaType === "banner" ? "PNG, JPG, WebP supported" : "MP4, WebM, MOV supported"}
            </p>
          </div>

          {/* File Preview */}
          {filePreview && (
            <div className="relative aspect-video max-w-md border border-gray-200 bg-black group overflow-hidden">
              {mediaType === "banner" ? (
                <Image src={filePreview} alt="Preview" fill className="object-cover" />
              ) : (
                <video src={filePreview} controls className="w-full h-full object-cover" />
              )}
              <button
                type="button"
                onClick={clearSelectedFile}
                className="absolute top-2 right-2 bg-black/80 text-white rounded-full p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="rounded-none bg-black text-white hover:bg-neutral-800 h-11 px-8 uppercase text-xs tracking-wider font-semibold flex items-center gap-2 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading to Cloudinary...
                </>
              ) : (
                "Upload Content"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Media Library */}
      <div className="space-y-8">
        {/* Banners */}
        <div className="bg-white border border-gray-200 p-6 shadow-2xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-black mb-4 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Homepage Banners ({banners.length})
          </h2>
          {bannersLoading ? (
            <Skeleton className="h-28 w-full" />
          ) : banners.length === 0 ? (
            <p className="text-xs text-muted-foreground">No banner images registered.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {banners.map((b) => (
                <div key={b.id} className="relative aspect-video border border-gray-200 group overflow-hidden bg-neutral-100">
                  <Image src={getCloudinaryUrl(b.address)} alt="Banner" fill className="object-cover" />
                  <button
                    onClick={() => handleDeleteMedia(b.id)}
                    className="absolute top-2 right-2 bg-black/80 hover:bg-red-600 text-white p-1.5 transition-colors cursor-pointer"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review Videos */}
        <div className="bg-white border border-gray-200 p-6 shadow-2xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-black mb-4 flex items-center gap-2">
            <Film className="w-4 h-4" /> Customer Review Videos ({reviewVideos.length})
          </h2>
          {reviewsLoading ? (
            <Skeleton className="h-28 w-full" />
          ) : reviewVideos.length === 0 ? (
            <p className="text-xs text-muted-foreground">No review videos registered.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {reviewVideos.map((v) => (
                <div key={v.id} className="relative aspect-[3/4] border border-gray-200 group overflow-hidden bg-neutral-900">
                  <video src={getCloudinaryUrl(v.address)} controls className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleDeleteMedia(v.id)}
                    className="absolute top-2 right-2 bg-black/80 hover:bg-red-600 text-white p-1.5 transition-colors cursor-pointer z-10"
                    title="Delete Video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Experience Collection */}
        <div className="bg-white border border-gray-200 p-6 shadow-2xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-black mb-4 flex items-center gap-2">
            <Film className="w-4 h-4" /> Experience Collection Videos ({experienceVideos.length})
          </h2>
          {experienceLoading ? (
            <Skeleton className="h-28 w-full" />
          ) : experienceVideos.length === 0 ? (
            <p className="text-xs text-muted-foreground">No experience videos registered.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {experienceVideos.map((v) => (
                <div key={v.id} className="relative aspect-video border border-gray-200 group overflow-hidden bg-neutral-900">
                  <video src={getCloudinaryUrl(v.address)} controls className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleDeleteMedia(v.id)}
                    className="absolute top-2 right-2 bg-black/80 hover:bg-red-600 text-white p-1.5 transition-colors cursor-pointer z-10"
                    title="Delete Video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
