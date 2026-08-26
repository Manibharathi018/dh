"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
}: ConfirmModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onCancel}
      />
      
      {/* Modal Box */}
      <div className="relative bg-white border border-neutral-200 shadow-2xl p-6 sm:p-8 max-w-md w-full mx-4 rounded-none z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-neutral-400 hover:text-black cursor-pointer transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`p-2.5 rounded-none shrink-0 ${isDestructive ? "bg-red-50 text-red-600" : "bg-neutral-100 text-neutral-800"}`}>
            <AlertTriangle className="w-5 h-5 stroke-[2]" />
          </div>

          <div className="space-y-2">
            <h3 className="font-heading font-semibold text-lg text-black uppercase tracking-wide">
              {title}
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-neutral-100">
          <Button
            variant="outline"
            onClick={onCancel}
            className="rounded-none border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs tracking-wider uppercase px-5 h-11"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className={`rounded-none text-xs tracking-wider uppercase px-6 h-11 text-white font-semibold cursor-pointer ${
              isDestructive 
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-black hover:bg-neutral-800"
            }`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
