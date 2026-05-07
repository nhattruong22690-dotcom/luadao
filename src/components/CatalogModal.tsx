"use client";

import React, { useState } from 'react';
import type { ProductTemplate } from '@/lib/products';
import { X, Plus, Trash2, Save } from 'lucide-react';

interface CatalogModalProps {
  catalog: ProductTemplate[];
  onSave: (newCatalog: ProductTemplate[]) => void;
  onClose: () => void;
}

const CatalogModal: React.FC<CatalogModalProps> = ({ catalog, onSave, onClose }) => {
  const [localCatalog, setLocalCatalog] = useState<ProductTemplate[]>(catalog);

  const handleUpdate = (index: number, field: keyof ProductTemplate, value: any) => {
    const updated = [...localCatalog];
    updated[index] = { ...updated[index], [field]: value };
    setLocalCatalog(updated);
  };

  const handleRemove = (index: number) => {
    const updated = [...localCatalog];
    updated.splice(index, 1);
    setLocalCatalog(updated);
  };

  const handleAdd = () => {
    setLocalCatalog([
      ...localCatalog,
      { code: '', name: 'Sản phẩm mới', price: 0, vat: 8, isSpecial: false, unit: 'Cái' }
    ]);
  };

  const handleSave = () => {
    onSave(localCatalog);
    onClose();
  };

  const inputStyle = {
    width: '100%',
    padding: '0.6rem 0.8rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--border)',
    borderRadius: '0.5rem',
    color: 'var(--text)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        padding: '2rem',
        borderRadius: '1.2rem',
        width: '98%',
        maxWidth: '1400px',
        maxHeight: '95vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Quản lý Kho Dữ Liệu</h2>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>
              {localCatalog.length} sản phẩm
            </span>
          </div>
          <button className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem', margin: '0 -0.5rem' }}>
          <table className="items-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 10 }}>
              <tr>
                <th style={{ width: '180px', padding: '1rem' }}>Mã SP (Barcode)</th>
                <th style={{ textAlign: 'left', padding: '1rem' }}>Tên sản phẩm</th>
                <th style={{ width: '150px', padding: '1rem' }}>Giá (VNĐ)</th>
                <th style={{ width: '100px', padding: '1rem' }}>VAT%</th>
                <th style={{ width: '100px', textAlign: 'center', padding: '1rem' }}>Nhóm ĐB?</th>
                <th style={{ width: '120px', padding: '1rem' }}>ĐVT</th>
                <th style={{ width: '60px', padding: '1rem' }}></th>
              </tr>
            </thead>
            <tbody>
              {localCatalog.map((prod, idx) => (
                <tr key={idx} style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '0.5rem' }}>
                    <input 
                      style={inputStyle}
                      value={prod.code} 
                      onChange={(e) => handleUpdate(idx, 'code', e.target.value)} 
                    />
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <input 
                      style={inputStyle}
                      value={prod.name} 
                      onChange={(e) => handleUpdate(idx, 'name', e.target.value)} 
                    />
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <input 
                      style={inputStyle}
                      type="number" 
                      value={prod.price} 
                      onChange={(e) => handleUpdate(idx, 'price', Number(e.target.value))} 
                    />
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <input 
                      style={inputStyle}
                      type="number" 
                      value={prod.vat} 
                      onChange={(e) => handleUpdate(idx, 'vat', Number(e.target.value))} 
                    />
                  </td>
                  <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                    <input 
                      type="checkbox" 
                      checked={prod.isSpecial} 
                      onChange={(e) => handleUpdate(idx, 'isSpecial', e.target.checked)} 
                      style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                    />
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <input 
                      style={inputStyle}
                      value={prod.unit || ''} 
                      onChange={(e) => handleUpdate(idx, 'unit', e.target.value)} 
                    />
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <button className="btn btn-danger" style={{ padding: '0.6rem', borderRadius: '0.5rem' }} onClick={() => handleRemove(idx)}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-outline" onClick={handleAdd}>
            <Plus size={18} /> Thêm sản phẩm
          </button>
          
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={18} /> Lưu Kho
          </button>
        </div>
      </div>
    </div>
  );
};

export default CatalogModal;
