import React from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Truck,
  RotateCcw,
  Instagram,
  Facebook
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { generateGeneralInquiryUrl } from '../utils/whatsapp';

export default function Footer() {
  const { categories, settings } = useShop();

  const whatsappInquiryUrl = generateGeneralInquiryUrl(settings.whatsappNumber, settings.shopName);

  return (
    <footer className="bg-velora-950 text-white border-t border-velora-900 mt-20">
      {/* Value Proposition Badges */}
      <div className="border-b border-velora-900/60 py-10 bg-velora-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-velora-900/40 border border-velora-800/50">
            <div className="p-3 rounded-xl bg-velora-800 text-velora-200">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white">Islandwide Fast Delivery</h4>
              <p className="text-xs text-velora-400 mt-0.5">Reliable doorstep courier service across Sri Lanka</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-velora-900/40 border border-velora-800/50">
            <div className="p-3 rounded-xl bg-emerald-950 text-emerald-400">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white">Instant WhatsApp Ordering</h4>
              <p className="text-xs text-velora-400 mt-0.5">Order with single click & chat directly with shop</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-velora-900/40 border border-velora-800/50">
            <div className="p-3 rounded-xl bg-velora-800 text-velora-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white">Premium Quality Assured</h4>
              <p className="text-xs text-velora-400 mt-0.5">Handpicked luxury fabrics and modern fittings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <span className="text-3xl font-serif font-black tracking-widest text-white">
                VELORA
              </span>
              <span className="block text-[10px] tracking-[0.35em] font-medium text-velora-400 uppercase">
                CLOTHING
              </span>
            </Link>
            <p className="text-sm text-velora-300 leading-relaxed max-w-sm">
              Discover contemporary streetwear, modern classics, and sophisticated everyday apparel. Built for comfort, crafted with confidence.
            </p>
            
            <div className="pt-2">
              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold tracking-wider transition-all shadow-lg shadow-emerald-950"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                CHAT ON WHATSAPP
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-velora-200 mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-velora-400">
              <li><Link to="/" className="hover:text-white transition-colors">Home Page</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Shop All Products</Link></li>
              <li><Link to="/categories" className="hover:text-white transition-colors">All Categories</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">My Wishlist</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors text-xs text-velora-500">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-velora-200 mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm text-velora-400">
              {categories.slice(0, 5).map(cat => (
                <li key={cat.id}>
                  <Link to={`/shop?category=${encodeURIComponent(cat.name)}`} className="hover:text-white transition-colors">
                    {cat.name} Collection
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-velora-200 mb-4">
              Get in Touch
            </h4>
            <ul className="space-y-3 text-sm text-velora-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-velora-400 shrink-0 mt-0.5" />
                <span className="text-xs">{settings.address || 'Colombo, Sri Lanka'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-medium">WhatsApp: +{settings.whatsappNumber || '94771234567'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-velora-400 shrink-0" />
                <span className="text-xs">{settings.email || 'contact@veloraclothing.com'}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-velora-900 flex flex-col sm:flex-row items-center justify-between text-xs text-velora-400 gap-4">
          <p>&copy; {new Date().getFullYear()} {settings.shopName || 'VELORA CLOTHING'}. All rights reserved.</p>
          <p className="text-velora-500">
            Powered by React, Google Sheets API & WhatsApp Ordering
          </p>
        </div>
      </div>
    </footer>
  );
}
