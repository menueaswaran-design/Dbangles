import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { NextResponse } from "next/server";

// Firebase config for server-side
const firebaseConfig = {
  apiKey: "AIzaSyD4woEevaPGv7PUHOQrxehVYiEaIXcyq6s",
  authDomain: "dbangles-94906.firebaseapp.com",
  projectId: "dbangles-94906",
  storageBucket: "dbangles-94906.firebasestorage.app",
  messagingSenderId: "691280572993",
  appId: "1:691280572993:web:c96e17a2d935f55b6bccc0",
};

// Initialize Firebase for server
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

/* ===========================
   GET → All products
=========================== */
export async function GET() {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    const products = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      products: products,
      count: products.length,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

/* ===========================
   POST → Create order
=========================== */
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      customerName,
      phoneNumber,
      whatsappNumber,
      deliveryAddress,
      landmark,
      city,
      pincode,
      orderMessage,
      orderedProduct,
      size,
      shipping,
    } = body;

    // Basic validation
    if (!customerName || !phoneNumber || !orderedProduct?._id) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
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
      orderedProduct: {
        _id: orderedProduct._id,
        name: orderedProduct.name,
      },
      size: size || "",
      shipping: shipping || 70,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "orders"), newOrder);

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      orderId: docRef.id,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
