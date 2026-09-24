const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 8001;
const DATABASE_URL = process.env.DATABASE_URL;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// In-memory fallback if PostgreSQL is not connected yet
let localProducts = [
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
  }
];

let dbPool = null;
let usePostgres = false;

if (DATABASE_URL) {
  try {
    dbPool = new Pool({ connectionString: DATABASE_URL });
    dbPool.query('SELECT 1 FROM product_schema.products LIMIT 1')
      .then(() => {
        usePostgres = true;
        console.log('[PD Service] Successfully connected to PostgreSQL (product_schema)');
      })
      .catch((err) => {
        console.warn('[PD Service] Postgres not ready or schema not found, using isolated resilient store:', err.message);
      });
  } catch (err) {
    console.warn('[PD Service] Pool initialization failed, using isolated store:', err.message);
  }
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    service: 'PD (Product Service)',
    status: 'ONLINE',
    port: PORT,
    database: usePostgres ? 'PostgreSQL (product_schema)' : 'Resilient In-Memory Store',
    timestamp: new Date().toISOString()
  });
});

// 1. Read All Products
app.get('/api/products', async (req, res) => {
  try {
    if (usePostgres && dbPool) {
      const result = await dbPool.query(
        'SELECT id, name, price, sku, description, category_id, image_url, created_at, updated_at FROM product_schema.products ORDER BY created_at DESC'
      );
      return res.json(result.rows);
    }
    return res.json(localProducts);
  } catch (error) {
    console.error('[PD Service] GET /api/products error:', error);
    res.status(500).json({ error: 'Failed to retrieve products', details: error.message });
  }
});

// 2. Read Single Product
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (usePostgres && dbPool) {
      const result = await dbPool.query('SELECT * FROM product_schema.products WHERE id = $1', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
      return res.json(result.rows[0]);
    }
    const product = localProducts.find(p => p.id === id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve product', details: error.message });
  }
});

// 3. Data Consistency Check: Count products in category
app.get('/api/products/count-by-category/:category_id', async (req, res) => {
  const { category_id } = req.params;
  try {
    if (usePostgres && dbPool) {
      const result = await dbPool.query(
        'SELECT COUNT(*)::int as count FROM product_schema.products WHERE category_id = $1',
        [category_id]
      );
      return res.json({ category_id, count: result.rows[0].count });
    }
    const count = localProducts.filter(p => p.category_id === category_id).length;
    return res.json({ category_id, count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to count products by category', details: error.message });
  }
});

// 4. Create Product
app.post('/api/products', async (req, res) => {
  const { name, price, sku, description, category_id, image_url } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Product name is required' });
  }
  if (!category_id) {
    return res.status(400).json({ error: 'Category ID is required' });
  }

  const id = `prod-${Date.now().toString(36)}`;
  const now = new Date().toISOString();
  const parsedPrice = parseFloat(price) || 0.00;
  const productSku = sku && sku.trim() ? sku.trim() : `SKU-${Date.now().toString().slice(-6)}`;

  try {
    if (usePostgres && dbPool) {
      const result = await dbPool.query(
        `INSERT INTO product_schema.products 
         (id, name, price, sku, description, category_id, image_url, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [id, name.trim(), parsedPrice, productSku, description || '', category_id, image_url || '', now, now]
      );
      return res.status(201).json(result.rows[0]);
    }

    const newProduct = {
      id,
      name: name.trim(),
      price: parsedPrice,
      sku: productSku,
      description: description || '',
      category_id,
      image_url: image_url || '',
      created_at: now,
      updated_at: now
    };
    localProducts.unshift(newProduct);
    return res.status(201).json(newProduct);
  } catch (error) {
    console.error('[PD Service] POST /api/products error:', error);
    res.status(500).json({ error: 'Failed to create product', details: error.message });
  }
});

// 5. Update Product
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, sku, description, category_id, image_url } = req.body;
  const now = new Date().toISOString();

  try {
    if (usePostgres && dbPool) {
      const result = await dbPool.query(
        `UPDATE product_schema.products 
         SET name = COALESCE($1, name), 
             price = COALESCE($2, price), 
             sku = COALESCE($3, sku),
             description = COALESCE($4, description),
             category_id = COALESCE($5, category_id),
             image_url = COALESCE($6, image_url),
             updated_at = $7
         WHERE id = $8 RETURNING *`,
        [
          name ? name.trim() : null,
          price !== undefined ? parseFloat(price) : null,
          sku ? sku.trim() : null,
          description !== undefined ? description : null,
          category_id || null,
          image_url !== undefined ? image_url : null,
          now,
          id
        ]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
      return res.json(result.rows[0]);
    }

    const index = localProducts.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Product not found' });

    localProducts[index] = {
      ...localProducts[index],
      name: name ? name.trim() : localProducts[index].name,
      price: price !== undefined ? parseFloat(price) : localProducts[index].price,
      sku: sku ? sku.trim() : localProducts[index].sku,
      description: description !== undefined ? description : localProducts[index].description,
      category_id: category_id || localProducts[index].category_id,
      image_url: image_url !== undefined ? image_url : localProducts[index].image_url,
      updated_at: now
    };
    return res.json(localProducts[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product', details: error.message });
  }
});

// 6. Delete Product
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (usePostgres && dbPool) {
      const result = await dbPool.query('DELETE FROM product_schema.products WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
      return res.json({ success: true, message: 'Product deleted', deleted: result.rows[0] });
    }

    const index = localProducts.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Product not found' });

    const deleted = localProducts.splice(index, 1)[0];
    return res.json({ success: true, message: 'Product deleted', deleted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[PD Service] Running on port ${PORT}`);
});
