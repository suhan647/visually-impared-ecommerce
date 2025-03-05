'use client'
import Link from "next/link";
import { FaShoppingCart, FaBoxOpen, FaSignOutAlt, FaStore } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { speak } from "@/lib/speech";
import LogoutButton from "./LogoutButton";

export default function Header({ onLogout }) {
  const router = useRouter();

  const handleLogout = () => {
    speak("Logging out");
    if (onLogout) onLogout();
    router.push("/auth/login");
  };

  return (
    <header className="bg-gray-900 text-white p-4 flex justify-between items-center">
      {/* Logo with Icon */}
      <div className="flex items-center space-x-2">
        <FaStore size={28} className="text-yellow-400" />
        <h1 className="text-2xl font-bold">Accessible Shop</h1>
      </div>

      {/* Navigation */}
      <nav className="flex items-center space-x-6">
        <Link
          className="flex items-center space-x-2 hover:text-yellow-400 transition"
          href="/user/products"
          onClick={() => speak("Products page")}
        >
          <FaBoxOpen size={20} />
          <span>Products</span>
        </Link>
        
        <Link
          className="flex items-center space-x-2 hover:text-yellow-400 transition"
          href="/user/cart"
          onClick={() => speak("Cart page")}
        >
          <FaShoppingCart size={20} />
          <span>Cart</span>
        </Link>

        {/* Logout Button */}
        {/* <button
          onClick={handleLogout}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
          aria-label="Logout"
        >
          <FaSignOutAlt size={20} />
          <span>Logout</span>
        </button> */}
        <LogoutButton />
      </nav>
    </header>
  );
}
