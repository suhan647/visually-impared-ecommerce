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
            price: Number(data.price) || 0,
            stock: Number(data.stock) || 0
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

  const categories = ['All', ...new Set(products.map(product => product.category))];

  const ProductCard = ({ product }) => {
    const handleProductInteraction = () => {
      speak(`Product: ${product.name}, Category: ${product.category}, Price: ${product.price}, Stock: ${product.stock}`);
    };

    return (
      <div className={`group relative bg-white shadow-lg rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border ${highContrastMode ? 'border-blue-500 bg-gray-900 text-white' : 'border-gray-200'}`}>
        <div className="relative overflow-hidden">
          <img src={product.imageUrl} alt={product.name} className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110" />
        </div>
        <div className="p-6">
          <h3 className={`text-xl font-bold truncate ${highContrastMode ? 'text-blue-300' : 'text-gray-800'}`}>{product.name}</h3>
          <p className={`text-lg font-semibold mt-2 ${highContrastMode ? 'text-blue-300' : 'text-green-600'}`}>${(product.price || 0).toFixed(2)}</p>
          <p className={`text-sm ${highContrastMode ? 'text-gray-300' : 'text-gray-500'}`}>{product.stock || 0} in stock</p>
          <div className="flex mt-4 space-x-3">
            <button onClick={() => addToCart(product)} className="flex-1 py-3 rounded-lg bg-blue-500 text-white font-bold uppercase tracking-wide hover:bg-blue-600 transition-all"><FaShoppingCart className="mr-2" /> Add to Cart</button>
            <button onClick={handleProductInteraction} className="p-3 rounded-lg bg-gray-200 text-blue-600 hover:bg-gray-300 transition-all"><FaEye /></button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen py-12 px-6 ${highContrastMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-4xl font-bold ${highContrastMode ? 'text-blue-400' : 'text-gray-800'}`}>Our Products</h1>
          <button onClick={toggleHighContrast} className="p-3 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"><FaAdjust /></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.length === 0 ? <p className="text-center text-gray-500">No products found.</p> : filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </div>
  );
}
