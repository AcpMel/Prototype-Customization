const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3001;

// Enable CORS and body parsers
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Directories
const publicDir = path.join(__dirname, 'public');
const uploadsDir = path.join(publicDir, 'uploads');
const modelsDir = path.join(publicDir, 'models');
const samplesDir = path.join(publicDir, 'samples');
const dataDir = path.join(__dirname, 'data');
const designsFile = path.join(dataDir, 'designs.json');
const ordersFile = path.join(dataDir, 'orders.json');

// Ensure directories exist
[publicDir, uploadsDir, modelsDir, samplesDir, dataDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure Multer for custom logo/image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, `${safeBase}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|svg\+xml|svg|webp|gif/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const mime = file.mimetype.toLowerCase();
    if (allowed.test(ext) || allowed.test(mime)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (PNG, JPG, SVG, WebP, GIF) are allowed.'));
    }
  },
});

// Static routes
app.use('/models', express.static(modelsDir));
app.use('/uploads', express.static(uploadsDir));
app.use('/samples', express.static(samplesDir));
app.use(express.static(publicDir));

// Serve production build if exists
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

// Helper functions for JSON database
function readJson(file, defaultData = []) {
  try {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      return JSON.parse(content || '[]');
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
  }
  return defaultData;
}

function writeJson(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
    return false;
  }
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    modelAvailable: fs.existsSync(path.join(modelsDir, 'shape-3.glb')),
  });
});

// 2. Product metadata & configuration
app.get('/api/product', (req, res) => {
  res.json({
    id: 'shape-3-award',
    name: 'Prism Crystal Peak Award with Pedestal',
    subtitle: 'Customizable 3D Optical Crystal Trophy & Plaque',
    description: 'A striking modern pinnacle award crafted from optical grade crystal with a solid precision-milled base. Fully customizable with dynamic text engraving, company logos, full-color emblems, and premium material finishes.',
    modelUrl: '/models/shape-3.glb',
    dimensions: {
      height: '10.2 inches (260 mm)',
      width: '4.8 inches (122 mm)',
      depth: '4.8 inches (122 mm)',
      printableArea: '1024 x 1024 px UV map',
    },
    materials: {
      basePresets: [
        { id: 'piano-black', name: 'Piano Black Lacquer', color: '#111111', roughness: 0.2, metalness: 0.1 },
        { id: 'brushed-gold', name: 'Brushed Royal Gold', color: '#C5A059', roughness: 0.35, metalness: 0.85 },
        { id: 'polished-silver', name: 'Mirror Chrome Silver', color: '#E8E8E8', roughness: 0.1, metalness: 0.95 },
        { id: 'walnut-wood', name: 'Rich Dark Walnut', color: '#3E2723', roughness: 0.65, metalness: 0.05 },
        { id: 'midnight-navy', name: 'Midnight Navy', color: '#0F172A', roughness: 0.25, metalness: 0.3 },
        { id: 'pure-white', name: 'Arctic White Gloss', color: '#FAFAFA', roughness: 0.15, metalness: 0.1 }
      ],
      bodyPresets: [
        { id: 'crystal-glass', name: 'Optical Crystal Clear', color: '#FFFFFF', transmission: 0.95, roughness: 0.05, ior: 1.52 },
        { id: 'frosted-acrylic', name: 'Frosted Satin Crystal', color: '#EBF8FF', transmission: 0.8, roughness: 0.35, ior: 1.49 },
        { id: 'smoked-obsidian', name: 'Smoked Quartz / Dark Crystal', color: '#18181B', transmission: 0.45, roughness: 0.15, ior: 1.5 },
        { id: 'golden-mirror', name: 'Polished Brass & Gold', color: '#D4AF37', transmission: 0.0, roughness: 0.2, metalness: 0.85 },
        { id: 'ice-blue', name: 'Glacier Blue Crystal', color: '#90E0EF', transmission: 0.85, roughness: 0.08, ior: 1.51 }
      ]
    },
    sampleLogos: [
      { id: 'laurel', name: 'Golden Laurel Wreath', url: '/samples/laurel-wreath.svg' },
      { id: 'star', name: 'Golden Star Emblem', url: '/samples/star-emblem.svg' },
      { id: 'tech', name: 'Tech Innovation Shield', url: '/samples/tech-shield.svg' },
      { id: 'seal', name: 'Corporate Crest Seal', url: '/samples/corporate-seal.svg' }
    ]
  });
});

// 3. Upload image endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }
  const publicUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    url: publicUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
});

// 4. Saved Designs CRUD
app.get('/api/designs', (req, res) => {
  const designs = readJson(designsFile, []);
  res.json(designs);
});

app.get('/api/designs/:id', (req, res) => {
  const designs = readJson(designsFile, []);
  const design = designs.find((d) => d.id === req.params.id);
  if (!design) {
    return res.status(404).json({ error: 'Design not found' });
  }
  res.json(design);
});

app.post('/api/designs', (req, res) => {
  const designs = readJson(designsFile, []);
  const newDesign = {
    id: req.body.id || 'design-' + Date.now(),
    name: req.body.name || 'Untitled Custom Design',
    createdAt: new Date().toISOString(),
    thumbnail: req.body.thumbnail || null, // Base64 or snapshot URL
    baseMaterial: req.body.baseMaterial,
    bodyMaterial: req.body.bodyMaterial,
    textLayers: req.body.textLayers || [],
    imageLayers: req.body.imageLayers || [],
  };

  const existingIndex = designs.findIndex((d) => d.id === newDesign.id);
  if (existingIndex >= 0) {
    designs[existingIndex] = { ...designs[existingIndex], ...newDesign, updatedAt: new Date().toISOString() };
  } else {
    designs.unshift(newDesign);
  }

  writeJson(designsFile, designs);
  res.status(201).json({ success: true, design: newDesign });
});

app.delete('/api/designs/:id', (req, res) => {
  let designs = readJson(designsFile, []);
  const initialLength = designs.length;
  designs = designs.filter((d) => d.id !== req.params.id);
  if (designs.length === initialLength) {
    return res.status(404).json({ error: 'Design not found' });
  }
  writeJson(designsFile, designs);
  res.json({ success: true, message: 'Design deleted successfully' });
});

// 5. Orders / Quotes
app.get('/api/orders', (req, res) => {
  const orders = readJson(ordersFile, []);
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const orders = readJson(ordersFile, []);
  const orderId = 'ORD-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 900 + 100);

  const newOrder = {
    orderId,
    createdAt: new Date().toISOString(),
    status: 'Pending Review',
    customer: req.body.customer || {},
    quantity: req.body.quantity || 1,
    notes: req.body.notes || '',
    design: req.body.design || {},
    estimatedTotal: (req.body.quantity || 1) * 149.0, // Mock prototype price
  };

  orders.unshift(newOrder);
  writeJson(ordersFile, orders);

  res.status(201).json({
    success: true,
    message: 'Order placed successfully!',
    orderId: newOrder.orderId,
    order: newOrder,
  });
});

// Fallback for SPA in production
app.get('*', (req, res) => {
  if (fs.existsSync(path.join(distDir, 'index.html'))) {
    res.sendFile(path.join(distDir, 'index.html'));
  } else {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><title>3D Customizer Backend</title></head>
        <body style="font-family:sans-serif;padding:40px;background:#111;color:#fff;">
          <h2>3D Customizer API Server Running</h2>
          <p>API endpoints available at <a href="/api/product" style="color:#e2ba5e;">/api/product</a> and <a href="/api/designs" style="color:#e2ba5e;">/api/designs</a>.</p>
          <p>Run <code>npm run dev</code> for full React 3D Customizer studio!</p>
        </body>
      </html>
    `);
  }
});

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`\n===============================================================`);
    console.log(`  ✦ 3D Product Customizer Backend`);
    console.log(`  ✦ Express API Server active on: http://localhost:${port}`);
    console.log(`  ✦ Product Endpoint: http://localhost:${port}/api/product`);
    console.log(`  ✦ 3D Model file: http://localhost:${port}/models/shape-3.glb`);
    console.log(`===============================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Warning] Port ${port} is in use. Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(PORT);
