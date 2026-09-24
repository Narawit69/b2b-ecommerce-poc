/**
 * Unified Microservices Gateway & Next.js Server
 * B2B E-commerce Product Management Phase (PoC)
 * 
 * Allows deploying the entire microservices architecture
 * as a single Free-tier Web Service on Render / Railway / Cloud
 * without requiring any credit card or payment info!
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 3000;

// Initialize Next.js app located in ./frontend
const nextApp = next({ dev, dir: path.join(__dirname, 'frontend') });
const handle = nextApp.getRequestHandler();

// Storage setup for FileStory
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer for upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

// -------------------------------------------------------------------------
// Initial Data Store (PostgreSQL-compatible In-Memory Store)
// -------------------------------------------------------------------------
let categories = [
  { id: 'cat-001', name: 'Hardware & IoT', sort_order: 1, status: 'ACTIVE' },
  { id: 'cat-002', name: 'Cloud Solutions', sort_order: 2, status: 'ACTIVE' },
  { id: 'cat-003', name: 'Enterprise Software', sort_order: 3, status: 'ACTIVE' },
  { id: 'cat-004', name: 'Supply Chain & Logistics', sort_order: 4, status: 'ACTIVE' },
  { id: 'cat-005', name: 'Cybersecurity & Network Defense', sort_order: 5, status: 'ACTIVE' },
  { id: 'cat-006', name: 'AI & Data Analytics Platform', sort_order: 6, status: 'ACTIVE' }
];

let products = [
  {
    id: 'prod-001',
    name: 'Enterprise ERP Suite',
    price: 14500.00,
    sku: 'EP-ERP-001',
    description: 'Comprehensive enterprise resource planning software for large scale B2B businesses.',
    category_id: 'cat-003',
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-002',
    name: 'Global Supply Chain Pro',
    price: 8200.00,
    sku: 'EP-ERP-002',
    description: 'Intelligent inventory and freight tracking logistics automation platform.',
    category_id: 'cat-004',
    image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-003',
    name: 'Industrial IoT Sensor Kit',
    price: 350.00,
    sku: 'EP-ERP-003',
    description: 'Ruggedized wireless vibration and thermal sensors for manufacturing factories.',
    category_id: 'cat-001',
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-004',
    name: 'Hybrid Cloud Gateway Box',
    price: 1299.99,
    sku: 'EP-ERP-004',
    description: 'Edge computing appliance for seamless on-premise to cloud data synchronization.',
    category_id: 'cat-002',
    image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-005',
    name: 'Next-Gen AI Edge Accelerator',
    price: 3200.00,
    sku: 'EP-AI-101',
    description: 'High-performance TPU accelerator board for real-time edge computer vision inference.',
    category_id: 'cat-006',
    image_url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-006',
    name: 'Zero-Trust Enterprise Firewall Gateway',
    price: 6800.00,
    sku: 'EP-SEC-202',
    description: 'Hardware security appliance featuring deep packet inspection and automated intrusion prevention.',
    category_id: 'cat-005',
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-007',
    name: 'Industrial SCADA Monitoring Controller',
    price: 1450.00,
    sku: 'EP-IOT-303',
    description: 'DIN-rail mountable PLC and telemetry controller for automated factory machinery.',
    category_id: 'cat-001',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-008',
    name: 'Smart Automated Forklift Fleet Manager',
    price: 19500.00,
    sku: 'EP-LOG-404',
    description: 'Centralized telemetry hub for autonomous guided vehicles and warehouse logistics robotics.',
    category_id: 'cat-004',
    image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-009',
    name: 'Distributed Cloud Kubernetes Engine Box',
    price: 9800.00,
    sku: 'EP-CLD-505',
    description: 'Plug-and-play bare metal Kubernetes cluster appliance with built-in zero-downtime failover.',
    category_id: 'cat-002',
    image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-010',
    name: 'Automated Threat Detection & SIEM Software',
    price: 12400.00,
    sku: 'EP-SEC-606',
    description: 'Enterprise SIEM security platform with machine learning-driven anomaly detection.',
    category_id: 'cat-005',
    image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-011',
    name: 'B2B Multi-Vendor Billing & Invoicing Engine',
    price: 5200.00,
    sku: 'EP-ERP-707',
    description: 'Automated recurring billing, tax calculation, and multi-currency settlement gateway.',
    category_id: 'cat-003',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-012',
    name: 'IoT Environmental Air & Gas Sensor Node',
    price: 490.00,
    sku: 'EP-IOT-808',
    description: 'Industrial hazardous gas and particulate matter monitor with LoRaWAN wireless connectivity.',
    category_id: 'cat-001',
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-013',
    name: 'High-Speed Cold Storage Archive Appliance',
    price: 15300.00,
    sku: 'EP-CLD-909',
    description: 'Petabyte-scale on-premise object storage appliance compatible with S3 API protocol.',
    category_id: 'cat-002',
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-014',
    name: 'Real-Time GPS Fleet Telematics Tracker',
    price: 280.00,
    sku: 'EP-LOG-010',
    description: 'Ruggedized 4G LTE vehicle tracking unit with OBD-II diagnostic telemetry sensors.',
    category_id: 'cat-004',
    image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  }
];

nextApp.prepare().then(() => {
  const server = express();

  server.use(cors());
  server.use(express.json());
  server.use('/uploads', express.static(UPLOAD_DIR));

  // -----------------------------------------------------------------------
  // Microservice Health Endpoints
  // -----------------------------------------------------------------------
  server.get('/api/health', (req, res) => {
    res.json({
      status: 'ONLINE',
      services: {
        pd: { name: 'PD (Product Service)', status: 'ONLINE' },
        ca: { name: 'CA (Category Service)', status: 'ONLINE' },
        fileStory: { name: 'FileStory Gateway', status: 'ONLINE' }
      },
      timestamp: new Date().toISOString()
    });
  });

  server.get('/api/health/pd', (req, res) => res.json({ service: 'PD', status: 'ONLINE' }));
  server.get('/api/health/ca', (req, res) => res.json({ service: 'CA', status: 'ONLINE' }));
  server.get('/api/health/filestory', (req, res) => res.json({ service: 'FileStory', status: 'ONLINE' }));

  // -----------------------------------------------------------------------
  // CA Service APIs (Category Management)
  // -----------------------------------------------------------------------
  server.get('/api/categories', (req, res) => {
    const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order);
    res.json(sorted);
  });

  server.get('/api/categories/:id', (req, res) => {
    const cat = categories.find(c => c.id === req.params.id);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    res.json(cat);
  });

  server.post('/api/categories', (req, res) => {
    const { name, sort_order = 0, status = 'ACTIVE' } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const newCat = {
      id: `cat-${Date.now().toString(36)}`,
      name: name.trim(),
      sort_order: parseInt(sort_order, 10) || 0,
      status
    };
    categories.push(newCat);
    res.status(201).json(newCat);
  });

  server.put('/api/categories/:id', (req, res) => {
    const idx = categories.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Category not found' });
    categories[idx] = { ...categories[idx], ...req.body };
    res.json(categories[idx]);
  });

  server.delete('/api/categories/:id', (req, res) => {
    const idx = categories.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Category not found' });
    const deleted = categories.splice(idx, 1)[0];
    res.json({ success: true, deleted });
  });

  // -----------------------------------------------------------------------
  // PD Service APIs (Product Management)
  // -----------------------------------------------------------------------
  server.get('/api/products', (req, res) => {
    res.json(products);
  });

  server.get('/api/products/count-by-category/:cat_id', (req, res) => {
    const count = products.filter(p => p.category_id === req.params.cat_id).length;
    res.json({ category_id: req.params.cat_id, count });
  });

  server.get('/api/products/:id', (req, res) => {
    const prod = products.find(p => p.id === req.params.id);
    if (!prod) return res.status(404).json({ error: 'Product not found' });
    res.json(prod);
  });

  server.post('/api/products', (req, res) => {
    const { name, price, sku, description, category_id, image_url } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const newProd = {
      id: `prod-${Date.now().toString(36)}`,
      name: name.trim(),
      price: parseFloat(price) || 0,
      sku: sku || `SKU-${Date.now().toString().slice(-5)}`,
      description: description || '',
      category_id,
      image_url: image_url || '',
      created_at: new Date().toISOString()
    };
    products.unshift(newProd);
    res.status(201).json(newProd);
  });

  server.put('/api/products/:id', (req, res) => {
    const idx = products.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });
    products[idx] = { ...products[idx], ...req.body };
    res.json(products[idx]);
  });

  server.delete('/api/products/:id', (req, res) => {
    const idx = products.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });
    const deleted = products.splice(idx, 1)[0];
    res.json({ success: true, message: 'Product deleted', deleted });
  });

  // -----------------------------------------------------------------------
  // FileStory APIs (Media Gateway)
  // -----------------------------------------------------------------------
  server.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    const ext = path.extname(req.file.originalname) || '.png';
    const filename = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    fs.writeFileSync(filePath, req.file.buffer);

    const protocol = req.protocol || 'http';
    const host = req.get('host') || `localhost:${PORT}`;
    const url = `${protocol}://${host}/uploads/${filename}`;

    res.status(201).json({ success: true, filename, url });
  });

  server.delete('/api/files/:filename', (req, res) => {
    const filePath = path.join(UPLOAD_DIR, req.params.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ success: true, message: `File ${req.params.filename} removed` });
  });

  server.delete('/api/files', (req, res) => {
    const fileUrl = req.query.url;
    if (fileUrl) {
      try {
        const filename = path.basename(new URL(fileUrl).pathname);
        const filePath = path.join(UPLOAD_DIR, filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) {}
    }
    res.json({ success: true, message: 'File removed' });
  });

  // -----------------------------------------------------------------------
  // Next.js Handler (All Frontend Pages)
  // -----------------------------------------------------------------------
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(PORT, () => {
    console.log(`> B2B ProStore Unified App running on port ${PORT}`);
  });
});
