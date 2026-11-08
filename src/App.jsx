import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import CategoriesPage from './pages/CategoriesPage';
import Wishlist from './pages/Wishlist';
import Contact from './pages/Contact';
import AdminDashboard from './admin/AdminDashboard';
import AdminLogin from './admin/AdminLogin';

// Helper to scroll to top whenever navigation changes
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Layout wrapper conditionally displaying Navbar & Footer
function Layout({ children }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-velora-50">
      {!isAdminRoute && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <Router>
          <ScrollToTop />
          <Layout>
            <Routes>
              {/* Customer Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/contact" element={<Contact />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* 404 Fallback */}
              <Route
                path="*"
                element={
                  <div className="py-24 text-center">
                    <h1 className="text-4xl font-serif font-black text-velora-950 mb-2">404</h1>
                    <p className="text-sm text-velora-500 mb-6">Page not found.</p>
                    <a
                      href="/"
                      className="px-6 py-2.5 rounded-full bg-velora-950 text-white text-xs font-bold uppercase tracking-wider"
                    >
                      Return Home
                    </a>
                  </div>
                }
              />
            </Routes>
          </Layout>
        </Router>
      </ShopProvider>
    </AuthProvider>
  );
}
