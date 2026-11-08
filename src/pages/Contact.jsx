import React, { useState } from 'react';
import {
  MessageCircle,
  MapPin,
  Mail,
  Phone,
  Clock,
  Send,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { cleanPhoneNumber } from '../utils/whatsapp';

export default function Contact() {
  const { settings, showToast } = useShop();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      showToast('Please type a message', 'info');
      return;
    }

    const shopPhone = cleanPhoneNumber(settings.whatsappNumber);
    let text = `Hello ${settings.shopName}! 👋\n`;
    if (name.trim()) text += `*From:* ${name.trim()}\n`;
    if (phone.trim()) text += `*Contact:* ${phone.trim()}\n`;
    text += `\n*Message:* ${message.trim()}`;

    const url = `https://wa.me/${shopPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest text-velora-500 uppercase">
          Get In Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-velora-950">
          Contact VELORA CLOTHING
        </h1>
        <p className="text-sm text-velora-500 leading-relaxed">
          Have questions about an order, size recommendations, custom requests, or delivery? Reach out to us directly through WhatsApp or drop us a message below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Contact Info Cards */}
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-velora-950 text-white shadow-xl space-y-6">
            <h3 className="text-xl font-serif font-bold text-white">Store Information</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-white/10 text-emerald-400 shrink-0">
                  <MessageCircle className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-velora-300">WhatsApp Hotlines</h4>
                  <p className="text-base font-bold text-white mt-0.5">+{settings.whatsappNumber || '94771234567'}</p>
                  <p className="text-xs text-velora-400 mt-1">Available 9:00 AM - 9:00 PM for instant inquiries & orders</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-white/10 text-velora-300 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-velora-300">Showroom & Pickup</h4>
                  <p className="text-sm text-white mt-0.5 font-medium">{settings.address || 'Colombo, Sri Lanka'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-white/10 text-velora-300 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-velora-300">Email Address</h4>
                  <p className="text-sm text-white mt-0.5 font-medium">{settings.email || 'contact@veloraclothing.com'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-white/10 text-velora-300 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-velora-300">Working Hours</h4>
                  <p className="text-sm text-white mt-0.5 font-medium">Monday &ndash; Sunday: 9:00 AM &ndash; 8:30 PM</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <a
                href={`https://wa.me/${cleanPhoneNumber(settings.whatsappNumber)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold tracking-wider uppercase transition-all shadow-lg"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                Open WhatsApp Chat Now
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-8 rounded-3xl border border-velora-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-serif font-bold text-velora-950">Send an Inquiry</h3>
            <p className="text-xs text-velora-500 mt-1">
              Fill out this quick form and click submit to send this inquiry directly to our shop WhatsApp!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                placeholder="e.g. Kasun Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-velora-50 border border-velora-200 focus:outline-none focus:border-velora-900 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-1.5">
                Contact Number
              </label>
              <input
                type="text"
                placeholder="e.g. 0771234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-velora-50 border border-velora-200 focus:outline-none focus:border-velora-900 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-1.5">
                Your Message or Order Request *
              </label>
              <textarea
                rows={4}
                required
                placeholder="I would like to inquire about..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-velora-50 border border-velora-200 focus:outline-none focus:border-velora-900 text-sm resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-velora-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-velora-800 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <Send className="w-4 h-4" /> Send to WhatsApp
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
