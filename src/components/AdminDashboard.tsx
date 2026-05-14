import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Pencil,
  Image as ImageIcon, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Package,
  DollarSign,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Product {
  id: string;
  name: string;
  specs: string;
  price: number;
  image: string;
  brand: string;
  stock_quantity: number;
}

interface AdminDashboardProps {
  onBack: () => void;
  lang: 'mm' | 'en';
}

const TRANSLATIONS = {
  mm: {
    back_to_store: "အရောင်းဆိုင်သို့ ပြန်သွားမည်",
    admin_console: "စီမံခန့်ခွဲရေးဌာန",
    admin_desc: "ကုန်ပစ္စည်းစာရင်းနှင့် အချက်အလက်များကို စီမံခန့်ခွဲပါ။",
    total_sku: "စုစုပေါင်း ပစ္စည်းအရေအတွက်",
    edit_asset: "အချက်အလက် ပြင်ဆင်မည်",
    new_asset: "ကုန်ပစ္စည်းအသစ် ထည့်သွင်းမည်",
    cancel: "ပယ်ဖျက်မည်",
    brand_name: "တံဆိပ်အမည်",
    model_name: "မော်ဒယ်အမည်",
    price_ks: "ဈေးနှုန်း (ကျပ်)",
    specs: "အချက်အလက်များ",
    product_visual: "ကုန်ပစ္စည်းပုံစံ",
    upload_frame: "ပုံတင်မည်",
    commit_to_catalog: "စာရင်းထဲသို့ ထည့်မည်",
    update_catalog: "စာရင်း ပြင်ဆင်မည်",
    active_inventory: "လက်ရှိ ပစ္စည်းစာရင်း",
    hardware: "ပစ္စည်းအမျိုးအမည်",
    specifications: "အသေးစိတ် အချက်အလက်များ",
    valuation: "ဈေးနှုန်း",
    stock: "လက်ကျန်",
    actions: "လုပ်ဆောင်ချက်များ",
    syncing_nodes: "စနစ်များ ချိတ်ဆက်နေသည်...",
    no_assets: "မည်သည့် ပစ္စည်းမှ မရှိသေးပါ။",
    system_analytics: "စနစ်ပိုင်းဆိုင်ရာ သုံးသပ်ချက်",
    cloud_sync: "Cloud ချိတ်ဆက်မှု: အောင်မြင်သည်",
    online_nodes: "အွန်လိုင်း ချိတ်ဆက်မှုများ",
    confirmation_delete: "ဤကုန်ပစ္စည်းကို ဖျက်ရန် သေချာပါသလား?",
    success_add: "ကုန်ပစ္စည်းကို အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ။",
    success_update: "ကုန်ပစ္စည်းကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ။",
    failed_save: "သိမ်းဆည်းရာတွင် အမှားအယွင်းရှိပါသည်။ ပြန်လည် ကြိုးစားကြည့်ပါ။",
  },
  en: {
    back_to_store: "Back to Store",
    admin_console: "Admin Console",
    admin_desc: "Manage your product catalog and global inventory.",
    total_sku: "Total SKU",
    edit_asset: "Edit Asset",
    new_asset: "New Technical Asset",
    cancel: "Cancel",
    brand_name: "Brand Name",
    model_name: "Model Name",
    price_ks: "Price (Ks)",
    specs: "Specs",
    product_visual: "Product Visual",
    upload_frame: "Upload Frame",
    commit_to_catalog: "Commit to Catalog",
    update_catalog: "Update Catalog",
    active_inventory: "Active Inventory",
    hardware: "Hardware",
    specifications: "Specifications",
    valuation: "Valuation",
    stock: "Stock",
    actions: "Actions",
    syncing_nodes: "Synchronizing Nodes...",
    no_assets: "No active assets found.",
    system_analytics: "System Analytics",
    cloud_sync: "Cloud Sync: Synchronized",
    online_nodes: "Online Nodes",
    confirmation_delete: "Are you sure you want to delete this product?",
    success_add: "Product added successfully!",
    success_update: "Product updated successfully!",
    failed_save: "Failed to save product. Please try again.",
  }
};

export default function AdminDashboard({ onBack, lang }: AdminDashboardProps) {
  const t = TRANSLATIONS[lang];
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    specs: '',
    stock_quantity: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  const formatPrice = (price: number) => {
    return price.toLocaleString() + ' Ks';
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      brand: product.brand,
      price: product.price.toString(),
      specs: product.specs,
      stock_quantity: product.stock_quantity.toString()
    });
    setPreviewUrl(product.image);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', brand: '', price: '', specs: '', stock_quantity: '' });
    setImageFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('brand', formData.brand);
    data.append('price', formData.price);
    data.append('specs', formData.specs);
    data.append('stock_quantity', formData.stock_quantity);
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      const url = editingId ? `/api/phone/${editingId}` : '/api/admin/inventory';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: data
      });

      if (res.ok) {
        setStatus({ type: 'success', msg: editingId ? t.success_update : t.success_add });
        setFormData({ name: '', brand: '', price: '', specs: '' });
        setImageFile(null);
        setPreviewUrl(null);
        setEditingId(null);
        fetchProducts();
      } else {
        throw new Error('Failed to save product');
      }
    } catch (err) {
      setStatus({ type: 'error', msg: t.failed_save });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.confirmation_delete)) return;

    try {
      const res = await fetch(`/api/phone/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete product", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 space-y-12">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-black transition-colors mb-4 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{t.back_to_store}</span>
          </button>
          <h1 className="font-display font-black text-4xl tracking-tight uppercase">{t.admin_console}</h1>
          <p className="text-slate-500 font-medium">{t.admin_desc}</p>
        </div>
        
        <div className="flex gap-4">
          <div className="px-6 py-4 bg-white rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Package size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{t.total_sku}</p>
              <p className="text-xl font-bold">{products.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Column */}
        <section className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm sticky top-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display font-bold text-xl flex items-center gap-2">
              {editingId ? <Pencil size={20} className="text-blue-600" /> : <Plus size={20} className="text-blue-600" />}
              {editingId ? t.edit_asset : t.new_asset}
            </h2>
            {editingId && (
              <button 
                onClick={cancelEdit}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
              >
                {t.cancel}
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="brand-name" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{t.brand_name}</label>
              <input 
                required
                id="brand-name"
                type="text"
                placeholder="e.g. Redmi, Meizu"
                value={formData.brand}
                onChange={e => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium text-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="model-name" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{t.model_name}</label>
              <input 
                required
                id="model-name"
                type="text"
                placeholder="e.g. Note 13 Pro"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="product-price" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{t.price_ks}</label>
                <input 
                  required
                  id="product-price"
                  type="number"
                  placeholder="1,200,000"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium text-sm"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="product-stock" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{t.stock || 'Stock'}</label>
                <input 
                  required
                  id="product-stock"
                  type="number"
                  placeholder="10"
                  value={formData.stock_quantity}
                  onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium text-sm"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="product-specs" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{t.specs}</label>
                <input 
                  id="product-specs"
                  type="text"
                  placeholder="12GB / 256GB"
                  value={formData.specs}
                  onChange={e => setFormData({ ...formData, specs: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium text-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label htmlFor="product-visual" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block">{t.product_visual}</label>
              <div 
                className={`relative h-48 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 overflow-hidden ${previewUrl ? 'border-blue-500 bg-blue-50/10' : 'border-slate-200 bg-slate-50'}`}
              >
                {previewUrl ? (
                  <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover" loading="lazy" width="192" height="192" alt="Product preview" />
                ) : (
                  <>
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400">
                      <ImageIcon size={24} />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.upload_frame}</span>
                  </>
                )}
                <input 
                  id="product-visual"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  aria-label="Upload product image"
                />
              </div>
            </div>

            <AnimatePresence>
              {status && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}
                >
                  {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <span className="text-xs font-bold uppercase tracking-tight">{status.msg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              disabled={isSubmitting}
              type="submit"
              className="w-full py-5 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-800 disabled:opacity-50 shadow-lg shadow-black/10 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                 <Loader2 size={20} className="animate-spin" />
              ) : (
                editingId ? t.update_catalog : t.commit_to_catalog
              )}
            </button>
          </form>
        </section>

        {/* Table Column */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-display font-bold text-xl flex items-center gap-2 uppercase tracking-tight">
                <Package size={20} className="text-blue-600" /> {t.active_inventory}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.hardware}</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.specifications}</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.stock || 'Stock'}</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.valuation}</th>
                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 text-slate-400">
                           <Loader2 size={40} className="animate-spin stroke-1" />
                           <span className="text-[10px] font-bold uppercase tracking-widest">{t.syncing_nodes}</span>
                        </div>
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-slate-400">
                         <span className="text-[10px] font-bold uppercase tracking-widest">{t.no_assets}</span>
                      </td>
                    </tr>
                  ) : (
                    products.map(product => (
                      <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shrink-0">
                              <img src={product.image} className="w-full h-full object-cover" loading="lazy" width="48" height="48" alt={product.name} />
                            </div>
                            <div>
                              <p className="font-black text-sm uppercase tracking-tight leading-tight">{product.name}</p>
                              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">{product.brand}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                           <span className="text-xs font-medium text-slate-600">{product.specs}</span>
                        </td>
                        <td className="px-8 py-5">
                           <span className={`text-xs font-bold ${product.stock_quantity <= 5 ? 'text-red-500' : 'text-slate-600'}`}>
                             {product.stock_quantity}
                           </span>
                        </td>
                        <td className="px-8 py-5">
                           <span className="font-bold text-slate-900">{formatPrice(product.price)}</span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleEdit(product)}
                              className="p-3 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                              aria-label={`Edit ${product.name}`}
                            >
                              <Pencil size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(product.id)}
                              className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              aria-label={`Delete ${product.name}`}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-blue-600 rounded-[2rem] p-8 text-white flex items-center justify-between overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
            <div className="relative z-10 space-y-2">
              <h4 className="font-black text-2xl uppercase tracking-tighter">{t.system_analytics}</h4>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">{t.cloud_sync}</p>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_#4ade80]" />
                 <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{t.online_nodes}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
