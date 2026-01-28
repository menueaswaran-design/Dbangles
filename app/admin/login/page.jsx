"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogle, isAdmin, onAuthChange } from "@/lib/auth";
import { FaGoogle } from "react-icons/fa";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Check if already logged in as admin
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user && isAdmin(user)) {
        router.push("/admin");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const { user, error } = await signInWithGoogle();

      if (error) {
        setError(error);
        setLoading(false);
        return;
      }

      if (user) {
        // Check if user is admin
        if (isAdmin(user)) {
          router.push("/admin");
        } else {
          setError("Access denied. You are not authorized as an admin.");
          setLoading(false);
        }
      }
    } catch (err) {
      setError("Failed to sign in. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Login
          </h1>
          <p className="text-gray-600">
            Sign in with your authorized Google account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {loading ? (
            <div className="w-6 h-6 border-3 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <>
              <FaGoogle className="text-xl text-red-500" />
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        {/* Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            ⚠️ Only authorized admin accounts can access the admin panel.
            <br />
            Contact the system administrator to get admin access.
          </p>
        </div>
      </div>
    </div>
  );
}
