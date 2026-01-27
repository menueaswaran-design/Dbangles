import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function PATCH(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const body = await req.json();
    const { orderId, orderStatus } = body;

    console.log("Update request received:", { orderId, orderStatus });

    // Validation
    if (!orderId || !orderStatus) {
      console.error("Missing required fields:", { orderId, orderStatus });
      return new Response(
        JSON.stringify({ success: false, error: "Missing orderId or orderStatus" }),
        { status: 400, headers }
      );
    }

    // Validate status values
    const validStatuses = ['Placed', 'Packed', 'Shipped', 'Delivered'];
    if (!validStatuses.includes(orderStatus)) {
      console.error("Invalid status:", orderStatus);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid order status" }),
        { status: 400, headers }
      );
    }

    // Update the order status in Firestore
    const orderRef = doc(db, "orders", orderId);
    console.log("Updating document:", orderId);
    
    await updateDoc(orderRef, {
      orderStatus: orderStatus,
      updatedAt: new Date().toISOString()
    });

    console.log("Successfully updated order:", orderId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Order status updated successfully",
        orderId,
        orderStatus
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Error updating order status:", error);
    console.error("Error details:", error.message, error.stack);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Failed to update order status",
        details: error.message 
      }),
      { status: 500, headers }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
