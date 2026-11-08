import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  Flame,
  Star,
  CheckCircle,
  Truck,
  MessageCircle,
  Clock
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import { generateGeneralInquiryUrl } from '../utils/whatsapp';

export default function Home() {
  const { products, categories, settings } = useShop();
  const [activeTab, setActiveTab] = useState('all');

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 8);
  const newArrivals = products.filter(p => p.isNewArrival).slice(0, 8);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 8);

  const displayedProducts = activeTab === 'all'
    ? (featuredProducts.length > 0 ? featuredProducts : products.slice(0, 8))
    : activeTab === 'new'
    ? newArrivals
    : bestSellers;

  const whatsappInquiryUrl = generateGeneralInquiryUrl(settings.whatsappNumber, settings.shopName);

  return (
    <div className="space-y-20 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[580px] lg:min-h-[680px] flex items-center justify-center bg-gradient-to-br from-velora-950 via-velora-900 to-velora-950 text-white overflow-hidden">
        {/* Abstract luxury background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-velora-800/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-rose-950/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-velora-200 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Modern Luxury &bull; New Season 2026</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-[1.15]">
              {settings.heroTitle || 'ELEVATE YOUR STYLE'}
            </h1>

            <p className="text-base sm:text-lg text-velora-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              {settings.heroSubtitle || 'Discover timeless silhouettes, modern oversized cuts, and contemporary fashion essentials for your everyday wardrobe.'}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white text-velora-950 text-sm font-bold tracking-wider hover:bg-velora-100 transition-all shadow-xl hover:shadow-2xl"
              >
                <ShoppingBag className="w-4 h-4" />
                EXPLORE COLLECTION
              </Link>
              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold tracking-wider transition-all shadow-lg shadow-emerald-950"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                ORDER ON WHATSAPP
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-6 text-center lg:text-left">
              <div>
                <p className="text-2xl font-bold text-white font-serif">{products.length}+</p>
                <p className="text-xs text-velora-400 font-medium">Curated Styles</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white font-serif">100%</p>
                <p className="text-xs text-velora-400 font-medium">Premium Cotton</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white font-serif">2-4 Days</p>
                <p className="text-xs text-velora-400 font-medium">Islandwide Courier</p>
              </div>
            </div>
          </div>

          {/* Hero Image Showcase */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 group">
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop"
                alt="VELORA Fashion Collection"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-velora-950/80 via-transparent to-transparent"></div>
              
              {/* Floating Banner Card */}
              <div className="absolute bottom-6 inset-x-6 p-4 rounded-2xl bg-white/90 backdrop-blur-md text-velora-950 border border-white/50 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600">Special Discount</span>
                    <h3 className="text-sm font-bold">Up to 30% Off Selected Styles</h3>
                  </div>
                  <Link
                    to="/shop"
                    className="p-2.5 rounded-full bg-velora-950 text-white hover:bg-velora-800 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8">
          <div>
            <span className="text-xs font-bold tracking-widest text-velora-500 uppercase">Browse Collections</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-velora-950 mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/categories"
            className="text-xs font-bold text-velora-900 hover:text-velora-600 uppercase tracking-wider inline-flex items-center gap-1.5 mt-2 sm:mt-0"
          >
            All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((cat) => {
            const count = products.filter(p => p.category?.toLowerCase() === cat.name?.toLowerCase()).length;
            return (
              <Link
                key={cat.id}
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-velora-100 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-velora-950/85 via-velora-950/20 to-transparent"></div>
                <div className="absolute bottom-4 inset-x-4 text-white">
                  <h3 className="text-lg font-serif font-bold tracking-wide">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-velora-300 font-medium">
                    {count} {count === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS & TABS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold tracking-widest text-velora-500 uppercase">Curated For You</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-velora-950 mt-1">
              Trending Apparel
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 p-1.5 rounded-full bg-velora-100 border border-velora-200 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'all' ? 'bg-velora-950 text-white shadow-sm' : 'text-velora-700 hover:text-velora-950'
              }`}
            >
              Featured
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'new' ? 'bg-velora-950 text-white shadow-sm' : 'text-velora-700 hover:text-velora-950'
              }`}
            >
              New Arrivals
            </button>
            <button
              onClick={() => setActiveTab('bestsellers')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'bestsellers' ? 'bg-velora-950 text-white shadow-sm' : 'text-velora-700 hover:text-velora-950'
              }`}
            >
              Best Sellers
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-velora-950 text-white text-xs font-bold tracking-widest uppercase hover:bg-velora-800 transition-all shadow-md"
          >
            <span>View All {products.length} Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 4. PROMOTIONAL BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-velora-900 to-velora-950 text-white p-8 sm:p-12 lg:p-16">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-bold uppercase tracking-wider">
              Limited Time Offer
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-black leading-tight">
              Get Up To 30% Off on Selected Collections
            </h2>
            <p className="text-sm text-velora-300 leading-relaxed">
              Upgrade your seasonal wardrobe with premium quality oversized tees, casual shirts, and elegant dresses. Direct WhatsApp delivery support available.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/shop"
                className="px-6 py-3 rounded-full bg-white text-velora-950 font-bold text-xs uppercase tracking-wider hover:bg-velora-100 transition-all"
              >
                Shop The Sale
              </Link>
              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                Inquire on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CUSTOMER REVIEWS & TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest text-velora-500 uppercase">Customer Love</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-velora-950 mt-1">
            What Our Shoppers Say
          </h2>
          <p className="text-sm text-velora-500 mt-2">
            Read authentic feedback from stylish customers across Sri Lanka.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-velora-200 shadow-sm space-y-3">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-sm text-velora-700 italic">
              "The Heavyweight Oversized Tee has extraordinary GSM quality! Ordering via WhatsApp was super easy, received it in Colombo within 2 days."
            </p>
            <div className="pt-2 border-t border-velora-100">
              <p className="text-xs font-bold text-velora-950">Dinuka R.</p>
              <p className="text-[11px] text-velora-500">Verified Buyer &bull; Colombo</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-velora-200 shadow-sm space-y-3">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-sm text-velora-700 italic">
              "The Floral Chiffon Dress fit me perfectly! The size charts and colors were exactly as shown on the website. High-end look without crazy prices."
            </p>
            <div className="pt-2 border-t border-velora-100">
              <p className="text-xs font-bold text-velora-950">Sanduni M.</p>
              <p className="text-[11px] text-velora-500">Verified Buyer &bull; Kandy</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-velora-200 shadow-sm space-y-3">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-sm text-velora-700 italic">
              "Love the simple WhatsApp order flow! Sent the message with my size and got an instant response and tracking info. Will definitely buy again."
            </p>
            <div className="pt-2 border-t border-velora-100">
              <p className="text-xs font-bold text-velora-950">Ashan K.</p>
              <p className="text-[11px] text-velora-500">Verified Buyer &bull; Galle</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
