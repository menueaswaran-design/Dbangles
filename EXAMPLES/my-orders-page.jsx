// Example 2: View User's Orders Page
"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import ProtectedRoute from "@/lib/ProtectedRoute";

function MyOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  const fetchUserOrders = async () => {
    try {
      // Fetch orders for this specific user
      const response = await fetch(`/api/orders?userId=${user.uid}`);
      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading your orders...</div>;

  return (
    <div>
      <h1>My Orders</h1>
      <p>Welcome, {user?.email}</p>
      
      {orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <div>
          {orders.map((order) => (
            <div key={order.id} className="border p-4 mb-4">
              <h3>Order ID: {order.id}</h3>
              <p>Customer: {order.customerName}</p>
              <p>Phone: {order.phoneNumber}</p>
              <p>Products: {order.orderedProducts?.length}</p>
              {/* Display more order details */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Wrap with ProtectedRoute to require login
export default function Page() {
  return (
    <ProtectedRoute>
      <MyOrdersPage />
    </ProtectedRoute>
  );
}
