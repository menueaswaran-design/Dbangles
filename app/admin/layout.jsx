"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingCart,
  LogOut,
} from "lucide-react";
import { onAuthChange, logOut, isAdmin } from "@/lib/auth";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check admin authentication
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      if (!currentUser || !isAdmin(currentUser)) {
        // Not logged in or not admin - redirect to login
        if (pathname !== "/admin/login") {
          router.push("/admin/login");
        }
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  // Handle logout
  const handleLogout = async () => {
    await logOut();
    router.push("/admin/login");
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Don't show admin layout on login page or if user is not authenticated
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // If not authenticated, show loading while redirecting (don't show admin UI)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: Package,
    },
    {
      name: "Add",
      href: "/admin/add-product",
      icon: PlusCircle,
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex md:w-64 bg-white border-r flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">
            Dbangles Admin
          </h1>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium transition
                ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ================= MAIN AREA ================= */}
      <div className="flex-1 flex flex-col pb-16 md:pb-0">
        {/* ---------- HEADER (Hidden on Mobile) ---------- */}
        <header className="hidden md:flex h-16 bg-white border-b items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Admin Panel
          </h2>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.email || "Admin"}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition"
              title="Logout"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* ---------- PAGE CONTENT ---------- */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-16 md:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center text-xs transition ${
                isActive ? "text-black" : "text-gray-500"
              }`}
            >
              <Icon size={22} />
              <span className="mt-1">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
