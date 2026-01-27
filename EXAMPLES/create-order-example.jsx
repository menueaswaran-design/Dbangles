// Example 1: Create Order Page (with user info)
"use client";
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";

export default function CreateOrderExample() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    customerName: "",
    phoneNumber: "",
    // ... other fields
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert("Please login first");
      return;
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId: user.uid, // Add user ID
          userEmail: user.email, // Add user email
          orderedProducts: [/* your products */],
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Order created successfully!");
      }
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      <button type="submit">Place Order</button>
    </form>
  );
}
