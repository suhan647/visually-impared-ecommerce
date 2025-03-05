'use client'
import React, { useState, useEffect, useRef } from 'react';
import { getFirestore, collection, getDocs, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { speak, stopSpeaking } from '@/lib/speech';
import { FaShoppingCart, FaEye, FaAdjust, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/app/context/AuthContext';

export default function AccessibleProductsPage() {
  const [products, setProducts] = useState([]);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const productRefs = useRef({});
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
            price: Number(data.price) || 0,
            stock: Number(data.stock) || 0
          };
        });
        setProducts(productsList);
        setFilteredProducts(productsList);
  
        if (isInitialLoad) {
          stopSpeaking();
          speak(`Welcome to our Products Page. We have ${productsList.length} products available for you to explore.`);
          
          if (productsList.length > 0) {
            setTimeout(() => {
              speakProductDetails(productsList[0]);
            }, 2000);
          }
          
          setIsInitialLoad(false);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        speak("Error fetching products. Please try again.");
      }
    };
  
    fetchProducts();
  
    return () => {
      stopSpeaking();
    };
  }, [isInitialLoad]);

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
    setCurrentProductIndex(0);
  }, [searchTerm, selectedCategory, products]);

  const speakProductDetails = (product) => {
    stopSpeaking();
    speak(`Product: ${product.name}. Price: ${product.price} dollars. Category: ${product.category}. Stock: ${product.stock} items available.`);
  };

  const toggleHighContrast = () => {
    const newMode = !highContrastMode;
    setHighContrastMode(newMode);
    speak(newMode ? "High contrast mode enabled" : "High contrast mode disabled");
  };

  const handleKeyboardNavigation = (e) => {
    if (e.key === 'Enter') {
      const nextIndex = (currentProductIndex + 1) % filteredProducts.length;
      setCurrentProductIndex(nextIndex);
      speakProductDetails(filteredProducts[nextIndex]);
    }
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

      // Speak when product is added to cart
      stopSpeaking();
      speak(`${product.name} has been added to your cart`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      speak("Error adding product to cart. Please try again.");
    }
  };

  const categories = ['All', ...new Set(products.map(product => product.category))];

  const ProductCard = ({ product, index }) => {
    const handleImageHover = () => {
      speakProductDetails(product);
    };

    return (
      <div
        ref={el => productRefs.current[index] = el}
        tabIndex={0}
        className={`
          group relative bg-white shadow-lg rounded-2xl overflow-hidden
          transition-all duration-300 hover:shadow-2xl
          focus:outline-none focus:ring-4 
          ${highContrastMode ? 'border-2 border-blue-500' : 'hover:-translate-y-2'}
          ${index === currentProductIndex ? 'ring-4 ring-blue-300' : ''}
        `}
      >
        <div className="relative overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            onMouseEnter={handleImageHover}
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
              onClick={() => speakProductDetails(product)}
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
      tabIndex={0}
      onKeyDown={handleKeyboardNavigation}
      className={`
        min-h-screen py-12 px-6
        ${highContrastMode
          ? 'bg-gray-900 text-white'
          : 'bg-gray-50'}
      `}
    >
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex justify-between items-center mb-8">
          <h1
            className={`
              text-4xl font-bold tracking-tight
              ${highContrastMode ? 'text-blue-400' : 'text-gray-800'}
            `}
          >
            Our Products
          </h1>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleHighContrast}
              aria-label={highContrastMode ? "Disable High Contrast" : "Enable High Contrast"}
              className={`
                p-2 rounded-full transition-colors duration-300
                ${highContrastMode
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
              `}
            >
              <FaAdjust />
            </button>
          </div>
        </div>

        <div className="flex space-x-4 mb-8">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`
              flex-1 px-4 py-3 rounded-lg
              transition-all duration-300 focus:ring-4 focus:ring-blue-200
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
              transition-all duration-300 focus:ring-4 focus:ring-blue-200
              ${highContrastMode
                ? 'bg-gray-800 text-white border-blue-500 border'
                : 'bg-white border border[SystemGrayLight2]'}
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  index={index}
                />
              ))}
            </div>
            
            <div className="text-center mt-8 text-sm text-gray-500">
              <p>
                Press <kbd className="bg-gray-200 px-2 py-1 rounded mx-1">Enter</kbd> 
                to navigate through products
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}