'use client'
import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { speak } from '@/lib/speech';
import { FaShoppingCart, FaEye, FaAdjust } from 'react-icons/fa';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/app/context/AuthContext';

export default function AccessibleProductsPage() {
  const [products, setProducts] = useState([]);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const db = getFirestore(app);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(getFirestore(app), "products");
        const productsSnapshot = await getDocs(productsCollection);
        const productsList = productsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            price: Number(data.price) || 0, // Ensure price is a number
            stock: Number(data.stock) || 0 // Ensure stock is a number
          };
        });
        setProducts(productsList);
        setFilteredProducts(productsList);
        speak(`Loaded ${productsList.length} products`);
      } catch (error) {
        console.error("Error fetching products:", error);
        speak("Error fetching products. Please try again.");
      }
    };
    fetchProducts();
  }, []);

  // Filter products based on search and category
  useEffect(() => {
    let result = products;

    if (selectedCategory !== 'All') {
      result = result.filter(product => product.category === selectedCategory);
    }

    if (searchTerm) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, products]);

  const toggleHighContrast = () => {
    const newMode = !highContrastMode;
    setHighContrastMode(newMode);
    speak(newMode ? "High contrast mode enabled" : "High contrast mode disabled");
  };

  const addToCart = async (product) => {
    if (!user) {
      speak("Please log in to add items to the cart.");
      return;
    }

    const userId = user.uid;
    const cartRef = doc(db, "carts", userId);

    try {
      const cartDoc = await getDoc(cartRef);
      let cartItems = cartDoc.exists() ? cartDoc.data().items || {} : {};

      cartItems[product.id] = cartItems[product.id]
        ? { ...cartItems[product.id], quantity: cartItems[product.id].quantity + 1 }
        : { ...product, quantity: 1 };

      await setDoc(cartRef, { items: cartItems });

      speak(`Added ${product.name} to cart`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      speak("Error adding product to cart. Please try again.");
    }
  };

  // Get unique categories
  const categories = ['All', ...new Set(products.map(product => product.category))];

  const ProductCard = ({ product }) => {
    const handleProductInteraction = () => {
      speak(`Product: ${product.name}, Category: ${product.category}, Price: ${product.price}, Stock: ${product.stock}`);
    };

    return (
      <div
        className={`
          group relative bg-white shadow-lg rounded-xl overflow-hidden
          transition-all duration-300 hover:shadow-2xl
          ${highContrastMode ? 'border-2 border-blue-500' : 'hover:-translate-y-2'}
        `}
      >
        <div className="relative overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3
              className={`
                text-xl font-bold truncate
                ${highContrastMode ? 'text-blue-300' : 'text-gray-800'}
              `}
            >
              {product.name}
            </h3>
            <span
              className={`
                text-sm font-medium px-3 py-1 rounded-full
                ${highContrastMode
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-100 text-blue-800'}
              `}
            >
              {product.category}
            </span>
          </div>

          <div className="flex justify-between items-center mb-4">
            <span
              className={`
                text-2xl font-bold
                ${highContrastMode ? 'text-blue-300' : 'text-green-600'}
              `}
            >
              ${(product.price || 0).toFixed(2)}
            </span>
            <span
              className={`
                text-sm font-medium
                ${highContrastMode ? 'text-gray-300' : 'text-gray-500'}
              `}
            >
              {product.stock || 0} in stock
            </span>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => addToCart(product)}
              className={`
                flex-1 py-3 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center justify-center
                transition-all duration-300
                ${highContrastMode
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}
              `}
            >
              <FaShoppingCart className="mr-2" /> Add to Cart
            </button>
            <button
              onClick={handleProductInteraction}
              className={`
                p-3 rounded-lg
                transition-all duration-300
                ${highContrastMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}
              `}
            >
              <FaEye />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`
        min-h-screen py-12 px-6
        ${highContrastMode
          ? 'bg-gray-900 text-white'
          : 'bg-gray-50'}
      `}
    >
      {/* Header and Controls */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex justify-between items-center mb-8">
          <h1
            className={`
              text-4xl font-bold
              ${highContrastMode ? 'text-blue-400' : 'text-gray-800'}
            `}
          >
            Our Products
          </h1>

          <div className="flex items-center space-x-4">
            {/* High Contrast Toggle */}
            <button
              onClick={toggleHighContrast}
              className={`
                p-2 rounded-full
                ${highContrastMode
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'}
              `}
            >
              <FaAdjust />
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex space-x-4 mb-8">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`
              flex-1 px-4 py-3 rounded-lg
              ${highContrastMode
                ? 'bg-gray-800 text-white border-blue-500 border'
                : 'bg-white border border-gray-300'}
            `}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`
              px-4 py-3 rounded-lg
              ${highContrastMode
                ? 'bg-gray-800 text-white border-blue-500 border'
                : 'bg-white border border-gray-300'}
            `}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto">
        {filteredProducts.length === 0 ? (
          <div
            className={`
              text-center py-12
              ${highContrastMode ? 'text-gray-300' : 'text-gray-500'}
            `}
          >
            No products found.
          </div>
        ) : (
          <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
