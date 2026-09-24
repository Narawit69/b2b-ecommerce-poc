import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProductTable from '../components/ProductTable';
import ProductModal from '../components/ProductModal';
import CategoryView from '../components/CategoryView';
import ArchitectureView from '../components/ArchitectureView';
import Toast from '../components/Toast';
import {
  getProductsWithCategories,
  createProductOrchestrated,
  updateProductOrchestrated,
  deleteProductOrchestrated,
  createCategory,
  updateCategory,
  deleteCategoryGuarded,
  checkMicroservicesHealth
} from '../lib/api';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal & Edit states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Microservices Health State
  const [health, setHealth] = useState({
    pd: { status: 'CHECKING' },
    ca: { status: 'CHECKING' },
    fileStory: { status: 'CHECKING' }
  });

  // Notification Toast State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success', title = '') => {
    setToast({ message, type, title });
  };

  // Refresh Healthcheck
  const refreshHealth = useCallback(async () => {
    try {
      const status = await checkMicroservicesHealth();
      setHealth(status);
    } catch (err) {
      console.warn('Health check error:', err);
    }
  }, []);

  // Fetch initial data (Orchestrating PD and CA)
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProductsWithCategories();
      setProducts(data.products);
      setCategories(data.categories);
    } catch (error) {
      console.error('Failed to load catalog data:', error);
      showToast('ไม่สามารถเชื่อมต่อ PD หรือ CA Services ได้ (ตรวจสอบว่าเปิด Service แล้วหรือไม่)', 'error', 'Connection Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    refreshHealth();
    // Poll health status periodically
    const interval = setInterval(refreshHealth, 15000);
    return () => clearInterval(interval);
  }, [loadData, refreshHealth]);

  // Handle Save Product (Create or Update Orchestrated)
  const handleSaveProduct = async ({ formData, imageFile, oldImageUrl, isEditing, id, onProgress }) => {
    try {
      if (isEditing) {
        await updateProductOrchestrated(id, formData, imageFile, oldImageUrl, onProgress);
        showToast(`อัปเดตสินค้า "${formData.name}" เรียบร้อยแล้ว`, 'success', 'Update Complete');
      } else {
        await createProductOrchestrated(formData, imageFile, onProgress);
        showToast(`เพิ่มสินค้าใหม่ "${formData.name}" เข้าสู่ระบบและอัปโหลดรูปไปยัง MinIO สำเร็จ`, 'success', 'Created & Streamed');
      }
      await loadData();
    } catch (error) {
      showToast(error.message, 'error', 'Orchestration Failed');
      throw error;
    }
  };

  // Handle Delete Product (PD + MinIO File Cleanup)
  const handleDeleteProduct = async (product) => {
    const confirmDelete = window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า "${product.name}"?\n(ระบบจะส่งคำสั่งลบข้อมูลใน PD และลบไฟล์ภาพใน MinIO เพื่อไม่ให้ตกค้างเป็นขยะ)`);
    if (!confirmDelete) return;

    try {
      await deleteProductOrchestrated(product.id, product.image_url);
      showToast(`ลบสินค้า "${product.name}" และทำความสะอาดรูปภาพออกจาก MinIO สำเร็จ`, 'success', 'Deleted');
      await loadData();
    } catch (error) {
      showToast(error.message, 'error', 'Delete Failed');
    }
  };

  // Category Handlers
  const handleAddCategory = async (data) => {
    await createCategory(data);
    showToast(`เพิ่มหมวดหมู่ "${data.name}" เรียบร้อยแล้ว`, 'success');
    await loadData();
  };

  const handleEditCategory = async (id, data) => {
    await updateCategory(id, data);
    showToast(`แก้ไขหมวดหมู่เรียบร้อยแล้ว`, 'success');
    await loadData();
  };

  const handleDeleteCategory = async (id, name) => {
    const confirmDelete = window.confirm(`คุณต้องการลบหมวดหมู่ "${name}" หรือไม่?\nระบบจะทำการตรวจสอบข้อมูลกับ PD Service ก่อนลบ`);
    if (!confirmDelete) return;

    try {
      await deleteCategoryGuarded(id);
      showToast(`ลบหมวดหมู่ "${name}" สำเร็จ`, 'success');
      await loadData();
    } catch (error) {
      showToast(error.message, 'error', 'Data Consistency Guard');
    }
  };

  return (
    <div className="app-container">
      {/* 1. Left Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        counts={{
          products: products.length,
          categories: categories.length
        }}
      />

      {/* 2. Main Content Area */}
      <div className="main-content">
        <Header 
          health={health} 
          onRefreshHealth={refreshHealth} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="page-body">
          {loading && products.length === 0 ? (
            <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(99, 102, 241, 0.2)',
                borderTopColor: 'var(--primary)',
                borderRadius: '50%',
                margin: '0 auto 16px',
                animation: 'spin 0.8s linear infinite'
              }}></div>
              <p>กำลังเชื่อมต่อและรวบรวมข้อมูลจาก Microservices (PD, CA, MinIO)...</p>
            </div>
          ) : (
            <>
              {activeTab === 'products' && (
                <ProductTable 
                  products={products}
                  categories={categories}
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  onAddClick={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  onEditClick={(prod) => {
                    setEditingProduct(prod);
                    setIsProductModalOpen(true);
                  }}
                  onDeleteClick={handleDeleteProduct}
                />
              )}

              {activeTab === 'categories' && (
                <CategoryView 
                  categories={categories}
                  products={products}
                  onAddCategory={handleAddCategory}
                  onEditCategory={handleEditCategory}
                  onDeleteCategory={handleDeleteCategory}
                />
              )}

              {activeTab === 'architecture' && (
                <ArchitectureView health={health} />
              )}
            </>
          )}
        </main>
      </div>

      {/* 3. Product Modal */}
      <ProductModal 
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
        categories={categories}
      />

      {/* 4. Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Global CSS for spinner */}
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
