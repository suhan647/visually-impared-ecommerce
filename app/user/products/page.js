"use client";

import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { speak } from "@/lib/speech";

const db = getFirestore(app);

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, "products");
        const productsSnapshot = await getDocs(productsCollection);
        const productsList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsList);
        speak(`Loaded ${productsList.length} products`);
      } catch (error) {
        console.error("Error fetching products:", error);
        speak("Error fetching products. Please try again.");
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="bg-gradient-to-b from-blue-600 to-blue-900 min-h-screen p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-white mb-6">🛍️ Available Products</h1>

      {products.length === 0 ? (
        <p className="text-lg text-gray-200">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          {products.map(product => (
            <div
              key={product.id}
              className="bg-white p-6 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-yellow-400"
              tabIndex={0} // ✅ Keyboard focusable
              onMouseEnter={() => speak(`Product: ${product.name}, Price: ${product.price}`)}
              onClick={() => speak(`Product: ${product.name}, Category: ${product.category}, Price: ${product.price}, Stock: ${product.stock}`)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  speak(`Product: ${product.name}, Category: ${product.category}, Price: ${product.price}, Stock: ${product.stock}`);
                }
              }}
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-48 object-cover rounded-md"
              />
              <h2 className="text-2xl font-bold text-gray-900 mt-3">{product.name}</h2>
              <p className="text-md text-gray-600">Category: <span className="font-semibold">{product.category}</span></p>
              <p className="text-xl font-semibold text-green-600 mt-2">💰 ${product.price}</p>
              <p className="text-md text-gray-500">Stock: {product.stock}</p>
              <button
                className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded-full text-lg font-semibold hover:bg-yellow-600 transition duration-300"
                onClick={() => speak(`Added ${product.name} to cart`)}
              >
                🛒 Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
