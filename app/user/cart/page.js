'use client';
import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { useAuth } from '@/app/context/AuthContext';
import { FaTrash, FaPlus, FaMinus, FaShoppingCart } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { speak, stopSpeaking } from '@/lib/speech';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const db = getFirestore(app);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCartItems(user.uid);
    }
  }, [user]);

  const fetchCartItems = async (userId) => {
    try {
      const cartRef = doc(db, "carts", userId);
      const cartDoc = await getDoc(cartRef);
      if (cartDoc.exists()) {
        const items = Object.values(cartDoc.data().items || {});
        setCartItems(items);
        stopSpeaking();
        speakCartDetails(items);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const speakCartDetails = (items) => {
    if (items.length === 0) {
      speak("Cart Page. Your cart is empty.");
      return;
    }

    // Announce page name and number of items
    let message = `Cart Page. You have ${items.length} items in your cart. `;
    
    // Add each item's name and quantity
    items.forEach((item, index) => {
      message += `Item ${index + 1}: ${item.name}, quantity ${item.quantity}. `;
    });

    // Calculate and add total price
    let totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
    message += `Total price: ${totalPrice} dollars.`;
    
    speak(message);
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const cartRef = doc(db, "carts", user.uid);
      const cartDoc = await getDoc(cartRef);
      if (!cartDoc.exists()) return;
      let cartData = cartDoc.data().items;
      const itemName = cartData[productId].name;
      cartData[productId].quantity = newQuantity;
      await updateDoc(cartRef, { items: cartData });
      setCartItems(Object.values(cartData));

      stopSpeaking();
      speak(`Quantity of ${itemName} updated to ${newQuantity}.`);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const cartRef = doc(db, "carts", user.uid);
      const cartDoc = await getDoc(cartRef);
      if (!cartDoc.exists()) return;
      let cartData = cartDoc.data().items;
      const itemName = cartData[productId].name;
      delete cartData[productId];
      await updateDoc(cartRef, { items: cartData });
      setCartItems(Object.values(cartData));

      stopSpeaking();
      speak(`${itemName} has been removed from your cart.`);
    } catch (error) {
      console.error("Error removing product:", error);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  const handleCheckout = () => {
    stopSpeaking();
    speak("Checkout completed. Your order has been placed successfully.");
    setIsModalOpen(true);
  };

  const handleModalClose = async () => {
    try {
      const cartRef = doc(db, "carts", user.uid);
      await setDoc(cartRef, { items: {} });
      setCartItems([]);
      setIsModalOpen(false);
      stopSpeaking();
      // Removed the "Your cart has been cleared" speech
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-4xl font-bold text-center mb-6 text-gray-800"
      >
        🛒 Your Cart
      </motion.h1>

      {cartItems.length === 0 ? (
        <p className="text-lg text-gray-600 text-center">Your cart is empty.</p>
      ) : (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
          <div className="grid grid-cols-1 gap-6">
            {cartItems.map((item) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-md"
              >
                <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                <div className="flex-1 px-4">
                  <h2 className="text-lg font-bold">{item.name}</h2>
                  <p className="text-gray-600">${item.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    className="p-2 bg-gray-200 rounded-md" 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <FaMinus />
                  </button>
                  <span className="text-lg font-bold">{item.quantity}</span>
                  <button 
                    className="p-2 bg-gray-200 rounded-md" 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <FaPlus />
                  </button>
                </div>
                <button 
                  className="p-2 bg-red-500 text-white rounded-md"
                  onClick={() => removeFromCart(item.id)}
                >
                  <FaTrash />
                </button>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-6 border-t pt-4">
            <h2 className="text-2xl font-bold text-center">Total: ${getTotalPrice()}</h2>
            <button 
              className="mt-4 p-3 w-full bg-green-500 text-white rounded-lg flex items-center justify-center text-lg font-bold shadow-md hover:bg-green-600 transition"
              onClick={handleCheckout}
            >
              <FaShoppingCart className="mr-2" /> Checkout
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-2xl font-bold mb-4 text-green-600">Order Placed!</h2>
            <p className="text-gray-700 mb-6">Your order has been placed successfully.</p>
            <button 
              className="w-full p-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition"
              onClick={handleModalClose}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}