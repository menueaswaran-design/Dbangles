import { doc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

/* ===========================
	 GET → Product by ID
=========================== */
export async function GET(request, context) {
	try {
		let productId = context?.params?.productId;
		// Fallback: extract productId from URL if not present in params
		if (!productId) {c
			const urlParts = request.url.split("/");
			// Find the index of 'products' and get the next part
			const productsIdx = urlParts.findIndex((part) => part === "products");
			if (productsIdx !== -1 && urlParts.length > productsIdx + 1) {
				productId = urlParts[productsIdx + 1].split("?")[0];
			}
		}
		if (!productId) {
			return NextResponse.json(
				{ success: false, error: "Product ID is required" },
				{ status: 400 }
			);
		}
		const docRef = doc(db, "products", productId);
		const docSnap = await getDoc(docRef);
		if (!docSnap.exists()) {
			return NextResponse.json(
				{ success: false, error: "Product not found" },
				{ status: 404 }
			);
		}
		return NextResponse.json({
			success: true,
			product: { id: docSnap.id, ...docSnap.data() },
		});
	} catch (error) {
		console.error("Error fetching product by ID:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch product" },
			{ status: 500 }
		);
	}
}
