import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Printer,
  ChevronRight,
  User,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface POSProduct {
  id: string;
  name: string;
  specs: string;
  price: number;
  image: string;
  brand: string;
  stock_quantity: number;
  imei_list?: string;
  additional_info?: string;
}

interface CartItem extends POSProduct {
  quantity: number;
}

interface POSSystemProps {
  onBack: () => void;
}

export default function POSSystem({ onBack }: POSSystemProps) {
  const [products, setProducts] = useState<POSProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'KBZPay' | 'WavePay'>('Cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
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

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: POSProduct) => {
    if (product.stock_quantity <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) return prev;
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const product = products.find(p => p.id === id);
        const maxStock = product?.stock_quantity || 0;
        const newQty = Math.min(maxStock, Math.max(0, item.quantity + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const total = Math.max(0, subtotal - discount);

  const handleProcessPayment = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/admin/sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: cart.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price })),
          customer,
          discount,
          paymentMethod,
          total
        })
      });

      if (res.ok) {
        setShowSuccess(true);
        // Trigger print
        setTimeout(() => window.print(), 500);
        
        setTimeout(() => {
          setShowSuccess(false);
          setCart([]);
          setCustomer({ name: '', phone: '' });
          setDiscount(0);
          fetchProducts();
        }, 2000);
      }
    } catch (err) {
      console.error("Payment processing failed", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString() + ' Ks';
  };

  return (
    <>
      <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans print:hidden">
      {/* Left Column: Inventory Grid */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200">
        <header className="p-6 bg-white border-b border-slate-200 flex items-center gap-6">
          <button 
            onClick={onBack}
            className="p-3 hover:bg-slate-50 rounded-2xl transition-colors border border-slate-100 group"
            title="Back"
          >
            <ArrowLeft size={24} className="text-slate-400 group-hover:text-black" />
          </button>
          
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search assets or brands..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-2xl">
             <Smartphone size={18} />
             <span className="text-[10px] font-black uppercase tracking-widest">{products.length} SKU</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
              <Loader2 size={48} className="animate-spin stroke-1" />
              <p className="text-xs font-bold uppercase tracking-widest">Synchronizing Local Nodes...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <motion.button
                  key={product.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addToCart(product)}
                  disabled={product.stock_quantity <= 0}
                  className={`group relative text-left bg-white p-4 rounded-[2rem] border transition-all shadow-sm flex flex-col h-full ${product.stock_quantity <= 0 ? 'opacity-50 grayscale' : 'hover:border-black hover:shadow-xl hover:shadow-black/5'} ${cart.some(item => item.id === product.id) ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/10' : 'border-slate-200'}`}
                >
                  <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 mb-4 border border-slate-100 relative">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter shadow-lg">
                        Low Stock: {product.stock_quantity}
                      </div>
                    )}
                    {product.stock_quantity === 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-black uppercase tracking-widest text-xs">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 mb-4 flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.brand}</p>
                    <h3 className="font-display font-black text-sm uppercase leading-tight tracking-tight">{product.name}</h3>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="font-bold text-lg tracking-tighter">{formatPrice(product.price)}</span>
                    <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={16} />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Right Column: Register */}
      <div className="w-[450px] bg-white flex flex-col shadow-2xl relative z-10">
        <header className="p-8 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div>
            <h2 className="font-display font-black text-3xl tracking-tighter uppercase">Current Sale</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Register #021 - {new Date().toLocaleDateString()}</p>
          </div>
          <button 
            onClick={() => setCart([])}
            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
            title="Clear Cart"
          >
            <Trash2 size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
          <AnimatePresence mode="popLayout">
            {cart.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-slate-200 gap-4"
              >
                <ShoppingCart size={100} strokeWidth={1} />
                <p className="font-bold uppercase tracking-widest text-sm">Cart is currently empty</p>
              </motion.div>
            ) : (
              cart.map(item => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex gap-4 items-center group"
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-xs uppercase tracking-tight truncate">{item.name}</h4>
                    <p className="text-blue-600 font-bold text-sm">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-2 hover:bg-slate-50 text-slate-400 hover:text-black transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-black text-xs">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-2 hover:bg-slate-50 text-slate-400 hover:text-black transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-200 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Customer Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="text" 
                    placeholder="Optional"
                    value={customer.name}
                    onChange={e => setCustomer({ ...customer, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-black transition-all text-xs font-bold"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="tel" 
                    placeholder="Optional"
                    value={customer.phone}
                    onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-black transition-all text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Discount (Ks)</label>
                <div className="relative">
                  <Banknote size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="number" 
                    placeholder="0"
                    value={discount || ''}
                    onChange={e => setDiscount(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-black transition-all text-xs font-bold"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['Cash', 'KBZPay', 'WavePay'] as const).map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-3 text-[9px] font-black uppercase rounded-2xl border transition-all ${paymentMethod === method ? 'bg-black text-white border-black' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 tracking-widest">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[10px] font-bold uppercase text-red-500 tracking-widest">
                <span>Discount</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-end pt-2">
              <span className="font-display font-black text-2xl uppercase tracking-tighter">Total Due</span>
              <span className="font-display font-black text-4xl text-blue-600 tracking-tighter">{formatPrice(total)}</span>
            </div>
          </div>

          <button 
            disabled={cart.length === 0 || isProcessing}
            onClick={handleProcessPayment}
            className="w-full py-6 bg-black text-white rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 shadow-2xl shadow-black/20 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            <div className="relative z-10 flex items-center gap-3">
              {isProcessing ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  Process Payment & Print <Printer size={20} />
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Success Notification overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-blue-600/95 backdrop-blur-md flex flex-col items-center justify-center text-white text-center p-8"
          >
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12 }}
            >
              <CheckCircle2 size={120} strokeWidth={2.5} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 space-y-4"
            >
              <h2 className="font-display font-black text-6xl uppercase tracking-tighter">Sale Complete</h2>
              <p className="text-xl font-medium text-blue-100 uppercase tracking-[0.3em]">Transaction successfully logged</p>
              <div className="pt-8">
                 <div className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-full font-black text-xs uppercase tracking-widest">
                    Printing Receipt... <Loader2 size={16} className="animate-spin" />
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* Thermal Receipt (Print Only) */}
      <div className="hidden print:block w-[80mm] text-black bg-white p-4 font-mono text-[10px] leading-tight">
        <div className="text-center space-y-1 mb-4">
          <h1 className="text-sm font-bold uppercase">MWD MOBILE TECH</h1>
          <p>No. 123, Main Street, Yangon</p>
          <p>Tel: 09-123456789</p>
        </div>

        <div className="space-y-1 mb-4">
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{new Date().toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Receipt:</span>
            <span>#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
          </div>
          {customer.name && (
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="truncate max-w-[150px]">{customer.name}</span>
            </div>
          )}
        </div>

        <div className="border-t border-dashed border-black my-2"></div>
        
        <div className="space-y-2">
          {cart.map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between">
                <span className="flex-1 pr-2">{item.quantity} x {item.name}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
              {item.imei_list && (
                <div className="text-[8px] pl-4 italic">IMEI: {item.imei_list}</div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-black my-2"></div>

        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm pt-1">
            <span>TOTAL:</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        <div className="mt-4">
          <span className="font-bold">Payment: {paymentMethod}</span>
        </div>

        <div className="text-center mt-8 space-y-1 pt-4 border-t border-dashed border-black">
          <p>Thank you for your purchase!</p>
          <p>No returns without receipt.</p>
        </div>
      </div>
    </>
  );
}
