
"use client";
import React, { useEffect, useState } from "react";

const API_URL = "/api/orders";

const statusConfig = {
  Placed: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    badge: "bg-yellow-100 text-yellow-800"
  },
  Packed: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-800"
  },
  Shipped: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-800"
  },
  Delivered: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    badge: "bg-green-100 text-green-800"
  }
};

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : [data]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      console.log("Updating order:", orderId, "to status:", newStatus);
      
      const res = await fetch("/api/orders/update-status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          orderStatus: newStatus,
        }),
      });

      const data = await res.json();
      console.log("API Response:", data);

      if (data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, orderStatus: newStatus } : order
          )
        );
      } else {
        console.error("API Error:", data.error);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 md:p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Loading orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 md:p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-red-600 text-lg mb-1">⚠️ Error</div>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Order Management</h1>
          <p className="text-sm text-gray-600">Total: <span className="font-semibold">{orders.length}</span></p>
        </div>

        {/* Orders List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {orders.map((order) => {
            const statusStyle = statusConfig[order.orderStatus] || statusConfig.Placed;
            const isExpanded = expandedOrder === order.id;
            
            return (
              <div
                key={order.id}
                className={`bg-white border ${statusStyle.border} rounded-lg shadow-sm`}
              >
                {/* Header */}
                <div className={`${statusStyle.bg} px-3 py-2 border-b ${statusStyle.border}`}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-gray-900">{order.customerName}</h3>
                    <span className={`${statusStyle.badge} px-2 py-1 rounded-full text-xs font-bold`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                {/* Compact Info */}
                <div className="p-3 space-y-2">
                  {/* Products */}
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs font-semibold text-gray-500 mb-1">PRODUCTS</p>
                    <div className="space-y-1">
                      {order.orderedProducts?.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-gray-900">{p.name}</span>
                          <span className="bg-gray-900 text-white px-1.5 py-0.5 rounded text-xs font-bold">× {p.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order ID */}
                  <div className="text-xs text-gray-600">
                    <span className="font-semibold">Order ID:</span> <span className="font-mono">{order.id}</span>
                  </div>

                  {/* Phone Number */}
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-gray-600">Phone:</span> <span className="text-gray-900">{order.phoneNumber}</span>
                    </div>
                    <a
                      href={`https://wa.me/91${order.whatsappNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium"
                    >
                      💬 WhatsApp
                    </a>
                  </div>

                  {/* More Details Button */}
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded text-xs font-medium transition-colors"
                  >
                    {isExpanded ? "Hide Details ▲" : "More Details ▼"}
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="space-y-2 pt-2 border-t">
                      {/* Address Details */}
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs font-semibold text-gray-500 mb-1">DELIVERY ADDRESS</p>
                        <p className="text-xs text-gray-900 mb-1">{order.deliveryAddress}</p>
                        <div className="grid grid-cols-3 gap-2 mt-1.5">
                          {order.landmark && (
                            <div>
                              <p className="text-xs text-gray-500">Landmark</p>
                              <p className="text-xs font-medium text-gray-900">{order.landmark}</p>
                            </div>
                          )}
                          {order.city && (
                            <div>
                              <p className="text-xs text-gray-500">City</p>
                              <p className="text-xs font-medium text-gray-900">{order.city}</p>
                            </div>
                          )}
                          {order.pincode && (
                            <div>
                              <p className="text-xs text-gray-500">Pincode</p>
                              <p className="text-xs font-medium text-gray-900">{order.pincode}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Current Status */}
                      <div className={`${statusStyle.bg} border ${statusStyle.border} rounded p-2`}>
                        <p className="text-xs font-semibold text-gray-500 mb-1">CURRENT STATUS</p>
                        <div className="flex items-center gap-1">
                          <span className="text-base">
                            {order.orderStatus === 'Placed' && '📦'}
                            {order.orderStatus === 'Packed' && '📋'}
                            {order.orderStatus === 'Shipped' && '🚚'}
                            {order.orderStatus === 'Delivered' && '✅'}
                          </span>
                          <span className={`${statusStyle.text} text-sm font-bold`}>{order.orderStatus}</span>
                        </div>
                      </div>

                      {/* Message */}
                      {order.orderMessage && (
                        <div className="bg-gray-50 rounded p-2">
                          <p className="text-xs font-semibold text-gray-500 mb-1">MESSAGE</p>
                          <p className="text-xs text-gray-900">{order.orderMessage}</p>
                        </div>
                      )}

                      {/* Status Update */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">UPDATE STATUS</p>
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-gray-900"
                        >
                          <option value="Placed">📦 Placed</option>
                          <option value="Packed">📋 Packed</option>
                          <option value="Shipped">🚚 Shipped</option>
                          <option value="Delivered">✅ Delivered</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {orders.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-4xl mb-2">📦</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Orders Yet</h3>
            <p className="text-sm text-gray-600">Orders will appear here once customers place them.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrderList;