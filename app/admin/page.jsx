"use client";

import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-4 px-3">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-gray-800 mb-4 text-center">
          🛍️ Admin Dashboard
        </h1>

        <div className="grid grid-cols-2 gap-3">
          {/* Add Product Card */}
          <Link href="/admin/add-product">
            <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-all cursor-pointer border-2 border-transparent hover:border-pink-300">
              <div className="text-3xl mb-2 text-center">➕</div>
              <h2 className="text-sm font-semibold text-gray-800 text-center mb-1">
                Add New Product
              </h2>
              <p className="text-gray-500 text-center text-xs">
                Add bangles, dresses & accessories
              </p>
            </div>
          </Link>

          {/* View Products Card */}
          <Link href="/admin/products">
            <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-all cursor-pointer border-2 border-transparent hover:border-purple-300">
              <div className="text-3xl mb-2 text-center">📦</div>
              <h2 className="text-sm font-semibold text-gray-800 text-center mb-1">
                View All Products
              </h2>
              <p className="text-gray-500 text-center text-xs">
                Manage your product catalog
              </p>
            </div>
          </Link>

          {/* Orders Card */}
          <Link href="/admin/orders">
            <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-all cursor-pointer border-2 border-transparent hover:border-blue-300">
              <div className="text-3xl mb-2 text-center">📋</div>
              <h2 className="text-sm font-semibold text-gray-800 text-center mb-1">
                View Orders
              </h2>
              <p className="text-gray-500 text-center text-xs">
                Track customer orders
              </p>
            </div>
          </Link>

          {/* Settings Card */}
          <div className="bg-white rounded-lg shadow p-4 opacity-60 cursor-not-allowed">
            <div className="text-3xl mb-2 text-center">⚙️</div>
            <h2 className="text-sm font-semibold text-gray-800 text-center mb-1">
              Settings
            </h2>
            <p className="text-gray-500 text-center text-xs">
              Coming soon...
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg shadow p-4 text-white">
          <h3 className="text-sm font-semibold mb-2">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/add-product"
              className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            >
              + Add Bangles
            </Link>
            <Link
              href="/admin/add-product"
              className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            >
              + Add Sarees
            </Link>
            <Link
              href="/admin/products"
              className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            >
              View Catalog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
