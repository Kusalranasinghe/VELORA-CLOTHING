/**
 * WhatsApp Click-to-Chat utility for VELORA CLOTHING
 */

export function cleanPhoneNumber(phone) {
  if (!phone) return '94771234567';
  let cleaned = phone.toString().replace(/[^0-9]/g, '');
  // If starts with 0 (Sri Lanka local format e.g. 0771234567), replace with 94
  if (cleaned.startsWith('0')) {
    cleaned = '94' + cleaned.substring(1);
  }
  return cleaned;
}

export function formatPrice(price, currency = 'Rs.') {
  const num = Number(price) || 0;
  return `${currency} ${num.toLocaleString('en-LK')}`;
}

export function calculateDiscountedPrice(originalPrice, discountPercent) {
  const orig = Number(originalPrice) || 0;
  const disc = Number(discountPercent) || 0;
  if (disc <= 0) return orig;
  return Math.round(orig * (1 - disc / 100));
}

/**
 * Generate click-to-chat WhatsApp URL for ordering a specific product
 */
export function generateWhatsAppOrderUrl({
  product,
  selectedSize,
  selectedColor,
  quantity = 1,
  shopWhatsApp = '94771234567',
  shopName = 'VELORA CLOTHING',
  customer
}) {
  const phone = cleanPhoneNumber(shopWhatsApp);
  const finalPrice = product.discountedPrice || calculateDiscountedPrice(product.originalPrice, product.discountPercent);
  const total = finalPrice * quantity;

  let msg = `Hello ${shopName}! 🛍️✨\n`;
  msg += `I would like to inquire / order this item:\n\n`;
  msg += `📌 *Product:* ${product.name}\n`;
  if (selectedSize) msg += `📏 *Size:* ${selectedSize}\n`;
  if (selectedColor) msg += `🎨 *Color:* ${selectedColor}\n`;
  msg += `🔢 *Quantity:* ${quantity}\n`;
  msg += `💰 *Unit Price:* ${formatPrice(finalPrice)}\n`;
  if (quantity > 1) {
    msg += `💵 *Total:* ${formatPrice(total)}\n`;
  }
  if (product.id) {
    msg += `🏷️ *Item Code:* #${product.id}\n`;
  }
  if (customer) {
    msg += `\n👤 *Customer:* ${customer.name}\n`;
    if (customer.email) msg += `✉️ *Email:* ${customer.email}\n`;
    if (customer.phone) msg += `📞 *Telephone:* ${customer.phone}\n`;
    if (customer.address) msg += `📍 *Delivery address:* ${customer.address}\n`;
  }
  msg += `\nIs this item available in stock? Could you please confirm the delivery details? Thank you!`;

  const encoded = encodeURIComponent(msg);
  return `https://wa.me/${phone}?text=${encoded}`;
}

/**
 * Generate click-to-chat WhatsApp URL for general inquiry or support
 */
export function generateGeneralInquiryUrl(shopWhatsApp = '94771234567', shopName = 'VELORA CLOTHING') {
  const phone = cleanPhoneNumber(shopWhatsApp);
  const msg = `Hello ${shopName}! 👋 I would like to get more information about your clothing collection and delivery.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}
