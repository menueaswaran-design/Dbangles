import { addDoc, serverTimestamp, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Enable CORS for /api/orders
export async function OPTIONS(req) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
      userId, // Add userId
      userEmail, // Add userEmail for easy identification
      size, // Product size
      shipping, // Shipping charge (default 70)
    } = body;

    // Basic validation
    if (!Array.isArray(orderedProducts) || orderedProducts.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Ordered product is not selected" }),
        { status: 400, headers }
      );
    }
    if (!customerName || !phoneNumber) {
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
      userId, // Add userId to order
      userEmail, // Add userEmail to order
      size: size || "", // Product size
      shipping: shipping || 70, // Shipping charge, default 70
      orderStatus: "Placed", // Default status
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



// GET all orders or filter by userId
export async function GET(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const userId = searchParams.get('userId'); // Get userId from query params
    
    console.log("Fetching orders with userId:", userId); // Debug log
    
    const querySnapshot = await getDocs(collection(db, "orders"));
    let orders = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
    console.log("Total orders fetched:", orders.length); // Debug log
    
    // Filter by userId if provided
    if (userId) {
      orders = orders.filter((order) => order.userId === userId);
      console.log("Filtered orders for user:", orders.length); // Debug log
    }
    
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
    console.error("Error fetching orders:", error); // Better error logging
    return new Response(JSON.stringify({ error: 'Failed to fetch orders' }), { status: 500, headers });
  }
}
