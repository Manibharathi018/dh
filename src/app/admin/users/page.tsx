"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, UserDTO } from "@/services/userService";
import { useAuthStore } from "@/store/useAuthStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2, Shield, User, CheckCircle, AlertCircle } from "lucide-react";
import ConfirmModal from "@/components/shared/ConfirmModal";

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: userService.getAllUsers,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) => 
      userService.updateUserRole(userId, role),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setToast({
        type: "success",
        message: `Successfully updated role for user ${data.name} to ${data.role}`,
      });
      setTimeout(() => setToast(null), 3500);
    },
    onError: (err: any) => {
      setToast({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Failed to update user role",
      });
      setTimeout(() => setToast(null), 3500);
    },
  });

  const handleRoleChangeClick = (user: UserDTO) => {
    const isPromoting = user.role !== "ADMIN";
    const targetRole = isPromoting ? "ADMIN" : "USER";

    setConfirmModal({
      isOpen: true,
      title: isPromoting ? "Promote User to Admin" : "Demote User to Regular User",
      message: isPromoting 
        ? `Are you sure you want to promote ${user.name} (${user.userName}) to ADMIN? This will grant them full administrative privileges.`
        : `Are you sure you want to remove ADMIN privileges from ${user.name} (${user.userName})?`,
      confirmText: "Confirm",
      cancelText: "Cancel",
      onConfirm: () => {
        updateRoleMutation.mutate({ userId: user.id, role: targetRole });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => userService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setToast({
        type: "success",
        message: "Successfully deleted user account.",
      });
      setTimeout(() => setToast(null), 3500);
    },
    onError: (err: any) => {
      setToast({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Failed to delete user",
      });
      setTimeout(() => setToast(null), 3500);
    },
  });

  const handleDeleteUserClick = (user: UserDTO) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete User",
      message: "Are you sure you want to delete this user?",
      confirmText: "Delete User",
      cancelText: "Cancel",
      isDestructive: true,
      onConfirm: () => {
        deleteUserMutation.mutate(user.id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Filter users by search
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredUsers = users.filter((u: UserDTO) => {
    return !normalizedQuery || 
      String(u.id).includes(normalizedQuery) ||
      u.name?.toLowerCase().includes(normalizedQuery) ||
      u.userName?.toLowerCase().includes(normalizedQuery) ||
      u.phoneNumber?.includes(normalizedQuery);
  });

  return (
    <div className="space-y-6 sm:space-y-8 relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 text-sm font-medium shadow-lg border rounded-none ${
            toast.type === "success"
              ? "bg-white border-green-500 text-green-700 animate-in fade-in slide-in-from-top-4 duration-205"
              : "bg-white border-red-500 text-red-700 animate-in fade-in slide-in-from-top-4 duration-205"
          }`}
        >
          <span className={`text-lg font-bold ${toast.type === "success" ? "text-green-500" : "text-red-500"}`}>
            {toast.type === "success" ? "✓" : "✕"}
          </span>
          {toast.message}
        </div>
      )}

      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-medium tracking-tight">Users</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">Manage user privilege structures and administrative access controls.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="w-full h-11 pl-10 pr-9 border border-gray-200 focus:border-black bg-white rounded-none text-sm outline-none transition-colors placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-150 overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            {searchQuery ? (
              <>
                <p>No users found matching your search term.</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-3 text-xs uppercase tracking-widest font-bold underline text-black cursor-pointer"
                >
                  Clear search
                </button>
              </>
            ) : (
              "No users found in database."
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-150 bg-gray-50 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  <th className="p-3.5 sm:p-4 w-20">ID</th>
                  <th className="p-3.5 sm:p-4">Customer Details</th>
                  <th className="p-3.5 sm:p-4">Phone Number</th>
                  <th className="p-3.5 sm:p-4 w-32">Role</th>
                  <th className="p-3.5 sm:p-4 w-36">Verification</th>
                  <th className="p-3.5 sm:p-4 w-44 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u: UserDTO) => {
                  const isSelf = currentUser?.userName === u.userName;
                  return (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-3.5 sm:p-4 font-mono font-medium text-xs">#{u.id}</td>
                      <td className="p-3.5 sm:p-4 text-xs">
                        <div className="font-semibold text-black">{u.name || "Anonymous"}</div>
                        <div className="text-gray-400 font-mono text-[10px] mt-0.5">{u.userName}</div>
                      </td>
                      <td className="p-3.5 sm:p-4 text-xs font-mono text-gray-700">
                        {u.phoneNumber || "N/A"}
                      </td>
                      <td className="p-3.5 sm:p-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 border ${
                          u.role === "ADMIN" 
                            ? "bg-neutral-900 text-white border-neutral-900" 
                            : "bg-white text-neutral-600 border-neutral-200"
                        }`}>
                          {u.role === "ADMIN" ? <Shield className="w-3 h-3 text-red-500" /> : <User className="w-3 h-3" />}
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5 sm:p-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold ${
                          u.isVerified 
                            ? "text-emerald-700" 
                            : "text-amber-600"
                        }`}>
                          {u.isVerified ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                          {u.isVerified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td className="p-3.5 sm:p-4 text-right">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            onClick={() => handleRoleChangeClick(u)}
                            disabled={isSelf || updateRoleMutation.isPending}
                            className={`rounded-none text-[10px] uppercase tracking-wider h-9 px-3.5 font-semibold cursor-pointer ${
                              isSelf 
                                ? "opacity-50 cursor-not-allowed border-gray-150 text-gray-300"
                                : u.role === "ADMIN"
                                ? "border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                : "border-black text-black hover:bg-black hover:text-white"
                            }`}
                            title={isSelf ? "You cannot modify your own administrative role." : ""}
                          >
                            {updateRoleMutation.isPending && (
                              <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                            )}
                            {u.role === "ADMIN" ? "Demote" : "Promote"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleDeleteUserClick(u)}
                            disabled={isSelf || deleteUserMutation.isPending}
                            className="rounded-none text-[10px] uppercase tracking-wider h-9 px-3.5 font-semibold cursor-pointer border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            title={isSelf ? "You cannot delete your own account." : ""}
                          >
                            {deleteUserMutation.isPending && (
                              <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                            )}
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        isDestructive={confirmModal.isDestructive}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
