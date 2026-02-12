"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
export default function AdminDashboard() {
const [count , setCount] = useState(0);
const [loading, setLoading] = useState(true);

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
      setCount(productsData.length);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };


  const API_URL = "/api/orders";
  

  
  

    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch(API_URL);
          if (!res.ok) throw new Error("Failed to fetch orders");
          const data = await res.json();
          setOrders(data.length);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }, []);


  return (
    <div className="min-h-screen bg-gray-50 px-6 py-6">
      <div className="mx-auto max-w-7xl space-y-8">
       
        {/* ================= HEADER ================= */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage products, orders and operations
            </p>
          </div>
        </header>

        {/* ================= STATS ROW ================= */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-2">
          <Stat title="Products" value={loading ? " " : count} />
          <Stat title="Orders" value={orders} />
        </section>

        {/* ================= PRIMARY ACTION ================= */}
        <Link
          href="/admin/add-product"
          className="group relative flex items-center justify-between rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-7 py-6 text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-xl font-semibold">
              +
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                Add New Product
              </h2>
              <p className="text-sm text-white/80">
                Create and publish products instantly
              </p>
            </div>
          </div>
          <span className="text-xl text-white/70 transition group-hover:translate-x-1">
            →
          </span>
        </Link>

        {/* ================= MANAGE ================= */}
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Manage
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ManageCard
              href="/admin/products"
              title="Products"
              desc="Catalog & inventory"
            />
            <ManageCard
              href="/admin/orders"
              title="Orders"
              desc="Fulfillment & tracking"
            />
          </div>
        </section>

        {/* ================= QUICK ACTIONS ================= */}
        <section className="rounded-2xl border bg-white px-6 py-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Quick Actions
            </p>
            <Link
              href="/admin/products"
              className="text-xs font-medium text-gray-600 hover:text-gray-900"
            >
              View catalog →
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <QuickBtn label="Add Bangles" />
            <QuickBtn label="Add Sarees" />
          </div>
        </section>

      </div>
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function Stat({ title, value, highlight }) {
  return (
    <div className="rounded-2xl border bg-white px-5 py-4 shadow-sm transition hover:shadow-md">
      <p className="text-xs font-medium text-gray-500">{title}</p>
      <p
        className={`mt-2 text-2xl font-semibold ${
          highlight ? "text-purple-600" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ManageCard({ href, title, desc }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-2xl border bg-white px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          {title}
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          {desc}
        </p>
      </div>
      <span className="text-lg text-gray-300 transition group-hover:text-gray-500 group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}

function QuickBtn({ label }) {
  return (
    <Link
      href="/admin/add-product"
      className="rounded-full bg-gray-100 px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-200 hover:text-gray-900"
    >
      + {label}
    </Link>
  );
}
