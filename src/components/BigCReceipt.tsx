"use client";

import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import type { BillData } from '@/lib/types';

interface BigCReceiptProps {
  data: BillData;
}

const BigCReceipt: React.FC<BigCReceiptProps> = ({ data }) => {
  const barcodeRef = useRef<HTMLImageElement>(null);
  const qrTopRef = useRef<HTMLCanvasElement>(null);
  const qrBottomRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, data.invoiceNo || '660000103000620084398420260424092800', {
          format: 'CODE128',
          width: 1.5,
          height: 20,
          displayValue: false,
          margin: 0
        });
      } catch (e) {
        console.error('Barcode generation error:', e);
      }
    }

    const qrUrl = `https://hddt.go-vietnam.com/invoice?id=${data.invoiceNo}`;

    if (qrTopRef.current) {
      QRCode.toCanvas(qrTopRef.current, qrUrl, {
        width: 100,
        margin: 1
      });
    }

    if (qrBottomRef.current) {
      QRCode.toCanvas(qrBottomRef.current, qrUrl, {
        width: 100,
        margin: 1
      });
    }
  }, [data.invoiceNo]);

  const totalQty = data.items.reduce((sum, item) => sum + Number(item.qty), 0);
  const subTotal = data.items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.price)), 0);
  const totalVAT = Math.round(data.items.reduce((sum, item) => sum + (Number(item.qty) * (Number(item.price) - Number(item.price) / (1 + Number(item.vat) / 100))), 0));
  const preTaxTotal = subTotal - totalVAT;

  return (
    <div className="receipt bigc-receipt" style={{
      width: '76mm',
      padding: '4mm',
      background: 'white',
      color: 'black',
      fontFamily: "Tahoma, Verdana, Segoe UI, sans-serif",
      lineHeight: '1.2'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '4mm' }}>
        <img src="/logo-color-car.png" alt="GO Logo" style={{ width: '60mm', display: 'block', margin: '0 auto -9mm auto' }} />
        <div style={{
          background: 'black',
          color: 'white',
          padding: '1.5mm 2mm',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '2mm',
          marginBottom: '2mm',
          fontFamily: 'Arial, sans-serif',
          fontWeight: '900'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '22pt', lineHeight: '0.8', fontWeight: '900', letterSpacing: '-1px' }}>{data.sloganLine1 || 'GIÁ'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
            <span style={{ fontSize: '7pt', lineHeight: '1', fontWeight: 'bold' }}>{data.sloganLine2 || 'LUÔN LUÔN'}</span>
            <span style={{ fontSize: '13pt', lineHeight: '1', fontWeight: '900', marginTop: '0.5mm' }}>{data.sloganLine3 || 'RẺ HƠN'}</span>
          </div>
        </div>
        <div style={{ fontSize: '10pt', fontWeight: 'bold' }}>{data.storeName.toUpperCase()}</div>
        <div style={{ fontSize: '8pt', whiteSpace: 'pre-line' }}>{data.address}</div>
        <div style={{ fontSize: '8pt' }}>Mã số thuế: {data.taxCode}</div>
        <div style={{ fontSize: '8pt' }}>Số ĐT: {data.phone}</div>
        <div style={{ fontSize: '8pt' }}>Hotline: {data.hotline}</div>
        <div style={{ fontSize: '11pt', fontWeight: '', marginTop: '-0.1mm' }}>PHIẾU TÍNH TIỀN</div>
      </div>

      {/* Table Headers */}
      <div style={{ marginTop: '-4mm', display: 'flex', justifyContent: 'space-between', fontSize: '8.5pt', paddingBottom: '0.5mm' }}>
        <span>Description</span>
        <span>VAT</span>
      </div>
      <div style={{ height: '1px', width: '100%', backgroundImage: 'linear-gradient(to right, black 50%, transparent 50%)', backgroundSize: '8px 1px', backgroundRepeat: 'repeat-x' }}></div>

      {/* Items */}
      <div style={{ margin: '2mm 0' }}>
        {data.items.map((item, idx) => (
          <div key={idx} style={{ marginBottom: '2mm', fontSize: '8.5pt' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{item.name}</span>
              <span>{item.vat}</span>
            </div>
            <div style={{ display: 'flex', paddingLeft: '4mm', marginTop: '0.2mm' }}>
              <span style={{ width: '8mm' }}>{item.qty}</span>
              <span style={{ width: '12mm' }}>{item.unit || 'Cái'}</span>
              <span style={{ width: '4mm', textAlign: 'center' }}>x</span>
              <span style={{ width: '22mm', textAlign: 'left', paddingLeft: '4mm' }}>{Number(item.price).toLocaleString('en-US')}</span>
              <span style={{ flex: 1, textAlign: 'right' }}>{Number(item.qty * item.price).toLocaleString('en-US')}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: '1px', width: '100%', backgroundImage: 'linear-gradient(to right, black 50%, transparent 50%)', backgroundSize: '8px 1px', backgroundRepeat: 'repeat-x', margin: '2mm 0' }}></div>

      {/* Summary */}
      <div style={{
        fontSize: '12pt',
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '1mm',
        transform: 'scaleY(1.2)',
        transformOrigin: 'center'
      }}>
        <span>TỔNG CỘNG</span>
        <div style={{ display: 'flex', gap: '4mm' }}>
          <span>VND</span>
          <span>{subTotal.toLocaleString('en-US')}</span>
        </div>
      </div>

      <div style={{ fontSize: '9pt', marginBottom: '2mm', display: 'flex' }}>
        <span style={{ minWidth: '22mm' }}>Số lượng:</span>
        <span>{totalQty}</span>
      </div>

      <div style={{ height: '1px', width: '100%', backgroundImage: 'linear-gradient(to right, black 50%, transparent 50%)', backgroundSize: '8px 1px', backgroundRepeat: 'repeat-x', margin: '2mm 0' }}></div>

      <div style={{ fontSize: '9pt', display: 'grid', gridTemplateColumns: '1fr 15mm 22mm', rowGap: '0.5mm' }}>
        {/* Line 1: Other Offline */}
        <span style={{ textAlign: 'left' }}>Other Offline</span>
        <span style={{ textAlign: 'center' }}>VND</span>
        <span style={{ textAlign: 'right' }}>{subTotal.toLocaleString('en-US')}</span>

        {/* Line 2: G.tri chua thue */}
        <span style={{ textAlign: 'left' }}>{data.taxLabel || 'G.trị chưa thuế:'}</span>
        <span></span>
        <span></span>

        {/* Line 3: VAT Breakdown */}
        <div style={{ display: 'flex' }}>
          <span style={{ width: '4mm' }}>8</span>
          <span>8.00 %của</span>
        </div>
        <span style={{ textAlign: 'center' }}>{preTaxTotal.toLocaleString('en-US')}</span>
        <span style={{ textAlign: 'right' }}>{totalVAT.toLocaleString('en-US')}</span>
      </div>

      <div style={{ height: '1px', width: '100%', backgroundImage: 'linear-gradient(to right, black 50%, transparent 50%)', backgroundSize: '8px 1px', backgroundRepeat: 'repeat-x', margin: '2mm 0' }}></div>

      <div style={{
        fontSize: '7.5pt',
        display: 'grid',
        gridTemplateColumns: '14mm 14mm 7mm 12mm 1fr',
        columnGap: '1mm',
        marginBottom: '3mm',
        width: '100%'
      }}>
        {/* Labels */}
        <span>Ngày</span>
        <span>{'\u00A0\u00A0'}Giờ</span>
        <span>POS</span>
        <span>Cashier</span>
        <span style={{ textAlign: 'right' }}>Ticket</span>

        {/* Values */}
        <span>{data.dateTime.split('T')[0].split('-').reverse().join('/')}</span>
        <span><span style={{ display: 'inline-block', width: '1mm' }}></span>{data.dateTime.split('T')[1]?.substring(0, 8) || '09:28:00'}</span>
        <span>{data.counterId.padStart(3, '0')}</span>
        <span>{data.staffName.split('-')[0] || '103112'}</span>
        <span style={{ textAlign: 'right' }}>{
          data.invoiceNo && data.invoiceNo.length === 36
            ? `0${data.invoiceNo.substring(12, 14)}${data.invoiceNo.substring(16, 22)}`
            : data.invoiceNo.slice(-9)
        }</span>
      </div>

      {/* QR Codes */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2mm', marginTop: '0mm' }}>
        <canvas ref={qrTopRef} style={{ width: '35mm', height: '35mm' }}></canvas>
        <div style={{ fontSize: '8.5pt', textAlign: 'center', maxWidth: '60mm' }}>
          {data.qrText || 'Để xuất hóa đơn điện tử vui lòng quét QR code phía trên'}
        </div>
        <canvas ref={qrBottomRef} style={{ width: '35mm', height: '35mm' }}></canvas>
      </div>

      {/* Footer Text */}
      <div style={{ textAlign: 'center', fontSize: '9pt', marginTop: '0mm' }}>
        {data.footerLine1 || 'Cảm ơn Quý Khách !'}<br />
        {data.footerLine2 || 'Hẹn gặp lại!'}<br />
        <div style={{ fontSize: '8pt', marginTop: '0mm' }}>
          {data.footerNote || 'Phiếu tính tiền chỉ có giá trị xuất hóa đơn trong vòng 120 phút và trước 22h trong ngày mua hàng'}
        </div>
      </div>

      {/* Barcode */}
      <div style={{ marginTop: '0mm', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img ref={barcodeRef} style={{ width: '100%', maxWidth: '68mm', display: 'block' }} alt="barcode" />
        <div style={{ fontSize: '8pt', marginTop: '0mm', letterSpacing: '0.2mm' }}>{data.invoiceNo}</div>
      </div>
    </div >
  );
};

export default BigCReceipt;
