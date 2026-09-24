const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 8002;
const DATABASE_URL = process.env.DATABASE_URL;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// In-memory fallback if PostgreSQL is not connected yet
let localCategories = [
  { id: 'cat-001', name: 'Hardware & IoT', sort_order: 1, status: 'ACTIVE', created_at: new Date().toISOString() },
  { id: 'cat-002', name: 'Cloud Solutions', sort_order: 2, status: 'ACTIVE', created_at: new Date().toISOString() },
  { id: 'cat-003', name: 'Enterprise Software', sort_order: 3, status: 'ACTIVE', created_at: new Date().toISOString() },
  { id: 'cat-004', name: 'Supply Chain & Logistics', sort_order: 4, status: 'ACTIVE', created_at: new Date().toISOString() }
];

let dbPool = null;
let usePostgres = false;

if (DATABASE_URL) {
  try {
    dbPool = new Pool({ connectionString: DATABASE_URL });
    dbPool.query('SELECT 1 FROM category_schema.categories LIMIT 1')
      .then(() => {
        usePostgres = true;
        console.log('[CA Service] Successfully connected to PostgreSQL (category_schema)');
      })
      .catch((err) => {
        console.warn('[CA Service] Postgres not ready or schema not found, using isolated resilient store:', err.message);
      });
  } catch (err) {
    console.warn('[CA Service] Pool initialization failed, using isolated store:', err.message);
  }
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    service: 'CA (Category Service)',
    status: 'ONLINE',
    port: PORT,
    database: usePostgres ? 'PostgreSQL (category_schema)' : 'Resilient In-Memory Store',
    timestamp: new Date().toISOString()
  });
});

// 1. Read All Categories
app.get('/api/categories', async (req, res) => {
  try {
    if (usePostgres && dbPool) {
      const result = await dbPool.query(
        'SELECT id, name, sort_order, status, created_at, updated_at FROM category_schema.categories ORDER BY sort_order ASC, name ASC'
      );
      return res.json(result.rows);
    }
    // Return sorted local categories
    const sorted = [...localCategories].sort((a, b) => a.sort_order - b.sort_order);
    return res.json(sorted);
  } catch (error) {
    console.error('[CA Service] GET /api/categories error:', error);
    res.status(500).json({ error: 'Failed to retrieve categories', details: error.message });
  }
});

// 2. Read Single Category
app.get('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (usePostgres && dbPool) {
      const result = await dbPool.query('SELECT * FROM category_schema.categories WHERE id = $1', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found' });
      return res.json(result.rows[0]);
    }
    const category = localCategories.find(c => c.id === id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    return res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve category', details: error.message });
  }
});

// 3. Create Category
app.post('/api/categories', async (req, res) => {
  const { name, sort_order = 0, status = 'ACTIVE' } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const id = `cat-${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  try {
    if (usePostgres && dbPool) {
      const result = await dbPool.query(
        'INSERT INTO category_schema.categories (id, name, sort_order, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [id, name.trim(), parseInt(sort_order, 10) || 0, status, now, now]
      );
      return res.status(201).json(result.rows[0]);
    }

    const newCategory = { id, name: name.trim(), sort_order: parseInt(sort_order, 10) || 0, status, created_at: now, updated_at: now };
    localCategories.push(newCategory);
    return res.status(201).json(newCategory);
  } catch (error) {
    console.error('[CA Service] POST /api/categories error:', error);
    res.status(500).json({ error: 'Failed to create category', details: error.message });
  }
});

// 4. Update Category
app.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name, sort_order, status } = req.body;
  const now = new Date().toISOString();

  try {
    if (usePostgres && dbPool) {
      const result = await dbPool.query(
        `UPDATE category_schema.categories 
         SET name = COALESCE($1, name), 
             sort_order = COALESCE($2, sort_order), 
             status = COALESCE($3, status),
             updated_at = $4
         WHERE id = $5 RETURNING *`,
        [name ? name.trim() : null, sort_order !== undefined ? parseInt(sort_order, 10) : null, status, now, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found' });
      return res.json(result.rows[0]);
    }

    const index = localCategories.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Category not found' });

    localCategories[index] = {
      ...localCategories[index],
      name: name ? name.trim() : localCategories[index].name,
      sort_order: sort_order !== undefined ? parseInt(sort_order, 10) : localCategories[index].sort_order,
      status: status || localCategories[index].status,
      updated_at: now
    };
    return res.json(localCategories[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category', details: error.message });
  }
});

// 5. Delete Category
app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (usePostgres && dbPool) {
      const result = await dbPool.query('DELETE FROM category_schema.categories WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found' });
      return res.json({ success: true, message: 'Category deleted', deleted: result.rows[0] });
    }

    const index = localCategories.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Category not found' });

    const deleted = localCategories.splice(index, 1)[0];
    return res.json({ success: true, message: 'Category deleted', deleted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[CA Service] Running on port ${PORT}`);
});
