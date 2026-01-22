
"use client";
import React, { use, useEffect, useState } from "react";

const API_URL = typeof window !== "undefined"
  ? `${window.location.protocol}//${window.location.hostname}/api/orders`
  : "https://dbangles.vercel.app/api/orders";

const statusColor = {
  Placed: "bg-yellow-100 text-yellow-700 animate-pulse",
  Packed: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700 animate-bounce",
  Delivered: "bg-green-100 text-green-700"
};


const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Orders</h1>
      {loading && <div>Loading orders...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Products</th>
                  <th className="px-4 py-3">Order Message</th>
                  <th className="px-4 py-3">Placed / Needed</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderId} className="border-b hover:bg-gray-50 transition-all duration-200">
                    <td className="px-4 py-3 font-medium">{order.orderId}</td>
                    <td className="px-4 py-3">{order.customerName}</td>
                    <td className="px-4 py-3 space-y-1">
                      <p>{order.phoneNumber}</p>
                      <a
                        href={`https://wa.me/91${order.whatsappNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-green-600 hover:underline text-xs"
                      >
                        WhatsApp
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.deliveryAddress}</td>
                    <td className="px-4 py-3">
                      {order.orderedProducts?.map((p, idx) => (
                        <p key={idx} className="text-gray-700">{p.name} × {p.quantity}</p>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.orderMessage || "—"}</td>
                    <td className="px-4 py-3 text-gray-700">
                      <p>{order.orderPlacedDate}</p>
                      <p className="text-xs text-gray-500">Needed: {order.neededDate}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[order.orderStatus]}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select className="border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-black">
                        <option>Placed</option>
                        <option>Packed</option>
                        <option>Shipped</option>
                        <option>Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white shadow-lg rounded-2xl p-4 hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
              >
                {/* Header: Customer + Status */}
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-semibold text-lg text-gray-800">{order.customerName}</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[order.orderStatus]}`}
                  >
                    {order.orderStatus}
                  </span>
                </div>

                {/* Contact & Delivery */}
                <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-1">
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold">Order ID:</span> {order.orderId}
                  </p>
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold">Phone:</span> {order.phoneNumber} |{" "}
                    <a
                      href={`https://wa.me/91${order.whatsappNumber}`}
                      className="text-green-600 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      WhatsApp
                    </a>
                  </p>
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold">Delivery:</span> {order.deliveryAddress}
                  </p>
                </div>

                {/* Products */}
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  <p className="font-semibold text-gray-800 text-sm mb-1">Products:</p>
                  <ul className="list-disc list-inside text-gray-700 text-sm space-y-0.5">
                    {order.orderedProducts?.map((p, idx) => (
                      <li key={idx}>
                        {p.name} × <span className="font-medium">{p.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Order Message */}
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  <p className="font-semibold text-gray-800 text-sm mb-1">Message:</p>
                  <p className="text-gray-700 text-sm">{order.orderMessage || "—"}</p>
                </div>

                {/* Dates */}
                <div className="flex justify-between text-gray-600 text-sm mb-3">
                  <p>
                    <span className="font-semibold">Placed:</span> {order.orderPlacedDate}
                  </p>
                  <p>
                    <span className="font-semibold">Needed:</span> {order.neededDate}
                  </p>
                </div>

                {/* Action */}
                <select className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-1 focus:ring-gray-400">
                  <option>Placed</option>
                  <option>Packed</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                </select>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminOrderList;
