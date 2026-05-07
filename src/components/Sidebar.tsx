'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Store, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: 'Coop', href: '/coop', image: '/coop_new.png', color: '#2563eb', icon: <Store size={24} /> },
    { name: 'Big C', href: '/bigc', image: '/logo-color-car.png', color: '#dc2626', icon: <Store size={24} /> },
  ];

  return (
    <div className="no-print sidebar" style={{
      width: '260px',
      height: '100vh',
      background: 'rgba(15, 23, 42, 0.98)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'sticky',
      left: 0,
      top: 0,
      zIndex: 1000,
      backdropFilter: 'blur(10px)',
      flexShrink: 0
    }}>
      <nav style={{ flex: 1, padding: '1rem', marginTop: '1rem' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 0.85rem',
                borderRadius: '0.75rem',
                marginBottom: '0.25rem',
                color: isActive ? '#fff' : '#94a3b8',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'all 0.2s ease',
                position: 'relative'
              }} className="nav-item">
                <div style={{ 
                  width: '220px',
                  height: '140px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                  borderRadius: '1.25rem',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: isActive ? `2px solid ${item.color}` : '1px solid rgba(255,255,255,0.05)',
                  boxShadow: isActive ? `0 0 20px ${item.color}44` : 'none'
                }}>
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      style={{ 
                        width: '180px', 
                        height: '100px', 
                        objectFit: 'contain',
                        filter: isActive ? 'none' : 'grayscale(1) opacity(0.3)',
                        transition: 'all 0.3s'
                      }} 
                    />
                  ) : (
                    <div style={{ color: isActive ? '#fff' : '#64748b' }}>{item.icon}</div>
                  )}
                </div>
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    right: '5px',
                    width: '6px',
                    height: '40px',
                    borderRadius: '3px',
                    background: item.color,
                    boxShadow: `0 0 15px ${item.color}`
                  }} />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: isCollapsed ? 'center' : 'left' }}>
        {!isCollapsed && (
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            v2.4.0 - Industrial Edition
          </div>
        )}
        {isCollapsed && (
          <div style={{ fontSize: '0.6rem', color: '#64748b' }}>v2.4</div>
        )}
      </div>

      <style jsx>{`
        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          color: #fff !important;
        }
        .nav-item:hover div {
          color: #fff !important;
        }
      `}</style>
    </div>
  );
}
