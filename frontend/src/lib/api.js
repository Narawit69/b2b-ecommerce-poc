/**
 * Inter-Service Orchestration API Client for Next.js Frontend
 * Handles decentralized communications between:
 * - PD Service (Product Management, Port 8001)
 * - CA Service (Category Management, Port 8002)
 * - FileStory Service (Media Gateway for MinIO, Port 8003)
 */

const isBrowser = typeof window !== 'undefined';
export const PD_API_URL = process.env.NEXT_PUBLIC_PD_API_URL || (isBrowser ? '' : 'http://localhost:8001');
export const CA_API_URL = process.env.NEXT_PUBLIC_CA_API_URL || (isBrowser ? '' : 'http://localhost:8002');
export const FILESTORY_API_URL = process.env.NEXT_PUBLIC_FILESTORY_API_URL || (isBrowser ? '' : 'http://localhost:8003');

// ----------------------------------------------------------------------
// 1. Read / List Operation (Orchestrating PD and CA)
// ----------------------------------------------------------------------
export async function getProductsWithCategories() {
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`${PD_API_URL}/api/products`),
      fetch(`${CA_API_URL}/api/categories`)
    ]);

    if (!productsRes.ok) throw new Error('Failed to fetch products from PD service');
    if (!categoriesRes.ok) throw new Error('Failed to fetch categories from CA service');

    const products = await productsRes.json();
    const categories = await categoriesRes.json();

    // Create a fast lookup map for categories
    const categoryMap = new Map();
    categories.forEach(cat => categoryMap.set(cat.id, cat.name));

    // Map category names onto product items
    const mergedProducts = products.map(prod => ({
      ...prod,
      category_name: categoryMap.get(prod.category_id) || 'Uncategorized'
    }));

    return { products: mergedProducts, categories };
  } catch (error) {
    console.error('[API Orchestrator] Read/List error:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------
// 2. Create Product Flow (Orchestrated: Next.js -> FileStory -> PD)
// ----------------------------------------------------------------------
export async function createProductOrchestrated(productData, imageFile, onProgress) {
  let uploadedImageUrl = '';
  let uploadedFilename = '';

  // Step A: Upload image to FileStory if provided
  if (imageFile) {
    if (onProgress) onProgress('Uploading image to MinIO via FileStory...');
    const formData = new FormData();
    formData.append('image', imageFile);

    const uploadRes = await fetch(`${FILESTORY_API_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.json().catch(() => ({}));
      throw new Error(`FileStory upload failed: ${err.error || uploadRes.statusText}`);
    }

    const uploadResult = await uploadRes.json();
    uploadedImageUrl = uploadResult.url;
    uploadedFilename = uploadResult.filename;
  }

  // Step B: Save product data with image URL to PD Service
  if (onProgress) onProgress('Saving product metadata to PD Service (PostgreSQL)...');
  const payload = {
    name: productData.name,
    price: parseFloat(productData.price) || 0,
    sku: productData.sku,
    description: productData.description,
    category_id: productData.category_id,
    image_url: uploadedImageUrl || productData.image_url || ''
  };

  const productRes = await fetch(`${PD_API_URL}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!productRes.ok) {
    // If PD saving fails, clean up the uploaded file to avoid orphaned media
    if (uploadedFilename) {
      await fetch(`${FILESTORY_API_URL}/api/files/${uploadedFilename}`, { method: 'DELETE' }).catch(() => {});
    }
    const err = await productRes.json().catch(() => ({}));
    throw new Error(`PD Service failed: ${err.error || productRes.statusText}`);
  }

  return await productRes.json();
}

// ----------------------------------------------------------------------
// 3. Update Product Flow
// ----------------------------------------------------------------------
export async function updateProductOrchestrated(id, productData, newImageFile, oldImageUrl, onProgress) {
  let finalImageUrl = productData.image_url || oldImageUrl || '';

  // Step A: If user uploaded a new image, send to FileStory first
  if (newImageFile) {
    if (onProgress) onProgress('Uploading updated image to MinIO via FileStory...');
    const formData = new FormData();
    formData.append('image', newImageFile);

    const uploadRes = await fetch(`${FILESTORY_API_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });

    if (!uploadRes.ok) throw new Error('Failed to upload new image to FileStory');
    const uploadResult = await uploadRes.json();
    finalImageUrl = uploadResult.url;

    // Clean up old image from MinIO to prevent orphan files
    if (oldImageUrl && oldImageUrl.includes(FILESTORY_API_URL)) {
      fetch(`${FILESTORY_API_URL}/api/files?url=${encodeURIComponent(oldImageUrl)}`, { method: 'DELETE' }).catch(() => {});
    }
  }

  // Step B: Update in PD Service
  if (onProgress) onProgress('Updating product in PD Service...');
  const payload = {
    name: productData.name,
    price: parseFloat(productData.price),
    sku: productData.sku,
    description: productData.description,
    category_id: productData.category_id,
    image_url: finalImageUrl
  };

  const res = await fetch(`${PD_API_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error('Failed to update product in PD Service');
  return await res.json();
}

// ----------------------------------------------------------------------
// 4. Delete Product Flow (PD delete + MinIO media cleanup)
// ----------------------------------------------------------------------
export async function deleteProductOrchestrated(id, imageUrl) {
  // Step A: Delete from PD Service
  const res = await fetch(`${PD_API_URL}/api/products/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete product from PD service');

  // Step B: Delete media in FileStory/MinIO if applicable
  if (imageUrl) {
    try {
      await fetch(`${FILESTORY_API_URL}/api/files?url=${encodeURIComponent(imageUrl)}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('[API Orchestrator] Note: Could not delete image file:', err.message);
    }
  }

  return await res.json();
}

// ----------------------------------------------------------------------
// 5. Category Operations with Data Consistency Guard
// ----------------------------------------------------------------------
export async function getCategories() {
  const res = await fetch(`${CA_API_URL}/api/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return await res.json();
}

export async function createCategory(categoryData) {
  const res = await fetch(`${CA_API_URL}/api/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoryData)
  });
  if (!res.ok) throw new Error('Failed to create category');
  return await res.json();
}

export async function updateCategory(id, categoryData) {
  const res = await fetch(`${CA_API_URL}/api/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoryData)
  });
  if (!res.ok) throw new Error('Failed to update category');
  return await res.json();
}

/**
 * Data Consistency Guard (ตามเอกสารสถาปัตยกรรม):
 * Before deleting a category from CA, verify if any products in PD still reference it.
 */
export async function deleteCategoryGuarded(categoryId) {
  // Check product count in PD Service first
  const countRes = await fetch(`${PD_API_URL}/api/products/count-by-category/${categoryId}`);
  if (countRes.ok) {
    const data = await countRes.json();
    if (data.count > 0) {
      throw new Error(`ไม่สามารถลบหมวดหมู่นี้ได้ เนื่องจากยังมีสินค้า ${data.count} รายการเชื่อมโยงอยู่ กรุณาย้ายหรือลบสินค้าก่อน`);
    }
  }

  // Safe to delete
  const res = await fetch(`${CA_API_URL}/api/categories/${categoryId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete category');
  return await res.json();
}

// ----------------------------------------------------------------------
// 6. Microservices Health Check
// ----------------------------------------------------------------------
export async function checkMicroservicesHealth() {
  const checkService = async (name, url, sub) => {
    try {
      const start = Date.now();
      const endpoint = url ? `${url}/api/health` : `/api/health/${sub}`; const res = await fetch(endpoint, { signal: AbortSignal.timeout(3000) });
      const latency = Date.now() - start;
      if (res.ok) {
        const data = await res.json();
        return { name, status: 'ONLINE', latency, details: data };
      }
      return { name, status: 'OFFLINE', latency, details: null };
    } catch (err) {
      return { name, status: 'OFFLINE', latency: 0, details: null };
    }
  };

  const [pd, ca, fileStory] = await Promise.all([
    checkService('PD', PD_API_URL, 'pd'),
    checkService('CA', CA_API_URL, 'ca'),
    checkService('FileStory', FILESTORY_API_URL, 'filestory')
  ]);

  return { pd, ca, fileStory };
}
