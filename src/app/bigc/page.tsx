"use client";

import { useState, useEffect } from 'react';
import BigCEditor from '@/components/BigCEditor';
import BigCReceipt from '@/components/BigCReceipt';
import type { BillData } from '@/lib/types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const initialData: BillData = {
  storeName: 'GO! MIỀN ĐÔNG',
  taxCode: '0301472278',
  address: '268 Tô Hiến Thành, P.Hòa Hưng, TP.HCM',
  phone: '028 38 632 990',
  hotline: '1900 1880',
  email: 'dvkh@go-vietnam.com',
  website: 'https://go-vietnam.com',
  invoiceNo: '6600001030006200843984',
  counterId: '062',
  staffName: '103112-NV BAN HANG',
  dateTime: new Date().toISOString(),
  taxAuthorityCode: 'N/A',
  items: [],
  note: '',
  verificationCode: 'N/A',
  sloganLine1: 'GIÁ',
  sloganLine2: 'LUÔN LUÔN',
  sloganLine3: 'RẺ HƠN',
  qrText: 'Để xuất hóa đơn điện tử vui lòng quét QR code phía trên',
  footerLine1: 'Cảm ơn Quý Khách !',
  footerLine2: 'Hẹn gặp lại!',
  footerNote: 'Phiếu tính tiền chỉ có giá trị xuất hóa đơn trong vòng 120 phút và trước 22h trong ngày mua hàng',
  taxLabel: 'G.trị chưa thuế:'
};

export default function BigCPage() {
  const [data, setData] = useState<BillData>(initialData);
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(1.4);
  const STORAGE_KEY = 'billData_bigc';

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData({ ...initialData, ...parsed });
      } catch (e) {
        console.error('Failed to parse saved data', e);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, mounted]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    const receiptEl = document.querySelector('.receipt') as HTMLElement;
    if (!receiptEl) return;

    try {
      const canvas = await html2canvas(receiptEl, { 
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdfWidth = 80;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`hoa-don-bigc-${data.invoiceNo}.pdf`);
    } catch (error) {
      console.error('Lỗi khi xuất PDF:', error);
      alert('Đã xảy ra lỗi khi xuất PDF.');
    }
  };

  if (!mounted) return null;

  return (
    <div className="app-container">
      <div className="no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div>
              <h1 className="text-3xl font-bold text-[#dc2626] m-0">Hệ thống BIG C</h1>
              <p className="text-[#94a3b8] mt-1">Giải pháp đào lửa</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <BigCEditor data={data} setData={setData} onPrint={handlePrint} onExportPDF={handleExportPDF} storeType="BIGC" />
        </div>
      </div>

      <div className="preview-section">
        <div className="no-print" style={{ 
          width: '100%', 
          maxWidth: '500px',
          padding: '1rem', 
          background: 'var(--bg-card)', 
          borderRadius: '1rem', 
          border: '1px solid var(--border)',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          margin: '0 auto 1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: '500' }}>Phóng to / Thu nhỏ xem thử</span>
            <span style={{ fontSize: '0.875rem', color: '#dc2626', fontWeight: 'bold' }}>{Math.round(zoom * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="0.5" 
            max="2.5" 
            step="0.1" 
            value={zoom} 
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            style={{ 
              width: '100%',
              accentColor: '#dc2626',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          width: '100%'
        }}>
          <div style={{ 
            zoom: zoom, 
            display: 'inline-block'
          }}>
            <BigCReceipt data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
