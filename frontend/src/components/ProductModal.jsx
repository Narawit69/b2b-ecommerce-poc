import React, { useState, useEffect, useRef } from 'react';

export default function ProductModal({ isOpen, onClose, onSave, editingProduct, categories }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    sku: '',
    description: '',
    category_id: '',
    image_url: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepMessage, setStepMessage] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        price: editingProduct.price || '',
        sku: editingProduct.sku || '',
        description: editingProduct.description || '',
        category_id: editingProduct.category_id || (categories[0]?.id || ''),
        image_url: editingProduct.image_url || ''
      });
      setPreviewUrl(editingProduct.image_url || '');
    } else {
      setFormData({
        name: '',
        price: '',
        sku: `EP-${Date.now().toString().slice(-5)}`,
        description: '',
        category_id: categories[0]?.id || '',
        image_url: ''
      });
      setPreviewUrl('');
    }
    setImageFile(null);
    setStepMessage('');
  }, [editingProduct, categories, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('กรุณากรอกชื่อสินค้า');
    if (!formData.category_id) return alert('กรุณาเลือกหมวดหมู่สินค้า');

    setIsSubmitting(true);
    try {
      await onSave({
        formData,
        imageFile,
        oldImageUrl: editingProduct?.image_url,
        isEditing: !!editingProduct,
        id: editingProduct?.id,
        onProgress: (msg) => setStepMessage(msg)
      });
      onClose();
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setStepMessage('');
    }
  };

  return (
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
      <div 
        className="glass-panel animate-fade"
        style={{
          width: '100%',
          maxWidth: '680px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: '#111827',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
              {editingProduct ? `แก้ไขสินค้า: ${editingProduct.name}` : 'เพิ่มสินค้าใหม่ (New Product)'}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Next.js Orchestration: อัปโหลดรูปไป MinIO ผ่าน FileStory แล้วบันทึกไป PD Service
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} style={{ padding: '28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            
            {/* Left Column: Form Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  ชื่อสินค้า (Product Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น Dell Latitude 5430"
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
                    ราคา ($ / ฿) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="1299.99"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
                    SKU Code {editingProduct && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>(ล็อกไม่ให้แก้ไข)</span>}
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    readOnly={!!editingProduct}
                    disabled={!!editingProduct}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    title={editingProduct ? "SKU เป็นรหัสอ้างอิงที่ไม่สามารถแก้ไขได้ตามหลัก Best Practice" : "กำหนดรหัส SKU สำหรับสินค้า"}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: editingProduct ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      color: editingProduct ? 'var(--text-muted)' : '#fff',
                      fontSize: '0.875rem',
                      cursor: editingProduct ? 'not-allowed' : 'text',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>
              </div>

              {/* Category Dropdown from CA Service */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  หมวดหมู่ (ดึงสดจาก CA Service) *
                </label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
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
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.status === 'INACTIVE' ? '(ปิดใช้งาน)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  คำอธิบายสินค้า (Description)
                </label>
                <textarea
                  rows="3"
                  placeholder="รายละเอียดคุณสมบัติสินค้า สเปกการใช้งาน..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    fontSize: '0.875rem',
                    resize: 'none'
                  }}
                />
              </div>
            </div>

            {/* Right Column: MinIO Image Upload Drag & Drop */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                รูปภาพสินค้า (อัปโหลดไป MinIO ผ่าน FileStory)
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
                }}
                style={{
                  flex: 1,
                  minHeight: '200px',
                  border: '2px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                />

                {previewUrl ? (
                  <div style={{ position: 'relative', width: '100%', height: '160px' }}>
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
                    />
                    <div style={{ 
                      marginTop: '8px', 
                      fontSize: '0.75rem', 
                      color: 'var(--accent-cyan)', 
                      textAlign: 'center',
                      fontWeight: 600
                    }}>
                      {imageFile ? `พร้อมอัปโหลด: ${imageFile.name}` : 'รูปภาพปัจจุบันใน MinIO'}
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'rgba(99, 102, 241, 0.1)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px'
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                      คลิกเพื่อเลือกรูป หรือลากไฟล์มาวางที่นี่
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      รองรับ PNG, JPG, WebP (สูงสุด 10MB)
                    </div>
                  </>
                )}
              </div>

              {/* Progress/Step Message */}
              {stepMessage && (
                <div style={{
                  marginTop: '12px',
                  padding: '10px 14px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  color: '#a5b4fc',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }} className="pulse-active"></span>
                  {stepMessage}
                </div>
              )}
            </div>

          </div>

          {/* Modal Footer Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-color)'
          }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              ยกเลิก (Cancel)
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isSubmitting}
              style={{ minWidth: '150px' }}
            >
              {isSubmitting ? (
                <>กำลังประมวลผล...</>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  บันทึกสินค้า (Save Product)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
