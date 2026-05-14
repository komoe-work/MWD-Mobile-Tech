/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ChevronRight, 
  Smartphone,
  CreditCard,
  MapPin,
  User,
  PhoneCall,
  CheckCircle2,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdminDashboard from './components/AdminDashboard';

// --- Types ---

interface Product {
  id: string;
  name: string;
  specs: string;
  price: number;
  image: string;
  brand: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface OrderForm {
  name: string;
  phone: string;
  address: string;
}

// --- Data ---

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Redmi Note 13 Pro',
    specs: '8GB RAM + 256GB Storage',
    price: 299,
    brand: 'Redmi',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: '2',
    name: 'Meizu 21',
    specs: '12GB RAM + 512GB Storage',
    price: 499,
    brand: 'Meizu',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: '3',
    name: 'OPPO Reno 11 5G',
    specs: '8GB RAM + 256GB Storage',
    price: 399,
    brand: 'OPPO',
    image: 'https://images.unsplash.com/photo-1610940882244-5966236ca6d5?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: '4',
    name: 'Redmi Note 13',
    specs: '6GB RAM + 128GB Storage',
    price: 199,
    brand: 'Redmi',
    image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: '5',
    name: 'Meizu 20 Infinity',
    specs: '16GB RAM + 1TB Storage',
    price: 749,
    brand: 'Meizu',
    image: 'https://images.unsplash.com/photo-1592890288564-76628a30a657?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: '6',
    name: 'OPPO A78',
    specs: '8GB RAM + 128GB Storage',
    price: 229,
    brand: 'OPPO',
    image: 'https://images.unsplash.com/photo-1556656793-062ff98782fe?auto=format&fit=crop&q=80&w=400',
  },
];

// --- Components ---

export default function App() {
  const [view, setView] = useState<'store' | 'admin'>(
    window.location.pathname === '/admin' ? 'admin' : 'store'
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [form, setForm] = useState<OrderForm>({ name: '', phone: '', address: '' });

  // Load cart from localStorage
  useEffect(() => {
    fetchProducts();
    const savedCart = localStorage.getItem('mobile_mart_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to load cart", e);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('mobile_mart_cart', JSON.stringify(cart));
  }, [cart]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/phone');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'store') {
      fetchProducts();
    }
  }, [view]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const totalPrice = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);
    setOrderStatus('idle');

    // Replace with your Google Apps Script Web App URL
    const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

    const orderData = {
      date: new Date().toLocaleString(),
      ...form,
      items: cart.map(item => `${item.name} (${item.quantity}x)`).join(', '),
      total: totalPrice,
    };

    try {
      // In a real scenario, this would be a POST request.
      // Since it's a demo, we'll simulate the call and show instructions.
      console.log('Sending order to GAS:', orderData);
      
      // If you are testing, you can uncomment this:
      /*
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Apps Script usually requires no-cors for simple web app posts
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      */

      // Simulating success
      await new Promise(resolve => setTimeout(resolve, 1500));
      setOrderStatus('success');
      setCart([]);
      setForm({ name: '', phone: '', address: '' });
      setTimeout(() => {
        setIsCheckoutOpen(false);
        setOrderStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Order submission failed', error);
      setOrderStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (view === 'admin') {
    return <AdminDashboard onBack={() => setView('store')} />;
  }

  return (
    <div className="min-h-screen flex flex-col pt-16 pb-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
            <div className="w-4 h-4 border-2 border-white rounded-full"></div>
          </div>
          <h1 className="font-display font-black text-xl tracking-tighter uppercase">MWD MOBILE</h1>
        </div>
        
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold uppercase tracking-widest text-slate-400">
            <a href="#" className="text-black border-b-2 border-black pb-1">Store</a>
            <a href="#" className="hover:text-black transition-colors">Inventory</a>
            <a href="#" className="hover:text-black transition-colors">Orders</a>
          </nav>

          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-slate-100 rounded-full transition-colors"
            id="cart-trigger"
            aria-label="Open shopping cart"
          >
            <ShoppingCart size={22} className="text-slate-800" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-8 py-16 text-center max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-3 py-1 bg-slate-200 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6"
        >
          Limited Selection
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-5xl md:text-6xl font-bold tracking-tight mb-6"
        >
          MWD Mobile Tech.
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-500 text-lg max-w-xl mx-auto mb-12"
        >
          A curated ecosystem of power and design. Experience the latest from Redmi, Meizu, and OPPO.
        </motion.p>
      </section>

      {/* Product Grid */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-8 mb-20">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
            <Loader2 size={40} className="animate-spin stroke-1" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Synchronizing Inventory...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
             <p className="text-xs font-bold uppercase tracking-widest">Inventory is currently depleted.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col"
                id={`product-${product.id}`}
              >
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-50 mb-6 flex items-center justify-center relative">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    width="400"
                    height="300"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-100">
                    {product.brand}
                  </div>
                </div>
                <div className="flex-1 space-y-1 mb-6">
                  <h3 className="font-display font-bold text-xl leading-tight">{product.name}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{product.specs}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-2xl font-bold tracking-tight">${product.price}.00</span>
                  <button 
                    onClick={() => addToCart(product)}
                    className="px-6 py-2.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Shopping Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 px-0"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
              id="cart-drawer"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-display font-bold text-2xl flex items-center gap-2">
                  <ShoppingCart size={24} /> Cart
                </h3>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  aria-label="Close shopping cart drawer"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                    <ShoppingCart size={80} strokeWidth={1} />
                    <p className="font-bold uppercase tracking-widest text-xs">Your cart is empty</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" width="80" height="80" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-sm truncate uppercase tracking-tight">{item.name}</h4>
                          <span className="font-bold text-slate-900 ml-2">${item.price}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center bg-slate-100 rounded-lg overflow-hidden shrink-0">
                            <button onClick={() => updateQuantity(item.id, -1)} aria-label="Decrease quantity" className="p-1 px-2 hover:bg-slate-200 transition-colors border-r border-slate-200"><Minus size={12}/></button>
                            <span className="px-3 text-[10px] font-black">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} aria-label="Increase quantity" className="p-1 px-2 hover:bg-slate-200 transition-colors border-l border-slate-200"><Plus size={12}/></button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} aria-label="Remove item from cart" className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-200 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                    <span>Subtotal</span>
                    <span>${totalPrice}.00</span>
                  </div>
                  <div className="flex items-center justify-between font-display">
                    <span className="font-bold text-lg">Total</span>
                    <span className="text-3xl font-black text-blue-600">${totalPrice}.00</span>
                  </div>
                </div>
                <button 
                  disabled={cart.length === 0}
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 disabled:opacity-50 shadow-xl shadow-blue-100 transition-all"
                >
                  Checkout <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm px-0"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2rem] p-10 shadow-2xl overflow-hidden border border-slate-100"
              id="checkout-modal"
            >
              {orderStatus === 'success' ? (
                <div className="py-12 flex flex-col items-center text-center space-y-6">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 size={48} />
                  </motion.div>
                  <h3 className="font-display font-bold text-3xl">Order Captured</h3>
                  <p className="text-slate-500 text-lg">Your technical request has been logged. We will contact you at <b>{form.phone}</b> to finalize delivery.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h3 className="font-display font-bold text-3xl tracking-tight mb-2">Final Step</h3>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Complete your order documentation</p>
                    </div>
                    <button 
                      onClick={() => setIsCheckoutOpen(false)}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                      aria-label="Close checkout modal"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmitOrder} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="customer-name" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Full Name</label>
                      <input 
                        required
                        id="customer-name"
                        type="text" 
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium text-sm"
                        placeholder="John Doe"
                        autoComplete="name"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="customer-phone" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Phone Number</label>
                        <input 
                          required
                          id="customer-phone"
                          type="tel" 
                          value={form.phone}
                          onChange={e => setForm({ ...form, phone: e.target.value })}
                          className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium text-sm"
                          placeholder="+1 (555) 000-0000"
                          autoComplete="tel"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="customer-address" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Shipping Address</label>
                      <textarea 
                        required
                        id="customer-address"
                        rows={3}
                        value={form.address}
                        onChange={e => setForm({ ...form, address: e.target.value })}
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium text-sm resize-none"
                        placeholder="Street Address, Build, Apartment"
                        autoComplete="street-address"
                      />
                    </div>

                    <div className="pt-6">
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-700 shadow-xl shadow-blue-100 disabled:opacity-70 transition-all group"
                      >
                        {isSubmitting ? (
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Submit Order <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-auto py-12 px-8 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center text-white">
              <div className="w-3 h-3 border border-white rounded-full"></div>
            </div>
            <span className="font-display font-black text-sm tracking-widest uppercase">MWD MOBILE</span>
          </div>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <a href="#" className="hover:text-black transition-colors">Store</a>
            <a href="#" className="hover:text-black transition-colors">Inventory</a>
            <button 
              onClick={() => setView('admin')}
              className="hover:text-black transition-colors uppercase tracking-widest flex items-center gap-1"
            >
              <ShieldCheck size={12} /> Admin
            </button>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">&copy; 2024 MWD MOBILE INC. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
}
