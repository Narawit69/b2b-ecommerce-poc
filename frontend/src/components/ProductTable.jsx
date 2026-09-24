import React, { useState } from 'react';

export default function ProductTable({ 
  products, 
  categories, 
  onAddClick, 
  onEditClick, 
  onDeleteClick, 
  searchQuery, 
  selectedCategory, 
  setSelectedCategory 
}) {
  const [deletingId, setDeletingId] = useState(null);

  // Filter products by search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.category_name && product.category_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = 
      !selectedCategory || 
      selectedCategory === 'ALL' || 
      product.category_id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalValue = products.reduce((acc, p) => acc + (parseFloat(p.price) || 0), 0);

  return (
    <div className="animate-fade">
      {/* 1. Top Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
      }}>
        {/* Total Products */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Products</span>
            <span className="badge badge-category">PD SERVICE</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#fff' }}>
            {products.length} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>Items</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
            PostgreSQL product_schema
          </div>
        </div>

        {/* Active Categories */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Categories</span>
            <span className="badge badge-category">CA SERVICE</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#fff' }}>
            {categories.length} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>Categories</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#818cf8', marginTop: '8px' }}>
            Decoupled REST API
          </div>
        </div>

        {/* Object Storage Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>MinIO Storage</span>
            <span className="badge badge-storage">FILESTORY</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#fff' }}>
            {products.filter(p => p.image_url).length} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>Images stored</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginTop: '8px' }}>
            Public Read S3 Bucket (b2b-products)
          </div>
        </div>
      </div>

      {/* 2. Table Controls & Header */}
      <div className="glass-card" style={{ padding: '20px', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
              Products Management
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Orchestrated from PD & CA Services, Media streamed to MinIO
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                padding: '10px 14px',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ALL" style={{ background: '#1f2937' }}>หมวดหมู่ทั้งหมด ({categories.length})</option>
              {categories.map(c => (
                <option key={c.id} value={c.id} style={{ background: '#1f2937' }}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Add Product Button */}
            <button className="btn btn-primary" onClick={onAddClick}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              เพิ่มสินค้าใหม่ (Add Product)
            </button>
          </div>
        </div>
      </div>

      {/* 3. Products Data Table */}
      <div className="glass-panel" style={{ borderRadius: '0 0 var(--radius-md) var(--radius-md)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(0, 0, 0, 0.2)' }}>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', width: '80px' }}>รูปภาพ</th>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>ชื่อสินค้า (Product Name)</th>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', width: '130px' }}>SKU</th>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', width: '160px' }}>หมวดหมู่ (CA Service)</th>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', width: '130px' }}>ราคา</th>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', width: '120px' }}>MinIO Status</th>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', width: '140px', textAlign: 'right' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ไม่พบข้อมูลสินค้า</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '6px' }}>ลองเปลี่ยนคำค้นหา หรือกดปุ่ม "เพิ่มสินค้าใหม่" เพื่อเริ่มต้น</div>
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => (
                <tr 
                  key={product.id}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Image Thumbnail */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-color)',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<span style="font-size: 0.65rem; color: #9ca3af;">No Img</span>';
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>No Img</span>
                      )}
                    </div>
                  </td>

                  {/* Name & Description */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{product.name}</div>
                    {product.description && (
                      <div style={{ 
                        fontSize: '0.78rem', 
                        color: 'var(--text-muted)', 
                        marginTop: '2px',
                        maxWidth: '320px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {product.description}
                      </div>
                    )}
                  </td>

                  {/* SKU */}
                  <td style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {product.sku || '-'}
                  </td>

                  {/* Category Badge */}
                  <td style={{ padding: '14px 20px' }}>
                    <span className="badge badge-category" style={{ fontSize: '0.7rem' }}>
                      {product.category_name}
                    </span>
                  </td>

                  {/* Price */}
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: '#fff' }}>
                    ${parseFloat(product.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* MinIO Status */}
                  <td style={{ padding: '14px 20px' }}>
                    {product.image_url ? (
                      <span className="badge badge-online" style={{ fontSize: '0.68rem' }}>
                        Active (S3)
                      </span>
                    ) : (
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', fontSize: '0.68rem' }}>
                        No Image
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button 
                        className="btn-icon"
                        title="แก้ไขสินค้า"
                        onClick={() => onEditClick(product)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>

                      <button 
                        className="btn-icon"
                        title="ลบสินค้า (และทำความสะอาดไฟล์ใน MinIO)"
                        style={{ color: '#f87171' }}
                        onClick={() => onDeleteClick(product)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
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
  );
}
