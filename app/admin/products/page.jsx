"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    setDeleting(product.id);

    try {
      // Delete from Firestore first
      await deleteDoc(doc(db, "products", product.id));

      // Try to delete image from Storage (don't wait for it)
      if (product.image && product.image.includes("firebasestorage")) {
        try {
          // Extract the path from the URL
          const url = new URL(product.image);
          const pathMatch = url.pathname.match(/\/o\/(.+?)(\?|$)/);
          if (pathMatch) {
            const storagePath = decodeURIComponent(pathMatch[1]);
            const imageRef = ref(storage, storagePath);
            deleteObject(imageRef).catch(() => {
              console.log("Image already deleted or not found");
            });
          }
        } catch (e) {
          console.log("Could not delete image:", e);
        }
      }

      // Update local state immediately
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    } finally {
      setDeleting(null);
    }
  };

  const filteredProducts =
    filter === "all"
      ? products
      : products.filter((p) => p.productType === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-3">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800 mb-2 md:mb-0">
            📦 All Products ({filteredProducts.length})
          </h1>
          <Link
            href="/admin/add-product"
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-pink-600 hover:to-purple-600 transition-all shadow-sm"
          >
            + Add New Product
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {["all", "bangles", "dresses"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                filter === type
                  ? "bg-pink-500 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {type === "all" ? "All" : type === "bangles" ? "👑 Bangles" : "👗 Dresses"}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl mb-2">📭</div>
            <h2 className="text-base font-semibold text-gray-800 mb-1">
              No products yet
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              Start by adding your first product
            </p>
            <Link
              href="/admin/add-product"
              className="inline-block bg-pink-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-pink-600 transition-colors"
            >
              Add Product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-all"
              >
                {/* Product Image */}
                <div className="relative h-32 bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                    }}
                  />
                  <span
                    className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-white ${
                      product.productType === "bangles"
                        ? "bg-pink-500"
                        : "bg-purple-500"
                    }`}
                  >
                    {product.productType}
                  </span>
                </div>

                {/* Product Info */}
                <div className="p-2">
                  <h3 className="font-medium text-gray-800 text-sm truncate">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-xs truncate">
                    {product.description}
                  </p>
                  <p className="text-[10px] text-pink-500 mb-1">{product.category}</p>

                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-sm font-bold text-gray-800">
                      ₹{product.discountedPrice}
                    </span>
                    <span className="text-xs text-gray-400 line-through">
                      ₹{product.originalPrice}
                    </span>
                    <span className="text-[10px] bg-green-100 text-green-600 px-1 py-0.5 rounded">
                      {Math.round(
                        ((product.originalPrice - product.discountedPrice) /
                          product.originalPrice) *
                          100
                      )}%
                    </span>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => handleDelete(product)}
                    disabled={deleting === product.id}
                    className={`w-full py-1.5 rounded text-xs font-medium transition-colors ${
                      deleting === product.id
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-red-100 text-red-600 hover:bg-red-200"
                    }`}
                  >
                    {deleting === product.id ? "Deleting..." : "🗑️ Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Link */}
        <div className="text-center mt-4">
          <Link
            href="/admin"
            className="text-pink-500 hover:text-pink-600 font-medium"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
