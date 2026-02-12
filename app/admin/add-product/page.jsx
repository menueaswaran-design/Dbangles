"use client";

import { useState, useCallback, useEffect } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDocs, doc, setDoc } from "firebase/firestore";
import { storage, db } from "@/lib/firebase";
import Cropper from "react-easy-crop";
import { FaRuler, FaTimes } from "react-icons/fa";

// Create cropped image from canvas
const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], "cropped.jpg", { type: "image/jpeg" }));
    }, "image/jpeg", 0.9);
  });
};

// Compress image before upload
const compressImage = (file, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, { type: "image/jpeg" }));
          },
          "image/jpeg",
          quality
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export default function AddProductPage() {
  const [productType, setProductType] = useState("bangles");
  const defaultSizes = [2.2, 2.4, 2.6, 2.8, 2.10];
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    originalPrice: "",
    discountedPrice: "",
    category: "",
    note: "",
    sizeVariants: defaultSizes.map(size => ({ size, originalPrice: "", discountedPrice: "" })), // Default sizes for bangles
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  // Cropping states
  const [showCropper, setShowCropper] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Dynamic categories from Firestore
  const [bangleCategories, setBangleCategories] = useState([]);
  const [dressCategories, setDressCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const categories = productType === "bangles" ? bangleCategories : dressCategories;
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  // Fetch categories from Firestore
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const categoriesSnapshot = await getDocs(collection(db, "categories"));
      const categoriesData = categoriesSnapshot.docs.map(doc => doc.data());
      
      const bangles = categoriesData
        .filter(cat => cat.productType === "bangles")
        .map(cat => cat.name)
        .sort();
      
      const dresses = categoriesData
        .filter(cat => cat.productType === "dresses")
        .map(cat => cat.name)
        .sort();
      
      // If no categories exist, add default ones
      if (bangles.length === 0) {
        const defaultBangles = [
          "Kundan bangles",
          "Glass bangles",
          "Bracelets",
          "Hair accessories",
          "Saree pins",
          "Invisible chains",
        ];
        for (const cat of defaultBangles) {
          await saveCategory(cat, "bangles");
        }
        setBangleCategories(defaultBangles);
      } else {
        setBangleCategories(bangles);
      }
      
      if (dresses.length === 0) {
        const defaultDresses = ["Sarees", "Unstitched chudi material"];
        for (const cat of defaultDresses) {
          await saveCategory(cat, "dresses");
        }
        setDressCategories(defaultDresses);
      } else {
        setDressCategories(dresses);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Fallback to empty arrays
      setBangleCategories([]);
      setDressCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const saveCategory = async (categoryName, type) => {
    try {
      const categoryId = `${type}_${categoryName.toLowerCase().replace(/\s+/g, "_")}`;
      await setDoc(doc(db, "categories", categoryId), {
        name: categoryName,
        productType: type,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setMessage({ type: "error", text: "Image too large. Max 10MB allowed." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result);
        setShowCropper(true);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = async () => {
    try {
      const croppedFile = await getCroppedImg(originalImage, croppedAreaPixels);
      setImageFile(croppedFile);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(croppedFile);
      
      setShowCropper(false);
      setOriginalImage(null);
    } catch (error) {
      console.error("Error cropping image:", error);
      setMessage({ type: "error", text: "Failed to crop image" });
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setOriginalImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    setUploadProgress("Compressing image...");

    try {
      // Validate
      if (!imageFile) {
        throw new Error("Please select an image");
      }

      // Compress image first
      console.log("Step 1: Compressing image...");
      const compressedFile = await compressImage(imageFile);
      console.log("Compressed size:", (compressedFile.size / 1024).toFixed(2), "KB");
      
      setUploadProgress("Uploading to cloud...");
      console.log("Step 2: Uploading to Firebase Storage...");
      console.log("Storage bucket:", storage.app.options.storageBucket);

      // Upload image to Firebase Storage with timeout (60 seconds)
      const timestamp = Date.now();
      const fileName = `${timestamp}_${compressedFile.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const storagePath = `products/${productType}/${fileName}`;
      console.log("Uploading to path:", storagePath);
      
      const storageRef = ref(storage, storagePath);
      
      const uploadPromise = uploadBytes(storageRef, compressedFile);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Upload timeout after 60s - check internet connection")), 60000)
      );
      
      const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
      console.log("Step 3: Upload complete, getting URL...");
      
      setUploadProgress("Getting image URL...");
      const imageURL = await getDownloadURL(snapshot.ref);
      console.log("Image URL:", imageURL);

      setUploadProgress("Saving product...");
      console.log("Step 4: Saving to Firestore...");
      
      // Save product to Firestore
      const productData = {
        name: formData.name,
        description: formData.description,
        originalPrice: Number(formData.originalPrice),
        discountedPrice: Number(formData.discountedPrice),
        category: formData.category,
        note: formData.note || "",
        image: imageURL,
        productType: productType,
        sizeVariants: formData.sizeVariants
          .filter(sv => sv.originalPrice && sv.discountedPrice)
          .map(sv => ({
            size: Number(sv.size),
            originalPrice: Number(sv.originalPrice),
            discountedPrice: Number(sv.discountedPrice)
          })),
        createdAt: new Date().toISOString(),
      };

      const firestorePromise = addDoc(collection(db, "products"), productData);
      const firestoreTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Firestore timeout - check your Firestore rules")), 15000)
      );
      
      await Promise.race([firestorePromise, firestoreTimeout]);
      console.log("Step 5: Product saved successfully!");

      setMessage({ type: "success", text: "Product added successfully!" });
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        originalPrice: "",
        discountedPrice: "",
        category: "",
        note: "",
        sizeVariants: [],
      });
      setImageFile(null);
      setImagePreview(null);

    } catch (error) {
      console.error("Error adding product:", error);
      setMessage({ type: "error", text: error.message || "Failed to add product" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-3">
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-gray-800 mb-4 text-center">
          Add New Product
        </h1>

        {/* Crop Modal */}
        {showCropper && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
              <div className="p-3 border-b">
                <h3 className="text-sm font-semibold text-gray-800">Crop Image</h3>
              </div>
              
              <div className="relative h-64 bg-gray-900">
                <Cropper
                  image={originalImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              
              <div className="p-3 space-y-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Zoom</label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCropCancel}
                    className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCropSave}
                    className="flex-1 py-2 text-sm font-medium text-white bg-pink-500 rounded-md hover:bg-pink-600 transition-colors"
                  >
                    ✓ Crop & Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {message.text && (
          <div
            className={`mb-4 p-3 rounded-md text-sm ${
              message.type === "success"
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 space-y-4">
          {/* Product Type Toggle */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Product Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setProductType("bangles");
                  // Auto-populate default sizes for bangles
                  const defaultSizes = [2.2, 2.4, 2.6, 2.8, 2.10];
                  setFormData((prev) => ({ 
                    ...prev, 
                    category: "",
                    sizeVariants: defaultSizes.map(size => ({
                      size,
                      originalPrice: "",
                      discountedPrice: ""
                    }))
                  }));
                }}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  productType === "bangles"
                    ? "bg-pink-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                👑 Bangles
              </button>
              <button
                type="button"
                onClick={() => {
                  setProductType("dresses");
                  setFormData((prev) => ({ 
                    ...prev, 
                    category: "",
                    sizeVariants: []
                  }));
                }}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  productType === "dresses"
                    ? "bg-purple-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                👗 Dresses
              </button>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Product Image *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-3 text-center hover:border-pink-400 transition-colors">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-40 mx-auto rounded-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-2xl mb-1">📷</div>
                  <p className="text-gray-500 text-xs mb-2">Upload product image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="imageInput"
                  />
                  <label
                    htmlFor="imageInput"
                    className="inline-block px-3 py-1.5 text-sm bg-pink-500 text-white rounded-md cursor-pointer hover:bg-pink-600 transition-colors"
                  >
                    Choose Image
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="e.g., Golden Spiral Bangle Set"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={2}
              placeholder="Describe your product..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Category *
            </label>
            {!showCustomCategory ? (
              <div className="flex gap-2">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  disabled={categoriesLoading}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all bg-white disabled:bg-gray-100"
                >
                  <option value="">{categoriesLoading ? "Loading categories..." : "Select a category"}</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCustomCategory(true)}
                  className="px-3 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors text-sm font-medium flex items-center gap-1"
                >
                  <FaTimes className="rotate-45" size={12} /> Add
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter new category name"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (customCategory.trim()) {
                      const newCat = customCategory.trim();
                      // Save to Firestore
                      await saveCategory(newCat, productType);
                      // Update local state
                      if (productType === "bangles") {
                        setBangleCategories(prev => [...prev, newCat].sort());
                      } else {
                        setDressCategories(prev => [...prev, newCat].sort());
                      }
                      // Set as selected category
                      setFormData((prev) => ({ ...prev, category: newCat }));
                      setShowCustomCategory(false);
                      setCustomCategory("");
                      setMessage({ type: "success", text: `Category "${newCat}" added successfully!` });
                      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
                    }
                  }}
                  className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomCategory(false);
                    setCustomCategory("");
                  }}
                  className="px-3 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors text-sm font-medium"
                >
                  ✕
                </button>
              </div>
            )}
            {formData.category && !categories.includes(formData.category) && (
              <p className="text-xs text-pink-600 mt-1">Custom category: {formData.category}</p>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Note (Optional)
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              rows={2}
              placeholder="Add any special notes or instructions..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          {/* Size-Based Pricing (Only for Bangles) */}
          {productType === "bangles" && (
            <div className="border-2 border-pink-200 rounded-lg p-4 bg-pink-50/30">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                <FaRuler className="inline mr-2" />
                Size-Based Pricing
              </label>
              
              <p className="text-xs text-gray-600 mb-2">
                Add price for each size. Sizes without price will not be shown to customers.
              </p>

              {formData.originalPrice && formData.discountedPrice && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      sizeVariants: prev.sizeVariants.map(sv => ({
                        ...sv,
                        originalPrice: sv.originalPrice || prev.originalPrice,
                        discountedPrice: sv.discountedPrice || prev.discountedPrice,
                      }))
                    }));
                  }}
                  className="mb-3 w-full py-1.5 text-xs font-medium text-white bg-pink-500 rounded-lg hover:bg-pink-600 transition-colors"
                >
                  Apply base price (₹{formData.originalPrice} / ₹{formData.discountedPrice}) to empty sizes
                </button>
              )}

              <div className="space-y-2">
                {formData.sizeVariants.map((variant, index) => (
                  <div key={index} className="bg-white rounded-md p-3 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={variant.size}
                        onChange={(e) => {
                          const updated = [...formData.sizeVariants];
                          updated[index].size = e.target.value;
                          setFormData((prev) => ({ ...prev, sizeVariants: updated }));
                        }}
                        className="bg-pink-500 text-white px-3 py-1 rounded text-sm font-bold w-20 text-center outline-none focus:ring-2 focus:ring-pink-300 placeholder-pink-200"
                        placeholder="Size"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.sizeVariants.filter((_, i) => i !== index);
                          setFormData((prev) => ({ ...prev, sizeVariants: updated }));
                        }}
                        className="ml-auto text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Original Price (₹)
                        </label>
                        <input
                          type="number"
                          placeholder="Enter price"
                          value={variant.originalPrice}
                          onChange={(e) => {
                            const updated = [...formData.sizeVariants];
                            updated[index].originalPrice = e.target.value;
                            setFormData((prev) => ({ ...prev, sizeVariants: updated }));
                          }}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Discounted Price (₹)
                        </label>
                        <input
                          type="number"
                          placeholder="Enter price"
                          value={variant.discountedPrice}
                          onChange={(e) => {
                            const updated = [...formData.sizeVariants];
                            updated[index].discountedPrice = e.target.value;
                            setFormData((prev) => ({ ...prev, sizeVariants: updated }));
                          }}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>
                    {variant.originalPrice && variant.discountedPrice && (
                      <div className="mt-2 text-xs text-green-600 font-medium text-center">
                        {Math.round(((variant.originalPrice - variant.discountedPrice) / variant.originalPrice) * 100)}% OFF
                      </div>
                    )}
                    {(!variant.originalPrice || !variant.discountedPrice) && (
                      <div className="mt-2 text-xs text-orange-500 font-medium text-center">
                        ⚠ Add both prices or this size won't be shown
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    sizeVariants: [...prev.sizeVariants, { size: "", originalPrice: "", discountedPrice: "" }]
                  }));
                }}
                className="mt-3 w-full py-2 text-sm font-medium text-pink-600 bg-white border-2 border-dashed border-pink-300 rounded-lg hover:bg-pink-50 transition-colors"
              >
                + Add Size
              </button>
            </div>
          )}

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Original Price (₹) *
              </label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleInputChange}
                required
                min="0"
                placeholder="2499"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Discounted Price (₹) *
              </label>
              <input
                type="number"
                name="discountedPrice"
                value={formData.discountedPrice}
                onChange={handleInputChange}
                required
                min="0"
                placeholder="1799"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Discount Preview */}
          {formData.originalPrice && formData.discountedPrice && (
            <div className="bg-green-50 border border-green-200 rounded-md p-2 text-center">
              <span className="text-green-700 text-sm font-medium">
                💰 {Math.round(
                  ((formData.originalPrice - formData.discountedPrice) /
                    formData.originalPrice) *
                    100
                )}% OFF
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-md text-sm font-semibold text-white transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow hover:shadow-md"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {uploadProgress || "Uploading..."}
              </span>
            ) : (
              "✨ Add Product"
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="text-center mt-4">
          <a
            href="/admin"
            className="text-pink-500 hover:text-pink-600 text-sm font-medium"
          >
            ← Back to Admin
          </a>
        </div>
      </div>
    </div>
  );
}
