// Enable CORS for /api/orders
export async function OPTIONS(req) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

import { addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
  try {
    const body = await req.json();
    console.log("Received order payload:", body);
    const {
      customerName,
      phoneNumber,
      whatsappNumber,
      deliveryAddress,
      landmark,
      city,
      pincode,
      orderMessage,
      orderedProducts, // plural
    } = body;

    // Basic validation
    if (
      !customerName ||
      !phoneNumber ||
      !Array.isArray(orderedProducts) ||
      orderedProducts.length === 0
    ) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers }
      );
    }

    const newOrder = {
      customerName,
      phoneNumber,
      whatsappNumber,
      deliveryAddress,
      landmark,
      city,
      pincode,
      orderMessage,
      orderedProducts,
      createdAt: serverTimestamp(),
    };
    console.log("Order to be saved:", newOrder);

    const docRef = await addDoc(collection(db, "orders"), newOrder);
    console.log("Order saved with ID:", docRef.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Order created successfully",
        orderId: docRef.id,
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to create order" }),
      { status: 500, headers }
    );
  }
}



import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";


// GET all orders or a single order by id from Firestore
export async function GET(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const querySnapshot = await getDocs(collection(db, "orders"));
    const orders = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    if (orderId) {
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        return new Response(JSON.stringify(order), { status: 200, headers });
      } else {
        return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers });
      }
    }
    return new Response(JSON.stringify(orders), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch orders' }), { status: 500, headers });
  }
}
