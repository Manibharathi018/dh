"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Boxes, 
  ClipboardList, 
  ArrowLeft, 
  LogOut, 
  Settings, 
  User, 
  Menu, 
  X,
  FolderTree
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: ShoppingBag },
    { name: "Categories", href: "/admin/categories", icon: FolderTree },
    { name: "Inventory", href: "/admin/inventory", icon: Boxes },
    { name: "Orders", href: "/admin/orders", icon: ClipboardList },
    { name: "Users", href: "/admin/users", icon: User },
  ];

  return (
    <div className="flex min-h-[calc(100vh-76px)] bg-[#fafafa] relative">

      {/* Mobile Drawer Overlay — positioned strictly below the main Dhanya header */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed top-[76px] left-0 right-0 bottom-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar — starts immediately under the top Dhanya Factory Outlet Header (top-[76px]) */}
      <aside
        className={`fixed top-[76px] left-0 h-[calc(100vh-76px)] w-64 bg-[#111] text-white flex flex-col z-40 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header with Close Button on Mobile */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-300">
            Admin Menu
          </span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white p-1 cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/10 text-white rounded-none border-l-2 border-[var(--color-destructive)] font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section — Profile, Settings, Logout */}
        <div className="shrink-0 border-t border-white/10 px-3 py-3 space-y-1 bg-[#151515]">
          {/* Admin Avatar + Name */}
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-white/10 text-white text-xs font-semibold flex items-center justify-center shrink-0">
              AD
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.name || "Admin"}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.userName || ""}</p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center space-x-3 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <User className="w-3.5 h-3.5 shrink-0" />
            <span>Profile</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>Log out</span>
          </button>

          <div className="pt-1.5 border-t border-white/5">
            <Link
              href="/"
              className="flex items-center space-x-2 px-3 py-1.5 text-[11px] text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Return to Storefront</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area (Responsive width & offset) */}
      <div className="flex-grow flex flex-col min-w-0 ml-0 lg:ml-64 w-full">
        {/* Admin Header — sticky directly below the main Dhanya header */}
        <header className="h-14 lg:h-16 bg-white border-b border-gray-150 flex items-center justify-between px-4 sm:px-8 z-30 shrink-0 sticky top-[76px]">
          <div className="flex items-center gap-3">
            {/* Hamburger Button on Mobile to open admin menu from Admin Header */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 -ml-1.5 text-black hover:bg-gray-100 rounded-sm flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold cursor-pointer transition-colors"
              aria-label="Toggle admin menu"
            >
              {mobileMenuOpen ? (
                <>
                  <X className="w-5 h-5 text-black" />
                  <span>Close</span>
                </>
              ) : (
                <>
                  <Menu className="w-5 h-5 text-black" />
                  <span>Menu</span>
                </>
              )}
            </button>
            <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground truncate hidden sm:block">
              Management Control
            </h2>
          </div>
          <span className="text-xs sm:text-sm font-medium text-foreground bg-gray-100 px-2.5 py-1 rounded-sm">
            Admin Portal
          </span>
        </header>

        {/* Content Container */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
