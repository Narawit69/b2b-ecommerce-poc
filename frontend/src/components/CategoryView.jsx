import React, { useState } from 'react';

export default function CategoryView({ categories, onAddCategory, onEditCategory, onDeleteCategory, products }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', sort_order: 0, status: 'ACTIVE' });
  const [isSaving, setIsSaving] = useState(false);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', sort_order: categories.length + 1, status: 'ACTIVE' });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, sort_order: cat.sort_order, status: cat.status });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('กรุณากรอกชื่อหมวดหมู่');

    setIsSaving(true);
    try {
      if (editingCategory) {
        await onEditCategory(editingCategory.id, formData);
      } else {
        await onAddCategory(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper count products linked to category
  const getProductCount = (catId) => {
    return products.filter(p => p.category_id === catId).length;
  };

  return (
    <div className="animate-fade">
      {/* View Header */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                Category Management (CA Service)
              </h3>
              <span className="badge badge-category">category_schema</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              จัดการหมวดหมู่สินค้าสำหรับการสร้าง Dropdown ในฟอร์มสินค้า พร้อมระบบป้องกัน Data Inconsistency
            </p>
          </div>

          <button className="btn btn-primary" onClick={openCreateModal}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            เพิ่มหมวดหมู่ใหม่
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(0, 0, 0, 0.2)' }}>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', width: '80px' }}>ลำดับ</th>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>ชื่อหมวดหมู่ (Category Name)</th>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', width: '140px' }}>จำนวนสินค้า (PD)</th>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', width: '120px' }}>สถานะ</th>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', width: '140px', textAlign: 'right' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, idx) => {
              const productCount = getProductCount(cat.id);
              return (
                <tr 
                  key={cat.id}
                  style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {cat.sort_order || idx + 1}
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: '#fff' }}>
                    {cat.name}
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {cat.id}</div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: productCount > 0 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      color: productCount > 0 ? '#a5b4fc' : 'var(--text-muted)'
                    }}>
                      {productCount} รายการ
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span className={`badge ${cat.status === 'ACTIVE' ? 'badge-online' : 'badge-offline'}`}>
                      {cat.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button className="btn-icon" title="แก้ไขหมวดหมู่" onClick={() => openEditModal(cat)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button 
                        className="btn-icon" 
                        title={productCount > 0 ? "มีสินค้าผูกอยู่ ไม่สามารถลบได้ (Data Consistency Guard)" : "ลบหมวดหมู่"}
                        style={{ color: productCount > 0 ? '#6b7280' : '#f87171' }}
                        onClick={() => onDeleteCategory(cat.id, cat.name)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Category Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-panel animate-fade" style={{ width: '100%', maxWidth: '480px', borderRadius: 'var(--radius-md)', background: '#111827', padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '20px' }}>
              {editingCategory ? 'แก้ไขหมวดหมู่สินค้า' : 'เพิ่มหมวดหมู่สินค้าใหม่'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  ชื่อหมวดหมู่ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น Cloud Storage & Networking"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    ลำดับการแสดงผล (Sort)
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value, 10) || 0 })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#fff',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    สถานะ
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#1f2937',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#fff',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="ACTIVE">ACTIVE (เปิดใช้งาน)</option>
                    <option value="INACTIVE">INACTIVE (ปิดใช้งาน)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>ยกเลิก</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกหมวดหมู่'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
