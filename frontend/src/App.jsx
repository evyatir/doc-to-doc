import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { FEATURES } from '@client/config';
import { CartProvider } from './cart.js';
import { ToastProvider } from './components/Toast.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import Product from './pages/Product.jsx';
import Drops from './pages/Drops.jsx';
import DropPage from './pages/DropPage.jsx';
import Cart from './pages/Cart.jsx';
import GiftCard from './pages/GiftCard.jsx';
import SizeGuide from './pages/SizeGuide.jsx';
import Contact from './pages/Contact.jsx';
import SignUp from './pages/SignUp.jsx';
import Doc from './pages/Doc.jsx';
import NotFound from './pages/NotFound.jsx';
import Admin from './pages/admin/Admin.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Feature-flagged routes redirect to / when off.
const gate = (enabled, element) => (enabled ? element : <Navigate to="/" replace />);

// /admin is the store-owner panel: no public header/footer/drawer chrome, and
// nothing in the public nav or footer links to it.
function Layout() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  return (
    <>
      <ScrollToTop />
      {!isAdmin && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:categoryId" element={<Shop />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/drops" element={gate(FEATURES.drops, <Drops />)} />
        <Route path="/drops/:dropId" element={gate(FEATURES.drops, <DropPage />)} />
        <Route path="/cart" element={gate(FEATURES.cart, <Cart />)} />
        <Route path="/gift-card" element={gate(!!FEATURES.giftCard, <GiftCard />)} />
        <Route path="/size-guide" element={<SizeGuide />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={gate(FEATURES.accounts, <SignUp />)} />
        <Route path="/p/:slug" element={<Doc />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdmin && <Footer />}
      {!isAdmin && <CartDrawer />}
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Layout />
        </BrowserRouter>
      </CartProvider>
    </ToastProvider>
  );
}
