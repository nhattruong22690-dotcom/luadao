"use client";

import { useState, useEffect } from 'react';
import CoopEditor from '@/components/CoopEditor';
import Receipt from '@/components/Receipt';
import type { BillData } from '@/lib/types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const initialData: BillData = {
  storeName: 'Co.opXtra LINH TRUNG',
  taxCode: '0300451094-046',
  address: 'Số 934 QL 1A, P.Linh Trung,\nQ.Thủ Đức, TP.Hồ Chí Minh',
  phone: '028.37243123',
  hotline: '1900555568',
  email: 'chamsockhachhang@saigoncoop.com.vn',
  website: 'https://www.coopxtra.net',
  invoiceNo: '0030501326042466302',
  counterId: '13',
  staffName: '30544207-YAN NHI',
  dateTime: (() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  })(),
  taxAuthorityCode: '00E2325E86E20700B0014022',
  items: [
    {
      id: '1',
      code: '933053121360',
      name: 'Khăn mặt PASED 3L 130T',
      qty: 1,
      price: 33000,
      vat: 8
    }
  ],
  note: 'KTHE',
  verificationCode: '8sQVI0',
  billTitle: 'PHIEU TINH TIEN',
  orderType: 'Don hang sieu thi',
  footerLine1: 'Cam on Quy khach - Hen gap lai',
  confirmationLabel: 'Ma xac nhan:',
  footerNote: `De cap nhat thong tin xuat hoa don, quy khach quet ma QR.
Hoac truy cap website:
www.coopxtra.net

Luu y: Thuc hien cap nhat thong tin xuat hoa don trong vong 120 phut ke tu luc ket thuc mua hang va chi ap dung trong ngay (truoc 22:00).
** Chung toi tu choi chiu trach nhiem trong truong hop KH cap nhat thong tin xuat hoa don khong dung.
** Vui long kiem tra ky va cung cap dia chi theo thong tin moi.
** Quy Khach lien he quay Dich Vu KH khi can duoc ho tro them.
** VUI LONG GIU LAI PHIEU TINH TIEN NAY CAN THAN.`
};

export default function Home() {
  const [data, setData] = useState<BillData>(initialData);
  const [mounted, setMounted] = useState(false);
  const STORAGE_KEY = 'billData_coop';

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const mergedData = { ...initialData, ...parsed };
        
        if (!mergedData.dateTime || !/^\d{4}-\d{2}-\d{2}$/.test(mergedData.dateTime.split('T')[0])) {
          mergedData.dateTime = initialData.dateTime;
        }
        setData(mergedData);
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

    const wrapper = receiptEl.parentElement;
    const root = document.documentElement;
    const oldZoom = wrapper?.style.zoom || '';
    const oldRootFontSize = root.style.fontSize;

    if (wrapper) wrapper.style.zoom = '1';
    root.style.fontSize = '16px';

    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      const canvas = await html2canvas(receiptEl, { 
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
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
      pdf.save(`hoa-don-coop-${data.invoiceNo}.pdf`);
    } catch (error) {
      console.error('Lỗi khi xuất PDF:', error);
      alert('Đã xảy ra lỗi khi xuất PDF.');
    } finally {
      if (wrapper) wrapper.style.zoom = oldZoom;
      root.style.fontSize = oldRootFontSize;
    }
  };

  const [zoom, setZoom] = useState(1.4);

  if (!mounted) return null;

  return (
    <div className="app-container">
      <div className="no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div>
              <h1 className="text-3xl font-bold text-(--primary) m-0">Hệ thống COOP</h1>
              <p className="text-[#94a3b8] mt-1">Giải pháp đào lửa</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <CoopEditor data={data} setData={setData} onPrint={handlePrint} onExportPDF={handleExportPDF} storeType="COOP" />
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
            <span style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 'bold' }}>{Math.round(zoom * 100)}%</span>
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
              accentColor: 'var(--primary)',
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
            <Receipt data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
