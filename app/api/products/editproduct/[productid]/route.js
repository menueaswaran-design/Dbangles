import { doc, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

/* ===========================
   PATCH → Edit Product by ID
=========================== */
export async function PATCH(request, context) {
    try {
        const productId = context?.params?.productId;
        if (!productId) {
            return NextResponse.json(
                { success: false, error: "Product ID is required" },
                { status: 400 }
            );
        }

        const body = await request.json();
        if (!body || Object.keys(body).length === 0) {
            return NextResponse.json(
                { success: false, error: "No update data provided" },
                { status: 400 }
            );
        }

        const docRef = doc(db, "products", productId);
        await updateDoc(docRef, body);

        return NextResponse.json({
            success: true,
            message: "Product updated successfully",
        });
    } catch (error) {
        console.error("Error updating product:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update product" },
            { status: 500 }
        );
    }
}
