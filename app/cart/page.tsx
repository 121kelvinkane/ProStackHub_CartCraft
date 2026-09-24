'use client';
import { useCartStore } from '@/lib/store';
import Link from 'next/link';
import { useState } from 'react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Checkout failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An unexpected error occurred.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty 🛒</h1>
        <Link href="/" className="text-blue-600 hover:underline font-medium">
          ← Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Link href="/" className="text-blue-600 hover:underline font-medium mb-6 inline-block">
        ← Continue Shopping
      </Link>
      
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      
      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 border-b pb-4">
            <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
            <div className="flex-1">
              <h3 className="font-bold text-lg">{item.name}</h3>
              <p className="text-gray-600">${(item.price / 100).toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2 border rounded-lg px-2 py-1">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-gray-100 rounded font-bold">-</button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-gray-100 rounded font-bold">+</button>
            </div>
            <button onClick={() => removeItem(item.id)} className="text-red-500 p-2 hover:bg-red-50 rounded font-bold">✕</button>
          </div>
        ))}
      </div>
      
      <div className="border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-gray-600">Total</p>
          <h2 className="text-3xl font-bold text-gray-800">${(getTotalPrice() / 100).toFixed(2)}</h2>
        </div>
        <div className="flex gap-3">
          <button onClick={clearCart} className="border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 font-medium">
            Clear Cart
          </button>
          <button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="bg-green-600 text-white py-3 px-8 rounded-lg font-bold hover:bg-green-700 shadow-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
}
