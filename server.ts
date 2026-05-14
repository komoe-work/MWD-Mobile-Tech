import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory data store for the demo
  let products = [
    {
      id: '1',
      name: 'Redmi Note 13 Pro',
      specs: '8GB RAM + 256GB Storage',
      price: 1150000,
      brand: 'Redmi',
      stock_quantity: 15,
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: '2',
      name: 'Meizu 21',
      specs: '12GB RAM + 512GB Storage',
      price: 1850000,
      brand: 'Meizu',
      stock_quantity: 8,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: '3',
      name: 'OPPO Reno 11 5G',
      specs: '8GB RAM + 256GB Storage',
      price: 1450000,
      brand: 'OPPO',
      stock_quantity: 12,
      image: 'https://images.unsplash.com/photo-1610940882244-5966236ca6d5?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: '4',
      name: 'Redmi Note 13',
      specs: '6GB RAM + 128GB Storage',
      price: 750000,
      brand: 'Redmi',
      stock_quantity: 25,
      image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: '5',
      name: 'Meizu 20 Infinity',
      specs: '16GB RAM + 1TB Storage',
      price: 2650000,
      brand: 'Meizu',
      stock_quantity: 5,
      image: 'https://images.unsplash.com/photo-1592890288564-76628a30a657?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: '6',
      name: 'OPPO A78',
      specs: '8GB RAM + 128GB Storage',
      price: 850000,
      brand: 'OPPO',
      stock_quantity: 10,
      image: 'https://images.unsplash.com/photo-1556656793-062ff98782fe?auto=format&fit=crop&q=80&w=400',
    },
  ];

  let sales: any[] = [];

  // Configure Multer for image uploads
  // Note: In this environment, we'll store images as base64 in the memory store 
  // or just use the preview URL for simplicity since we don't have persistent disk storage.
  const upload = multer({ storage: multer.memoryStorage() });

  // API Routes
  app.get("/api/phone", (req, res) => {
    res.json(products);
  });

  app.post("/api/admin/sale", (req, res) => {
    const { cart, customer, discount, paymentMethod, total } = req.body;
    
    // Process sale and update inventory
    cart.forEach((item: any) => {
      const productIndex = products.findIndex(p => p.id === item.id);
      if (productIndex !== -1) {
        products[productIndex].stock_quantity = Math.max(0, products[productIndex].stock_quantity - item.quantity);
      }
    });

    const newSale = {
      id: `SALE-${Date.now()}`,
      date: new Date(),
      items: cart,
      customer,
      discount,
      paymentMethod,
      total,
    };

    sales.push(newSale);
    res.status(201).json({ message: "Sale processed successfully", sale: newSale });
  });

  app.post("/api/admin/inventory", upload.single("image"), (req, res) => {
    const { name, brand, price, specs, stock_quantity } = req.body;
    let imageUrl = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400"; // Fallback

    if (req.file) {
      // For the demo, convert to base64
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      imageUrl = `data:${req.file.mimetype};base64,${b64}`;
    }

    const newProduct = {
      id: Date.now().toString(),
      name,
      brand,
      price: parseFloat(price),
      specs: specs || "Latest Generation",
      stock_quantity: parseInt(stock_quantity || "0"),
      image: imageUrl,
    };

    products.unshift(newProduct);
    res.status(201).json(newProduct);
  });

  app.delete("/api/phone/:id", (req, res) => {
    const { id } = req.params;
    products = products.filter(p => p.id !== id);
    res.status(200).json({ message: "Product deleted" });
  });

  app.put("/api/phone/:id", upload.single("image"), (req, res) => {
    const { id } = req.params;
    const { name, brand, price, specs, stock_quantity } = req.body;
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ message: "Product not found" });
    }

    let imageUrl = products[index].image;
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      imageUrl = `data:${req.file.mimetype};base64,${b64}`;
    }

    products[index] = {
      ...products[index],
      name: name || products[index].name,
      brand: brand || products[index].brand,
      price: price ? parseFloat(price) : products[index].price,
      specs: specs || products[index].specs,
      stock_quantity: stock_quantity ? parseInt(stock_quantity) : products[index].stock_quantity,
      image: imageUrl
    };

    res.json(products[index]);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
