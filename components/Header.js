import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">🛍️ Accessible Shop</h1>
      <nav>
        <Link className="mx-4 hover:text-yellow-400" href="/user/products">Products</Link>
        <Link className="mx-4 hover:text-yellow-400" href="/user/cart">Cart</Link>
      </nav>
    </header>
  );
}
