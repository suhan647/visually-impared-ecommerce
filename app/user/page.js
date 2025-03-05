'use client';
import Link from 'next/link';
import { FaShoppingCart, FaTruck, FaTags, FaAccessibleIcon } from 'react-icons/fa';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white py-20 text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to Accessible Shop 🛍️</h1>
        <p className="text-lg text-gray-300 mb-6">A shopping experience designed for everyone, including visually impaired users.</p>
        <Link href="/user/products">
          <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-lg transition">
            Shop Now
          </button>
        </Link>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 p-10">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <FaAccessibleIcon className="text-4xl text-blue-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold">Accessibility First</h3>
          <p className="text-gray-600">Voice navigation and screen reader support for a smooth experience.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <FaTruck className="text-4xl text-green-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold">Fast Delivery</h3>
          <p className="text-gray-600">Get your products delivered quickly with our efficient service.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <FaTags className="text-4xl text-red-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold">Best Prices</h3>
          <p className="text-gray-600">Enjoy the lowest prices on high-quality products.</p>
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="p-10">
        <h2 className="text-3xl font-bold text-center mb-6">🔥 Popular Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <img src="https://via.placeholder.com/300" alt="Product 1" className="w-full h-40 object-cover rounded-md" />
            <h3 className="text-lg font-bold mt-2">Product 1</h3>
            <p className="text-gray-600">$20.00</p>
            <button className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
              Add to Cart
            </button>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <img src="https://via.placeholder.com/300" alt="Product 2" className="w-full h-40 object-cover rounded-md" />
            <h3 className="text-lg font-bold mt-2">Product 2</h3>
            <p className="text-gray-600">$30.00</p>
            <button className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
              Add to Cart
            </button>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <img src="https://via.placeholder.com/300" alt="Product 3" className="w-full h-40 object-cover rounded-md" />
            <h3 className="text-lg font-bold mt-2">Product 3</h3>
            <p className="text-gray-600">$25.00</p>
            <button className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
              Add to Cart
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center p-6 mt-10">
        <p>&copy; 2025 Accessible Shop. All Rights Reserved.</p>
        <nav className="flex justify-center space-x-4 mt-2">
          <Link href="/user/products" className="hover:text-yellow-400">Products</Link>
          <Link href="/user/cart" className="hover:text-yellow-400">Cart</Link>
          <Link href="/auth/login" className="hover:text-yellow-400">Login</Link>
        </nav>
      </footer>
    </div>
  );
}
