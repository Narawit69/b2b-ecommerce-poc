import React from 'react';

export default function Header({ health, onRefreshHealth, searchQuery, setSearchQuery }) {
  return (
    <header className="glass-panel" style={{
      height: '72px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      borderBottom: '1px solid var(--border-color)'
    }}>
      {/* Search Bar */}
      <div style={{ position: 'relative', width: '380px' }}>
        <svg 
          style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text"
          placeholder="ค้นหาสินค้าตามชื่อ, SKU, หรือหมวดหมู่..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            height: '42px',
            padding: '0 16px 0 44px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            outline: 'none',
            transition: 'var(--transition)'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
        />
      </div>

      {/* Right Controls: Microservice Status Badges & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Microservices Health Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '6px 12px',
          borderRadius: '9999px',
          border: '1px solid var(--border-color)',
          fontSize: '0.8rem'
        }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginRight: '4px' }}>
            K8S SERVICES:
          </span>

          {/* PD Service Badge */}
          <div 
            title={`Product Service (Port 8001): ${health?.pd?.status || 'CHECKING'}`}
            className={`badge ${health?.pd?.status === 'ONLINE' ? 'badge-online' : 'badge-offline'}`}
          >
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: health?.pd?.status === 'ONLINE' ? '#10b981' : '#ef4444'
            }} className={health?.pd?.status === 'ONLINE' ? 'pulse-active' : ''}></span>
            PD: {health?.pd?.status || '...'}
          </div>

          {/* CA Service Badge */}
          <div 
            title={`Category Service (Port 8002): ${health?.ca?.status || 'CHECKING'}`}
            className={`badge ${health?.ca?.status === 'ONLINE' ? 'badge-online' : 'badge-offline'}`}
          >
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: health?.ca?.status === 'ONLINE' ? '#10b981' : '#ef4444'
            }} className={health?.ca?.status === 'ONLINE' ? 'pulse-active' : ''}></span>
            CA: {health?.ca?.status || '...'}
          </div>

          {/* FileStory Service Badge */}
          <div 
            title={`FileStory Gateway (MinIO / Port 8003): ${health?.fileStory?.status || 'CHECKING'}`}
            className={`badge ${health?.fileStory?.status === 'ONLINE' ? 'badge-online' : 'badge-offline'}`}
          >
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: health?.fileStory?.status === 'ONLINE' ? '#10b981' : '#ef4444'
            }} className={health?.fileStory?.status === 'ONLINE' ? 'pulse-active' : ''}></span>
            FileStory: {health?.fileStory?.status || '...'}
          </div>

          <button 
            onClick={onRefreshHealth}
            title="ตรวจเช็คสถานะการเชื่อมต่อใหม่อีกครั้ง"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              padding: '2px',
              marginLeft: '4px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
          </button>
        </div>

        {/* User Info Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '0.85rem',
            color: 'white',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)'
          }}>
            AD
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Admin PoC</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Back-office Orchestrator</div>
          </div>
        </div>
      </div>
    </header>
  );
}
