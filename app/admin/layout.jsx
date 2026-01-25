"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin" },
    { name: "Products", href: "/admin/products" },
    { name: "Add Product", href: "/admin/add-product" },
    { name: "Orders", href: "/admin/orders" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-white border-r">
        <div className="h-16 flex items-center px-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">
            Dbangles Admin
          </h1>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`block rounded-md px-4 py-2 text-sm font-medium transition
                  ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col">
        {/* ---------- HEADER ---------- */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Admin Panel
          </h2>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Admin</span>
            <div className="w-8 h-8 rounded-full bg-gray-300" />
          </div>
        </header>

        {/* ---------- PAGE CONTENT ---------- */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
