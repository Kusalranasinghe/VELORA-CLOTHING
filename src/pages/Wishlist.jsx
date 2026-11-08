import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ArrowRight, ShoppingBag, MessageCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const { wishlist, products, toggleWishlist } = useShop();

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-velora-200">
        <div>
          <span className="text-xs font-bold tracking-widest text-velora-500 uppercase">
            Saved Apparel
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-velora-950 mt-1">
            My Wishlist ({wishlistedProducts.length})
          </h1>
        </div>

        {wishlistedProducts.length > 0 && (
          <button
            onClick={() => {
              wishlistedProducts.forEach(p => toggleWishlist(p.id));
            }}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" /> Clear All Wishlist
          </button>
        )}
      </div>

      {/* Grid or Empty State */}
      {wishlistedProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistedProducts.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-16 text-center border border-velora-200 max-w-md mx-auto my-12 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-serif font-bold text-velora-950">
            Your Wishlist is Empty
          </h3>
          <p className="text-xs text-velora-500 leading-relaxed">
            Explore our curated collections and tap the heart icon on any product to save it here for later.
          </p>
          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-velora-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-velora-800 transition-colors shadow-md"
            >
              <ShoppingBag className="w-4 h-4" /> Start Browsing
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
