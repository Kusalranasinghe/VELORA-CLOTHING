import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function CategoriesPage() {
  const { categories, products } = useShop();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest text-velora-500 uppercase">
          VELORA Collections
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-velora-950">
          All Clothing Categories
        </h1>
        <p className="text-sm text-velora-500 leading-relaxed">
          Explore our complete range of fashion categories. Each collection is thoughtfully curated to bring you the highest quality fabrics and styles.
        </p>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => {
          const catProducts = products.filter(
            p => p.category?.toLowerCase() === cat.name.toLowerCase()
          );

          return (
            <div
              key={cat.id}
              className="group bg-white rounded-3xl overflow-hidden border border-velora-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Image banner */}
              <Link
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="relative aspect-[16/10] overflow-hidden bg-velora-100 block"
              >
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-velora-950/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="text-xs text-velora-300 font-semibold uppercase tracking-wider">
                    {catProducts.length} {catProducts.length === 1 ? 'Product' : 'Products'}
                  </span>
                  <h3 className="text-2xl font-serif font-black">{cat.name}</h3>
                </div>
              </Link>

              {/* Subcategories list */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-velora-400 uppercase tracking-wider mb-3">
                    Subcategories
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {cat.subcategories && cat.subcategories.map((sub, idx) => (
                      <Link
                        key={idx}
                        to={`/shop?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(sub)}`}
                        className="px-3 py-1.5 rounded-lg bg-velora-100 hover:bg-velora-950 hover:text-white text-velora-800 text-xs font-semibold transition-colors"
                      >
                        {sub}
                      </Link>
                    ))}
                  </div>
                </div>

                <Link
                  to={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="inline-flex items-center justify-between text-xs font-bold tracking-wider uppercase text-velora-950 hover:text-velora-600 pt-4 border-t border-velora-100"
                >
                  <span>Explore {cat.name}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
