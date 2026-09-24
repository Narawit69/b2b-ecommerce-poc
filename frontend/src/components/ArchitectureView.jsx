import React from 'react';

export default function ArchitectureView({ health }) {
  const services = [
    {
      name: 'Product Service (PD)',
      type: 'Backend REST API',
      port: '8001',
      schema: 'product_schema (PostgreSQL)',
      status: health?.pd?.status,
      desc: 'ศูนย์กลางการจัดการข้อมูลสินค้า (ชื่อ, ราคา, รายละเอียด, ID หมวดหมู่, URL รูปภาพ) จัดเก็บ URL ชี้ไปยัง MinIO'
    },
    {
      name: 'Category Service (CA)',
      type: 'Backend REST API',
      port: '8002',
      schema: 'category_schema (PostgreSQL)',
      status: health?.ca?.status,
      desc: 'ศูนย์กลางการจัดการข้อมูลหมวดหมู่ (ชื่อหมวดหมู่, ลำดับ, สถานะ) ให้บริการ Dropdown ตอนสร้างสินค้า'
    },
    {
      name: 'FileStory Service',
      type: 'Media Storage Gateway',
      port: '8003',
      schema: 'b2b-products (MinIO S3)',
      status: health?.fileStory?.status,
      desc: 'รับไฟล์ภาพสินค้าแบบ multipart/form-data อัปโหลดลง MinIO Object Storage และส่ง URL ให้ Next.js พร้อมลบไฟล์ขยะ'
    },
    {
      name: 'Admin Dashboard (Next.js)',
      type: 'Frontend & Orchestrator',
      port: '3000',
      schema: 'SSR & Client Orchestration',
      status: 'ONLINE',
      desc: 'ประสาน Flow (Orchestrator): อัปโหลดรูปก่อน -> รับ URL -> บันทึกสินค้า พร้อมระบบป้องกัน Data Inconsistency'
    }
  ];

  return (
    <div className="animate-fade">
      {/* Title */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
          Microservices Architecture & Topology (PoC)
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          พิสูจน์แนวคิดการแยกส่วนประกอบแบบ Microservices บน Kubernetes (K8S) พร้อมฐานข้อมูลและ Object Storage แยกอิสระ
        </p>
      </div>

      {/* Services Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
      }}>
        {services.map(s => (
          <div key={s.name} className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{s.name}</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>{s.type}</span>
              </div>
              <span className={`badge ${s.status === 'ONLINE' ? 'badge-online' : 'badge-offline'}`}>
                {s.status || 'CHECKING'}
              </span>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '12px', lineHeight: 1.6 }}>
              {s.desc}
            </p>

            <div style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: 'var(--text-muted)'
            }}>
              <span>Port: <strong style={{ color: '#fff' }}>{s.port}</strong></span>
              <span>Target: <strong style={{ color: '#818cf8' }}>{s.schema}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Data Stores Card */}
      <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-md)' }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
          การบริหารจัดการฐานข้อมูล (Data Stores Decoupling)
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa', fontWeight: 700, fontSize: '0.95rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
              </svg>
              PostgreSQL (Relational DB)
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.6 }}>
              ใช้ Database Instance เดียวกันในระยะโปรโตไทป์ แต่<strong>บังคับแยก Schema</strong> อย่างเคร่งครัด:
              <br />• <code>product_schema.products</code> (PD Service)
              <br />• <code>category_schema.categories</code> (CA Service)
              <br />เพื่อป้องกันการ Query ข้ามไปดึงข้อมูลของอีก Service โดยตรง
            </p>
          </div>

          <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.95rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                <line x1="6" y1="6" x2="6.01" y2="6"></line>
                <line x1="6" y1="18" x2="6.01" y2="18"></line>
              </svg>
              MinIO (Object Storage)
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.6 }}>
              เก็บไฟล์ภาพสินค้าแยกต่างหาก (Bucket: <code>b2b-products</code>) ลดภาระ Binary บน Database
              กำหนดเป็น <strong>Public Read Policy</strong> ทำให้ Frontend ดึงภาพมาแสดงผลได้โดยตรงผ่าน HTTP URL อย่างรวดเร็ว
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
