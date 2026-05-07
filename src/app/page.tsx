'use client';

import Link from 'next/link';
import { ShoppingBag, Store } from 'lucide-react';

export default function StoreSelector() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'var(--background)',
      gap: '2rem',
      padding: '2rem'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--foreground)' }}>Hệ Thống In Hóa Đơn</h1>
        <p style={{ color: 'var(--foreground)', opacity: 0.7 }}>Chọn hệ thống siêu thị để bắt đầu</p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '2rem',
        width: '100%',
        maxWidth: '800px'
      }}>
        <Link href="/coop" style={{ textDecoration: 'none' }}>
          <div className="store-card" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border)',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            height: '100%'
          }}>
            <div style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '1.5rem', 
              background: '#fff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto',
              overflow: 'hidden',
              padding: '1.25rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
            }}>
              <img src="/coop_new.png" alt="Coop" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>
        </Link>

        <Link href="/bigc" style={{ textDecoration: 'none' }}>
          <div className="store-card" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border)',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            height: '100%'
          }}>
            <div style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '1.5rem', 
              background: '#fff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto',
              overflow: 'hidden',
              padding: '1.25rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
            }}>
              <img src="/logo-color-car.png" alt="Big C" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>
        </Link>
      </div>

      <style jsx>{`
        .store-card:hover {
          transform: translateY(-8px);
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}
