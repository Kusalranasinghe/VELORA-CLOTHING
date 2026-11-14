import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle } from 'lucide-react';
import { isCustomerProfileComplete, useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { formatPrice, generateWhatsAppOrderUrl } from '../utils/whatsapp';

export default function ProductCard({ product }) {
  const { settings, isInWishlist, toggleWishlist, showToast } = useShop();
  const { user, customerProfile } = useAuth();
  const navigate = useNavigate();
  const isWishlisted = isInWishlist(product.id);

  // Discount calculation
  const original = Number(product.originalPrice) || 0;
  const discountPercent = Number(product.discountPercent) || 0;
  const discounted = product.discountedPrice || (discountPercent > 0 ? Math.round(original * (1 - discountPercent / 100)) : original);
  const stock = Number(product.stockQuantity) || 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  // Direct WhatsApp Quick Order
  const handleQuickWhatsApp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || !isCustomerProfileComplete(customerProfile)) {
      showToast(
        user ? 'Complete your delivery details before ordering' : 'Sign in or create an account before ordering',
        'info'
      );
      navigate(`/account?returnTo=${encodeURIComponent(`/product/${product.id}`)}`);
      return;
    }

    const url = generateWhatsAppOrderUrl({
      product,
      selectedSize: product.sizes?.[0] || '',
      selectedColor: product.colors?.[0] || '',
      quantity: 1,
      shopWhatsApp: settings.whatsappNumber,
      shopName: settings.shopName,
      customer: customerProfile
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-velora-200/80 hover:border-velora-400/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Top Image Container */}
      <Link to={`/product/${product.id}`} className="relative block aspect-[3/4] overflow-hidden bg-velora-100">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPercent > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-bold tracking-wider uppercase shadow-md">
              {discountPercent}% OFF
            </span>
          )}
          {product.isNewArrival && (
            <span className="px-2.5 py-1 rounded-full bg-velora-950 text-white text-[10px] font-bold tracking-wider uppercase shadow-md">
              NEW
            </span>
          )}
        </div>

        {/* Stock Badge Overlay */}
        <div className="absolute top-3 right-3 z-10">
          {isOutOfStock ? (
            <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold tracking-wider uppercase border border-red-200">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold tracking-wider uppercase border border-amber-200">
              Only {stock} Left!
            </span>
          ) : null}
        </div>

        {/* Quick Hover Action Bar */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2 z-10">
          <button
            onClick={handleQuickWhatsApp}
            disabled={isOutOfStock}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-lg ${
              isOutOfStock
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
            title="Order directly on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>Order on WhatsApp</span>
          </button>
        </div>
      </Link>

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
        className={`absolute top-3 right-3 p-2 rounded-full transition-all z-20 ${
          isWishlisted
            ? 'bg-rose-500 text-white shadow-md'
            : 'bg-white/80 backdrop-blur-md text-velora-700 hover:text-rose-500 hover:bg-white shadow'
        } ${isOutOfStock || isLowStock ? 'top-11' : 'top-3'}`}
        aria-label="Toggle wishlist"
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
      </button>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Category & Subcategory */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-velora-500 uppercase tracking-wider mb-1">
            <span>{product.category}</span>
            {product.subcategory && (
              <>
                <span>&bull;</span>
                <span>{product.subcategory}</span>
              </>
            )}
          </div>

          {/* Product Name */}
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="text-sm font-semibold text-velora-900 hover:text-velora-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Sizes */}
        <div className="mt-3 pt-3 border-t border-velora-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-velora-950">
                {formatPrice(discounted, settings.currency)}
              </span>
              {discountPercent > 0 && (
                <span className="text-xs text-velora-400 line-through">
                  {formatPrice(original, settings.currency)}
                </span>
              )}
            </div>
          </div>

          {/* Available Sizes Badge */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="text-[10px] font-semibold text-velora-500 bg-velora-100 px-2 py-0.5 rounded">
              {product.sizes.length} sizes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
