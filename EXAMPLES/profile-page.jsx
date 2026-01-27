// Example 3: Another Protected Route (e.g., Profile Page)
"use client";
import { useAuth } from "@/lib/AuthContext";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { logOut } from "@/lib/auth";
import { useRouter } from "next/navigation";

function ProfileContent() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logOut();
    router.push("/");
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="bg-white p-6 rounded shadow">
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>User ID:</strong> {user?.uid}</p>
        <p><strong>Display Name:</strong> {user?.displayName || "Not set"}</p>
        <button 
          onClick={handleLogout}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
