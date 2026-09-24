'use client';
import { useCartStore, Product } from '../lib/store';
import Link from 'next/link';

const mockProducts: Product[] = [
  { id: '1', name: 'Wireless Headphones', price: 9999, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', stock: 10 },
  { id: '2', name: 'Smart Watch', price: 19999, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', stock: 5 },
  { id: '3', name: 'Mechanical Keyboard', price: 12999, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', stock: 0 },
  { id: '4', name: 'Ergonomic Mouse', price: 4999, imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500', stock: 15 },
];

export default function Home() {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <main className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">🛒 CartCraft Store</h1>
        <Link href="/cart" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
          View Cart
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockProducts.map((product) => (
          <div key={product.id} className="border rounded-xl p-4 flex flex-col gap-3 hover:shadow-lg transition-shadow bg-white">
            <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover rounded-md bg-gray-100" />
            <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
            <p className="text-xl font-semibold text-blue-600">${(product.price / 100).toFixed(2)}</p>
            <p className="text-sm text-gray-500">Stock: {product.stock}</p>
            
            <button
              onClick={() => addItem(product)}
              disabled={product.stock === 0}
              className="mt-auto bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
