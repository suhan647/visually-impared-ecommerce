'use client'
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";

export default function Products() {
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({ name: "", price: "", description: "", category: "", stock: "", imageUrl: "" });
    const [editingProduct, setEditingProduct] = useState(null);
    const [image, setImage] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsList);
    };

    const uploadImage = async (selectedImage) => {
        if (!selectedImage) return "";
        const formData = new FormData();
        formData.append("image", selectedImage);
        
        const response = await fetch("https://api.imgbb.com/1/upload?key=fe1edaf0148e445e48a7bb94bdccd416", {
            method: "POST",
            body: formData,
        });
        
        const data = await response.json();
        return data.success ? data.data.url : "";
    };

    const addProduct = async () => {
        if (!newProduct.name || !newProduct.price) return;
        
        const imageUrl = await uploadImage(image);
        await addDoc(collection(db, "products"), { ...newProduct, imageUrl });
        setNewProduct({ name: "", price: "", description: "", category: "", stock: "", imageUrl: "" });
        setImage(null);
        fetchProducts();
    };

    const deleteProduct = async (id) => {
        await deleteDoc(doc(db, "products", id));
        fetchProducts();
    };

    const updateProduct = async () => {
        if (!editingProduct) return;
        
        const imageUrl = image ? await uploadImage(image) : editingProduct.imageUrl;
        await updateDoc(doc(db, "products", editingProduct.id), { ...editingProduct, imageUrl });
        setEditingProduct(null);
        setImage(null);
        fetchProducts();
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Manage Products</h1>
            <div className="mb-4 flex gap-2 flex-wrap">
                <input type="text" placeholder="Product Name" className="border p-2" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
                <input type="number" placeholder="Price" className="border p-2" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
                <input type="text" placeholder="Category" className="border p-2" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} />
                <input type="number" placeholder="Stock" className="border p-2" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} />
                <input type="file" className="border p-2" onChange={(e) => setImage(e.target.files[0])} />
                <button className="bg-blue-500 text-white p-2" onClick={addProduct}>Add</button>
            </div>
            <ul>
                {products.map((product) => (
                    <li key={product.id} className="border p-2 mb-2 flex justify-between items-center">
                        {editingProduct?.id === product.id ? (
                            <>
                                <input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="border p-2" />
                                <input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })} className="border p-2" />
                                <input type="text" placeholder="Category" value={editingProduct.category} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} className="border p-2" />
                                <input type="number" placeholder="Stock" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })} className="border p-2" />
                                <input type="file" className="border p-2" onChange={(e) => setImage(e.target.files[0])} />
                                <button className="bg-green-500 text-white p-2" onClick={updateProduct}>Save</button>
                            </>
                        ) : (
                            <>
                                <div>
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover mr-2" />
                                    ) : null}
                                    <span>{product.name} - ${product.price} - {product.category} - Stock: {product.stock}</span>
                                </div>
                                <div>
                                    <button className="bg-yellow-500 text-white p-2 mr-2" onClick={() => setEditingProduct(product)}>Edit</button>
                                    <button className="bg-red-500 text-white p-2" onClick={() => deleteProduct(product.id)}>Delete</button>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
