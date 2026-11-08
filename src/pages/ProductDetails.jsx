import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Heart,
  Share2,
  Check,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatPrice, generateWhatsAppOrderUrl } from '../utils/whatsapp';
import ProductCard from '../components/ProductCard';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, settings, isInWishlist, toggleWishlist, showToast } = useShop();

  const product = products.find(p => String(p.id) === String(id));

  // Component state
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  // Initialize selections when product changes
  useEffect(() => {
    if (product) {
      setSelectedImage(product.imageUrl || '');
      setSelectedSize(product.sizes?.[0] || '');
      setSelectedColor(product.colors?.[0] || '');
      setQuantity(1);
      setSizeError(false);
      window.scrollTo(0, 0);
    }
  }, [id, product]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-serif font-bold text-velora-950 mb-3">Product Not Found</h2>
        <p className="text-sm text-velora-500 mb-6">The apparel item you are looking for may have been moved or is no longer available.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-velora-950 text-white text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
      </div>
    );
  }

  // Gallery images (main image + any additional comma-separated images)
  const allImages = [
    product.imageUrl,
    ...(product.additionalImages ? product.additionalImages.split(',').map(s => s.trim()).filter(Boolean) : [])
  ].filter(Boolean);

  const originalPrice = Number(product.originalPrice) || 0;
  const discountPercent = Number(product.discountPercent) || 0;
  const finalPrice = product.discountedPrice || (discountPercent > 0 ? Math.round(originalPrice * (1 - discountPercent / 100)) : originalPrice);
  const stock = Number(product.stockQuantity) || 0;
  const isOutOfStock = stock <= 0;
  const isWishlisted = isInWishlist(product.id);

  // Related products from same category
  const relatedProducts = products
    .filter(p => p.category === product.category && String(p.id) !== String(product.id))
    .slice(0, 4);

  // Handle WhatsApp Order Trigger
  const handleOrderWhatsApp = () => {
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      setSizeError(true);
      showToast('Please select a size first', 'info');
      return;
    }

    const url = generateWhatsAppOrderUrl({
      product,
      selectedSize,
      selectedColor,
      quantity,
      shopWhatsApp: settings.whatsappNumber,
      shopName: settings.shopName
    });

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on VELORA CLOTHING!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-medium text-velora-500">
        <Link to="/" className="hover:text-velora-950">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-velora-950">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-velora-950">
          {product.category}
        </Link>
        {product.subcategory && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>{product.subcategory}</span>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-velora-950 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        
        {/* Left: Images Gallery */}
        <div className="space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-velora-100 border border-velora-200 shadow-md">
            <img
              src={selectedImage || product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {discountPercent > 0 && (
                <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-bold tracking-wider uppercase shadow-md">
                  {discountPercent}% OFF
                </span>
              )}
              {product.isNewArrival && (
                <span className="px-3 py-1 rounded-full bg-velora-950 text-white text-xs font-bold tracking-wider uppercase shadow-md">
                  NEW ARRIVAL
                </span>
              )}
            </div>

            {/* Quick Share / Wishlist buttons */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-white/90 backdrop-blur-md text-velora-700 hover:text-velora-950 shadow transition-colors"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-2.5 rounded-full shadow transition-colors ${
                  isWishlisted
                    ? 'bg-rose-500 text-white'
                    : 'bg-white/90 backdrop-blur-md text-velora-700 hover:text-rose-500'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>

          {/* Thumbnails row */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {allImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`relative w-20 aspect-[3/4] rounded-xl overflow-hidden bg-velora-100 border-2 transition-all shrink-0 ${
                    selectedImage === imgUrl ? 'border-velora-950 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & WhatsApp CTA */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-velora-500 mb-2">
              <span>{product.category}</span>
              {product.subcategory && (
                <>
                  <span>&bull;</span>
                  <span>{product.subcategory}</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-velora-950 leading-tight">
              {product.name}
            </h1>

            {/* Price section */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-velora-950">
                {formatPrice(finalPrice, settings.currency)}
              </span>
              {discountPercent > 0 && (
                <>
                  <span className="text-base text-velora-400 line-through">
                    {formatPrice(originalPrice, settings.currency)}
                  </span>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    Save {discountPercent}% ({formatPrice(originalPrice - finalPrice, settings.currency)})
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Stock Availability */}
          <div className="pt-2">
            {isOutOfStock ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-bold border border-red-200">
                <AlertCircle className="w-4 h-4" />
                <span>Currently Out of Stock</span>
              </div>
            ) : stock <= 5 ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Only {stock} items left in stock - Order soon!</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>In Stock & Ready for Delivery ({stock} available)</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-velora-800 mb-2">Description</h3>
            <p className="text-sm text-velora-600 leading-relaxed whitespace-pre-line">
              {product.description || 'Premium modern fashion apparel crafted from high-grade fabric designed for effortless everyday wear and tailored aesthetics.'}
            </p>
          </div>

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-velora-800">
                  Select Size {selectedSize && <span className="text-velora-950 font-black">({selectedSize})</span>}
                </label>
                <span className="text-xs text-velora-400 font-medium">Standard Fit</span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSelectedSize(s);
                      setSizeError(false);
                    }}
                    className={`min-w-12 h-11 px-3.5 rounded-xl font-bold text-xs uppercase border transition-all ${
                      selectedSize === s
                        ? 'bg-velora-950 text-white border-velora-950 shadow-md scale-105'
                        : 'bg-white text-velora-800 border-velora-300 hover:border-velora-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {sizeError && (
                <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Please pick a size before ordering.
                </p>
              )}
            </div>
          )}

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-velora-800 block">
                Available Colors {selectedColor && <span className="text-velora-950 font-black">({selectedColor})</span>}
              </label>

              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedColor === c
                        ? 'bg-velora-900 text-white border-velora-900 shadow-sm'
                        : 'bg-velora-100 text-velora-700 border-velora-200 hover:bg-velora-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-velora-800 block">
              Quantity
            </label>
            <div className="inline-flex items-center rounded-xl border border-velora-300 bg-white shadow-sm overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center text-velora-600 hover:bg-velora-100 font-bold transition-colors"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="w-12 text-center text-sm font-bold text-velora-950">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center text-velora-600 hover:bg-velora-100 font-bold transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Primary Action: Direct WhatsApp Order */}
          <div className="pt-4 space-y-3">
            <button
              onClick={handleOrderWhatsApp}
              disabled={isOutOfStock}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-sm tracking-wider uppercase transition-all shadow-xl flex items-center justify-center gap-3 ${
                isOutOfStock
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30 hover:shadow-2xl hover:scale-[1.01]'
              }`}
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>
                {isOutOfStock ? 'Item Out of Stock' : 'Order via WhatsApp Now'}
              </span>
            </button>

            <button
              onClick={() => toggleWishlist(product.id)}
              className="w-full py-3 px-6 rounded-2xl font-bold text-xs tracking-wider uppercase border border-velora-300 text-velora-800 hover:bg-velora-100 transition-colors flex items-center justify-center gap-2"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'text-rose-500 fill-rose-500' : ''}`} />
              <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
            </button>
          </div>

          {/* Delivery & Assurance Cards */}
          <div className="pt-6 border-t border-velora-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-velora-100/70 border border-velora-200/50">
              <Truck className="w-4 h-4 text-velora-700 shrink-0" />
              <span className="text-[11px] font-medium text-velora-800">2-4 Days Courier</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-velora-100/70 border border-velora-200/50">
              <ShieldCheck className="w-4 h-4 text-velora-700 shrink-0" />
              <span className="text-[11px] font-medium text-velora-800">100% Guaranteed</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-velora-100/70 border border-velora-200/50">
              <RotateCcw className="w-4 h-4 text-velora-700 shrink-0" />
              <span className="text-[11px] font-medium text-velora-800">Easy Exchange</span>
            </div>
          </div>

        </div>

      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-velora-200">
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <span className="text-xs font-bold tracking-widest text-velora-500 uppercase">You May Also Like</span>
              <h2 className="text-2xl font-serif font-black text-velora-950 mt-1">
                More from {product.category}
              </h2>
            </div>
            <Link
              to={`/shop?category=${encodeURIComponent(product.category)}`}
              className="text-xs font-bold text-velora-900 hover:text-velora-600 uppercase tracking-wider"
            >
              View More
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map(rel => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
