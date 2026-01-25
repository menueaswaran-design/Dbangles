import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function GET(request) {
  try {

    // Extract phoneNumber from the URL path
    const url = new URL(request.url);
    // Assumes route is /api/orders/[phoneNumber]
    const segments = url.pathname.split("/");
    const phoneNumber = segments[segments.length - 1];

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: "phoneNumber is required" },
        { status: 400 }
      );
    }

    const ordersRef = collection(db, "orders");

    const q = query(
      ordersRef,
      where("phoneNumber", "==", phoneNumber),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, error: "No orders found" },
        { status: 404 }
      );
    }

    const latestOrderDoc = snapshot.docs[0];
    return NextResponse.json({
      success: true,
      id: latestOrderDoc.id,
    });

  } catch (error) {
    console.error("Error fetching latest order ID:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
