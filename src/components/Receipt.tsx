"use client";

import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import type { BillData } from '@/lib/types';

interface ReceiptProps {
  data: BillData;
}

const Receipt: React.FC<ReceiptProps> = ({ data }) => {
  const barcodeRef = useRef<HTMLImageElement>(null);
  const qrRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, data.invoiceNo || '000000000000', {
          format: 'CODE128',
          width: 2.2,
          height: 50,
          displayValue: false,
          margin: 0
        });
      } catch (e) {
        console.error('Barcode generation error:', e);
      }
    }

    if (qrRef.current) {
      QRCode.toCanvas(qrRef.current, `https://hddt.saigonco-op.com.vn?id=${data.invoiceNo}`, {
        width: 90,
        margin: 1
      }, (error) => {
        if (error) console.error('QR generation error:', error);
      });
    }
  }, [data.invoiceNo]);

  const totalQty = data.items.reduce((sum, item) => sum + Number(item.qty), 0);
  const subTotal = data.items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.price)), 0);

  const totalVAT = Math.round(data.items.reduce((sum, item) => sum + (Number(item.qty) * (Number(item.price) - Number(item.price) / (1 + Number(item.vat) / 100))), 0));
  const finalTotal = subTotal;

  const formatFullDateTime = (dateStr: string, invoiceNo: string) => {
    // 1. Lấy phần ngày
    let displayDate = dateStr;
    if (dateStr && dateStr.includes('-')) {
      displayDate = dateStr.split('T')[0].split('-').reverse().join('/');
    }

    // 2. Xác định phần giờ
    let displayTime = "";
    if (dateStr && dateStr.includes('T') && dateStr.split('T')[1].length >= 5) {
      // Nếu đã có giờ trong chuỗi gốc (ISO), lấy luôn giờ đó
      displayTime = dateStr.split('T')[1].substring(0, 8);
    } else {
      // Tự động tạo giờ ngẫu nhiên cố định dựa trên invoiceNo làm seed
      // Giới hạn trong khoảng 09:00:00 đến 21:00:00
      const seed = invoiceNo.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const totalSeconds = (seed % (12 * 3600)); // 12 tiếng * 3600 giây
      const hour = Math.floor(totalSeconds / 3600) + 9; // Bắt đầu từ 9h sáng
      const minute = Math.floor((totalSeconds % 3600) / 60);
      const second = totalSeconds % 60;
      displayTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
    }

    return `${displayDate} ${displayTime}`;
  };

  return (
    <div className="receipt" style={{ fontFamily: 'var(--font-coopxtra), monospace', lineHeight: '1.1' }}>
      <div className="receipt-header">
        <div className="receipt-logo" style={{ marginBottom: '1mm' }}>
          <img src="/xtralogo.png" alt="CoopXtra Logo" style={{ width: '40mm', height: 'auto', display: 'block', margin: '0 auto' }} />
        </div>
        <div style={{ fontSize: '9.5pt', fontWeight: 'bold', marginTop: '1mm', marginBottom: '1mm' }}>{data.storeName}</div>
        <div style={{ fontSize: '8pt' }}>Ma so thue: {data.taxCode}</div>
        <div style={{ fontSize: '8pt', whiteSpace: 'pre-line', margin: '0.5mm 0', lineHeight: '1.2' }}>{data.address}</div>
        <div style={{ fontSize: '8pt' }}>DT: {data.phone} Hotline: {data.hotline}</div>
        <div style={{ fontSize: '8pt' }}>Email: {data.email}</div>
        <div style={{ fontSize: '8pt' }}>website: {data.website}</div>
        <div style={{ fontSize: '11pt', fontWeight: 'bold', marginTop: '1mm', marginBottom: '1mm', letterSpacing: '0.5px' }}>{data.billTitle || 'PHIEU TINH TIEN'}</div>
      </div>
      <div style={{ textAlign: 'center', fontSize: '8pt', marginBottom: '1mm' }}>{data.orderType || 'Don hang sieu thi'}</div>

      <div style={{ fontSize: '8pt' }}>
        <div style={{ textAlign: 'center', margin: '0.5mm 0' }}>
          Ma CQT: {data.taxAuthorityCode}
        </div>
        <div className="receipt-row" style={{ marginTop: '1mm' }}>
          <span>Quay: {data.counterId}</span>
          <span>Ngay: {formatFullDateTime(data.dateTime, data.invoiceNo)}</span>
        </div>
        <div className="receipt-row">
          <span>NV: {data.staffName}</span>
          <span>So HD: {data.invoiceNo.substring(14)}</span>
        </div>
      </div>

      <div style={{ width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', fontSize: '15pt', letterSpacing: '-0.5px', margin: '1mm 0' }}>
        ------------------------------------------------------------------------------------------------------
      </div>

      <table className="receipt-table" style={{ fontSize: '8pt', borderSpacing: 0, marginTop: '1mm', width: '100%' }}>
        <tbody>
          {data.items.map((item) => (
            <React.Fragment key={item.id}>
              <tr>
                <td colSpan={4} style={{ padding: '0.5mm 0' }}>{item.code} {item.name}</td>
              </tr>
              <tr style={{ fontSize: '8pt' }}>
                <td style={{ width: '15%' }}>VAT{item.vat}%</td>
                <td style={{ width: '25%', textAlign: 'center' }}>{item.qty} {item.unit || 'Cái'}</td>
                <td style={{ width: '25%', textAlign: 'center' }}>{Number(item.price).toLocaleString()}</td>
                <td style={{ width: '35%', textAlign: 'right' }}>{(item.qty * item.price).toLocaleString()} d</td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>

      <div style={{ width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', fontSize: '15pt', letterSpacing: '-0.5px', margin: '1mm 0' }}>
        ------------------------------------------------------------------------------------------------------
      </div>

      <div style={{ fontSize: '9pt' }}>
        <div className="receipt-row" style={{ margin: '0.5mm 0' }}>
          <span>Tong so luong hang:</span>
          <span>{totalQty}</span>
        </div>
        <div className="receipt-row" style={{ margin: '0.5mm 0' }}>
          <span>Tong tien:</span>
          <span>{subTotal.toLocaleString()} d</span>
        </div>
        <div className="receipt-row" style={{ margin: '0.5mm 0' }}>
          <span>Tong Thuc Thanh Toan:</span>
        </div>
        <div className="receipt-row" style={{ margin: '0.5mm 0' }}>
          <span>TNDV:</span>
          <span>{finalTotal.toLocaleString()} d</span>
        </div>
        <div className="receipt-row" style={{ margin: '0.5mm 0' }}>
          <span>Bao gom thue GTGT 8%:</span>
          <span>{totalVAT.toLocaleString()} d</span>
        </div>
      </div>

      <div style={{ marginLeft: '2ch', marginTop: '1.5mm', marginBottom: '1.5mm' }}>
        <div style={{ width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', fontSize: '4.5pt', letterSpacing: '0.5px', color: 'black' }}>
          ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
        </div>
        <div style={{ fontSize: '8.5pt', whiteSpace: 'nowrap', margin: '0.3mm 0', fontWeight: '' }}>
          Ghi chu: {data.note}
        </div>
        <div style={{ width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', fontSize: '4.5pt', letterSpacing: '0.5px', color: 'black' }}>
          ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: '8pt', margin: '1mm 0', marginBottom: '-2mm', marginTop: '-1mm' }}>
        <div style={{
          margin: '2mm auto',
          width: '55%',
          height: '2px',
          backgroundImage: 'linear-gradient(to right, black 60%, transparent 60%)',
          backgroundSize: '3mm 100%',
          backgroundRepeat: 'repeat-x'
        }}></div>
        {data.footerLine1 || 'Cam on Quy khach - Hen gap lai'}
      </div>

      <div className="receipt-barcode" style={{ margin: '3mm 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img ref={barcodeRef} style={{ width: '90%', height: '50px', imageRendering: 'pixelated' }} alt="barcode" />
        <div style={{
          fontSize: '8pt',
          fontWeight: 'bold',
          letterSpacing: '0.4mm',
          marginTop: '1mm',
          fontFamily: 'var(--font-coopxtra), monospace',
          color: 'black'
        }}>
          {data.invoiceNo}
        </div>
      </div>

      <div style={{ textAlign: 'left', fontSize: '8pt', marginTop: '1mm', marginBottom: '1mm' }}>
        Ma GD: {(() => {
          const timePart = data.dateTime && data.dateTime.includes('T')
            ? data.dateTime.split('T')[1].substring(0, 5)
            : '12:41';
          let staffCode = "";
          if (data.staffName && data.staffName.includes('-')) {
            staffCode = data.staffName.split('-')[0].trim();
          } else {
            staffCode = data.staffName || "00000";
          }
          const seqPart = staffCode.length >= 5
            ? staffCode.slice(-5)
            : staffCode.padStart(5, '0');
          return `${timePart} ${seqPart}`;
        })()}
      </div>

      <div style={{ width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', fontSize: '15pt', letterSpacing: '-0.5px', margin: '1mm 0' }}>
        ------------------------------------------------------------------------------------------------------
      </div>

      <div style={{ display: 'flex', gap: '2mm', alignItems: 'flex-start', margin: '1mm 0' }}>
        <div style={{ width: '25mm', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="receipt-qr" style={{ margin: '0' }}>
            <canvas ref={qrRef} style={{ width: '25mm', height: '25mm' }}></canvas>
          </div>
          <div style={{
            border: '1px solid black',
            padding: '0.5mm',
            marginTop: '1mm',
            fontSize: '7pt',
            textAlign: 'center',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {data.confirmationLabel || 'Ma xac nhan:'}<br />
            <span style={{ fontWeight: 'bold', fontSize: '11pt' }}>{data.verificationCode}</span>
          </div>
        </div>

        <div className="footer-ghi-chu" style={{ flex: 1, fontSize: '7.5pt', textAlign: 'left', lineHeight: '1.2', fontStyle: 'italic' }}>
          <div>De cap nhat thong tin xuat hoa don, quy khach quet ma QR.</div>
          <div>Hoac truy cap website: {data.website.replace('https://', '')}</div>
          <div style={{ margin: '0.5mm 0' }}>
            Luu y: Thuc hien cap nhat thong tin xuat hoa don trong vong <strong style={{ fontSize: '9pt' }}>120 phut</strong> ke tu luc ket thuc mua hang va chi ap dung trong ngay <strong style={{ fontSize: '9pt' }}>(truoc 22:00)</strong>.
          </div>
          <div>** Chung toi tu choi chiu trach nhiem trong truong hop KH cap nhat thong tin xuat hoa don khong dung.</div>
          <div style={{ fontSize: '9pt', fontWeight: 'normal', fontStyle: 'italic', margin: '0.5mm 0' }}>
            ** Vui long kiem tra ky va cung cap dia chi theo thong tin moi.
          </div>
          <div>** Quy Khach lien he quay Dich Vu KH khi can duoc ho tro them.</div>
          <div style={{ fontWeight: 'bold' }}>** VUI LONG GIU LAI PHIEU TINH TIEN NAY CAN THAN.</div>
        </div>
      </div>

      <div style={{ width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', fontSize: '15pt', letterSpacing: '-0.5px', margin: '1mm 0' }}>
        ------------------------------------------------------------------------------------------------------
      </div>
    </div>
  );
};

export default Receipt;
