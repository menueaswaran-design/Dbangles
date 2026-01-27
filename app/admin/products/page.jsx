"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaEdit, FaTrash, FaPlus, FaTimes, FaTag, FaRuler } from "react-icons/fa";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [deleting, setDeleting] = useState(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [sizeInput, setSizeInput] = useState("");

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    category: "",
    productType: "",
    originalPrice: "",
    discountedPrice: "",
    size: [],
  });

  /* ---------------- FETCH PRODUCTS ---------------- */
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const snapshot = await getDocs(collection(db, "products"));
      setProducts(
        snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- EDIT ---------------- */
  const handleEditClick = (product) => {
    setEditProduct(product);
    const sizes = Array.isArray(product.size) ? product.size : [];
    setEditForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      productType: product.productType || "",
      originalPrice: product.originalPrice || "",
      discountedPrice: product.discountedPrice || "",
      size: sizes,
    });
    setSizeInput(sizes.join(", "));
    setEditModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSizeChange = (e, index) => {
    const updated = [...editForm.size];
    updated[index] = Number(e.target.value);
    setEditForm((prev) => ({ ...prev, size: updated }));
  };

  const addSize = () => {
    setEditForm((prev) => ({ ...prev, size: [...prev.size, 0] }));
  };

  const removeSize = (index) => {
    setEditForm((prev) => ({
      ...prev,
      size: prev.size.filter((_, i) => i !== index),
    }));
  };

  /* ---------------- SAVE EDIT (FIXED) ---------------- */
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editProduct?.id) {
      alert("Product ID missing");
      return;
    }

    setEditLoading(true);

    try {
      await updateDoc(doc(db, "products", editProduct.id), {
        ...editForm,
        originalPrice: Number(editForm.originalPrice),
        discountedPrice: Number(editForm.discountedPrice),
        size: editForm.size.map(Number),
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === editProduct.id ? { ...p, ...editForm } : p
        )
      );

      setEditModalOpen(false);
      setEditProduct(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update product");
    } finally {
      setEditLoading(false);
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.name}"?`)) return;

    setDeleting(product.id);

    try {
      await deleteDoc(doc(db, "products", product.id));

      if (product.image?.includes("firebasestorage")) {
        try {
          const url = new URL(product.image);
          const match = url.pathname.match(/\/o\/(.+?)(\?|$)/);
          if (match) {
            const imageRef = ref(storage, decodeURIComponent(match[1]));
            deleteObject(imageRef).catch(() => {});
          }
        } catch {}
      }

      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch {
      alert("Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const filteredProducts =
    filter === "all"
      ? products
      : products.filter((p) => p.productType === filter);

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-pink-500" />
      </div>
    );
  }

  /* ---------------- JSX ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div>
              <h1 className="text-xl font-bold text-[#0f766e]">
                📦 Product Management
              </h1>
              <p className="text-gray-600 text-sm mt-0.5">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
              </p>
            </div>
            <Link
              href="/admin/add-product"
              className="bg-[#0f766e] hover:bg-[#0d6259] text-white px-4 py-2 text-sm rounded-lg font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <FaPlus size={12} /> Add New Product
            </Link>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-4">
            {[
              { value: "all", label: "All Products", emoji: "🛍️" },
              { value: "bangles", label: "Bangles", emoji: "💍" },
              { value: "dresses", label: "Dresses", emoji: "👗" }
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value)}
                className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all duration-200 ${
                  filter === item.value
                    ? "bg-[#0f766e] text-white shadow-md transform scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md"
                }`}
              >
                <span className="mr-1.5">{item.emoji}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] overflow-hidden group"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Action Buttons */}
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <button
                    onClick={() => handleEditClick(product)}
                    className="bg-white p-1.5 rounded-lg shadow-md hover:bg-teal-50 transform hover:scale-110 transition-all duration-200"
                    title="Edit Product"
                  >
                    <FaEdit className="text-[#0f766e]" size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    disabled={deleting === product.id}
                    className="bg-white p-1.5 rounded-lg shadow-md hover:bg-red-50 transform hover:scale-110 transition-all duration-200 disabled:opacity-50"
                    title="Delete Product"
                  >
                    <FaTrash className="text-red-600" size={12} />
                  </button>
                </div>

                {/* Category Badge */}
                <div className="absolute top-2 left-2">
                  <span className="bg-[#0f766e] text-white text-xs font-medium px-2 py-1 rounded-full shadow-md">
                    {product.productType || 'Product'}
                  </span>
                </div>
              </div>

              <div className="p-3">
                <h3 className="text-sm font-bold text-gray-900 truncate mb-1">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2 mb-2 h-8">
                  {product.description}
                </p>

                {/* Sizes */}
                {product.size && product.size.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    <FaRuler className="text-gray-400" size={10} />
                    {product.size.map((size, idx) => (
                      <span 
                        key={idx}
                        className="text-xs bg-teal-50 text-[#0f766e] px-1.5 py-0.5 rounded font-medium"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-[#0f766e]">
                    ₹{product.discountedPrice}
                  </span>
                  <span className="text-xs line-through text-gray-400">
                    ₹{product.originalPrice}
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold ml-auto">
                    {Math.round((1 - product.discountedPrice / product.originalPrice) * 100)}% OFF
                  </span>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(product)}
                  disabled={deleting === product.id}
                  className="w-full py-2 text-xs rounded-lg font-medium transition-all duration-200 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <FaTrash size={10} />
                  {deleting === product.id ? "Deleting..." : "Delete Product"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📦</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-sm text-gray-500 mb-4">Start by adding your first product!</p>
            <Link
              href="/admin/add-product"
              className="inline-block bg-[#0f766e] hover:bg-[#0d6259] text-white px-5 py-2 text-sm rounded-lg font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <FaPlus className="inline mr-2" size={12} /> Add Product
            </Link>
          </div>
        )}

        <div className="text-center mt-6">
          <Link 
            href="/admin" 
            className="inline-block text-[#0f766e] hover:text-[#0d6259] text-sm font-medium transition-colors duration-200"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* ---------------- EDIT MODAL ---------------- */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg my-4 relative animate-in fade-in zoom-in duration-300 max-h-[95vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0f766e] to-[#14b8a6] text-white p-3 rounded-t-xl sticky top-0 z-10">
              <button
                onClick={() => setEditModalOpen(false)}
                className="absolute top-2 right-2 bg-white/20 hover:bg-white/30 p-1 rounded-full transition-all duration-200"
              >
                <FaTimes size={14} />
              </button>
              <h2 className="text-base font-bold flex items-center gap-2">
                <FaEdit size={16} />
                Edit Product
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="p-3 space-y-2">
              {/* Product Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  className="w-full border-2 border-gray-200 focus:border-[#0f766e] px-3 py-2 text-sm rounded-lg outline-none transition-all duration-200"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows={4}
                  className="w-full border-2 border-gray-200 focus:border-[#0f766e] px-3 py-2 text-sm rounded-lg outline-none transition-all duration-200 resize-none"
                />
              </div>

              {/* Category & Type Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Category
                  </label>
                  <input
                    name="category"
                    value={editForm.category}
                    onChange={handleInputChange}
                    placeholder="e.g., Gold, Silver"
                    className="w-full border-2 border-gray-200 focus:border-[#0f766e] px-3 py-2 text-sm rounded-lg outline-none transition-all duration-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Product Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="productType"
                    value={editForm.productType}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 focus:border-[#0f766e] px-3 py-2 text-sm rounded-lg outline-none transition-all duration-200 bg-white"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="bangles">💍 Bangles</option>
                    <option value="dresses">👗 Dresses</option>
                  </select>
                </div>
              </div>

              {/* Price Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    <FaTag className="inline mr-1" size={10} />
                    Original Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={editForm.originalPrice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full border-2 border-gray-200 focus:border-[#0f766e] px-3 py-2 text-sm rounded-lg outline-none transition-all duration-200"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    <FaTag className="inline mr-1" size={10} />
                    Discounted Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="discountedPrice"
                    value={editForm.discountedPrice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full border-2 border-gray-200 focus:border-[#0f766e] px-3 py-2 text-sm rounded-lg outline-none transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Sizes Section */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700">
                  <FaRuler className="inline mr-1" size={10} />
                  Available Sizes (e.g., 2.2, 2.4, 2.6)
                </label>
                
                <div className="space-y-2">
                  {/* Size Input Field */}
                  <input
                    type="text"
                    placeholder="Enter sizes separated by commas (e.g., 2.2, 2.4, 2.6, 2.8)"
                    value={sizeInput}
                    onChange={(e) => {
                      setSizeInput(e.target.value);
                      const sizes = e.target.value
                        .split(",")
                        .map(s => s.trim())
                        .filter(s => s !== "")
                        .map(s => parseFloat(s))
                        .filter(s => !isNaN(s));
                      setEditForm((prev) => ({ ...prev, size: sizes }));
                    }}
                    className="w-full border-2 border-gray-200 focus:border-[#0f766e] px-3 py-2 text-sm rounded-lg outline-none transition-all duration-200"
                  />
                  
                  {/* Display Current Sizes */}
                  {editForm.size.length > 0 && (
                    <div className="bg-teal-50 rounded-lg p-2">
                      <p className="text-xs text-gray-600 mb-1.5">Current sizes:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {editForm.size.map((s, i) => (
                          <span 
                            key={i}
                            className="bg-[#0f766e] text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                          >
                            {s}
                            <button
                              type="button"
                              onClick={() => removeSize(i)}
                              className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                            >
                              <FaTimes size={8} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Add Common Sizes */}
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-600 mb-1.5">Quick add common bangle sizes:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[2.0, 2.2, 2.4, 2.6, 2.8, 3.0].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            if (!editForm.size.includes(size)) {
                              setEditForm((prev) => ({ 
                                ...prev, 
                                size: [...prev.size, size].sort((a, b) => a - b)
                              }));
                            }
                          }}
                          disabled={editForm.size.includes(size)}
                          className="bg-white hover:bg-[#0f766e] hover:text-white text-gray-700 px-2 py-1 rounded text-xs font-medium border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 bg-[#0f766e] hover:bg-[#0d6259] text-white text-sm font-semibold py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
