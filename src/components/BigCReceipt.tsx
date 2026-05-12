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

  const thermalStyles: React.CSSProperties = {
    fontFamily: '"Courier New", Courier, monospace',
    color: '#2b2b2b',
    lineHeight: '0.95',
    letterSpacing: '-0.4px',
    filter: 'blur(0.2px) contrast(1.1) brightness(1.05)',
    imageRendering: 'pixelated' as any,
  };


  const boldStrike: React.CSSProperties = {
    fontWeight: 'bold',
    textShadow: '0.4px 0 0 #2b2b2b',
    letterSpacing: '-0.2px'
  };

  return (
    <div className="receipt bigc-receipt" style={{
      ...thermalStyles,
      width: '76mm',
      padding: '4mm',
      background: 'white'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3mm' }}>
        <img src="/logo-color-car.png" alt="GO Logo" style={{ width: '60mm', display: 'block', margin: '0 auto -8mm auto', imageRendering: 'pixelated' }} />
        <div style={{
          background: '#2b2b2b',
          color: 'white',
          padding: '1mm 2mm',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '1.5mm',
          marginBottom: '2mm',
          fontWeight: '900'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '20pt', lineHeight: '0.8', fontWeight: '900', letterSpacing: '-1.5px' }}>{data.sloganLine1 || 'GIÁ'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
            <span style={{ fontSize: '6pt', lineHeight: '1', fontWeight: 'bold' }}>{data.sloganLine2 || 'LUÔN LUÔN'}</span>
            <span style={{ fontSize: '12pt', lineHeight: '1', fontWeight: '900', marginTop: '0.2mm' }}>{data.sloganLine3 || 'RẺ HƠN'}</span>
          </div>
        </div>
        <div style={{ ...boldStrike, fontSize: '10pt', textTransform: 'uppercase', marginBottom: '0.5mm' }}>{data.storeName}</div>
        <div style={{ fontSize: '8pt', whiteSpace: 'pre-line', marginBottom: '0.3mm' }}>{data.address}</div>
        <div style={{ fontSize: '8pt', marginBottom: '0.3mm' }}>Mã số thuế: {data.taxCode}</div>
        <div style={{ fontSize: '8pt', marginBottom: '0.3mm' }}>Số ĐT: {data.phone}</div>
        <div style={{ fontSize: '8pt', marginBottom: '1mm' }}>Hotline: {data.hotline}</div>
        <div style={{ ...boldStrike, fontSize: '11pt', marginTop: '1mm' }}>PHIẾU TÍNH TIỀN</div>
      </div>

      {/* Table Headers */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt', paddingBottom: '0.2mm' }}>
        <span>Description</span>
        <span>VAT</span>
      </div>
      <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', fontSize: '9pt', letterSpacing: '1px' }}>
        -------------------------------------------------------------
      </div>

      {/* Items */}
      <div style={{ margin: '1mm 0' }}>
        {data.items.map((item, idx) => (
          <div key={idx} style={{ marginBottom: '1.5mm', fontSize: '9pt' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '500' }}>{item.name.toUpperCase()}</span>
              <span style={{ width: '10mm', textAlign: 'right' }}>{item.vat}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '12mm 15mm 5mm 20mm 1fr' }}>
              <span style={{ textAlign: 'center' }}>{item.qty}</span>
              <span style={{ textAlign: 'center' }}>{item.unit || 'Cái'}</span>
              <span style={{ textAlign: 'center' }}>x</span>
              <span style={{ textAlign: 'right' }}>{Number(item.price).toLocaleString('en-US')}</span>
              <span style={{ textAlign: 'right' }}>{Number(item.qty * item.price).toLocaleString('en-US')}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', fontSize: '9pt', letterSpacing: '1px' }}>
        -------------------------------------------------------------
      </div>

      {/* Summary - Using local authentic image for the label part */}
      <div style={{
        marginTop: '4mm',
        marginBottom: '8mm',
        height: '10mm',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#000',
      }}>
        {/* Label part (TỔNG CỘNG VND) from /public/summary_label.png */}
        <div style={{
          width: '40mm',
          height: '100%',
          backgroundImage: `url('/summary_label.png')`,
          backgroundSize: 'auto 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: '0px center',
          mixBlendMode: 'multiply',
          filter: 'contrast(1.6) brightness(1.1)',
        }} />

        {/* Dynamic Amount part - Clear commas, tight thermal look */}
        <div style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: '13pt',
          fontWeight: 'normal',
          transform: 'scale(0.6, 3.0)',
          transformOrigin: 'right center',
          flex: 1,
          textAlign: 'right',
          letterSpacing: '1.2px',
          whiteSpace: 'nowrap',
          color: '#000',
          WebkitFontSmoothing: 'none',
          MozOsxFontSmoothing: 'grayscale',
          textShadow: '0.1px 0.1px 0px rgba(0,0,0,0.2)',
          filter: 'contrast(500%)',
        }}>
          {subTotal.toLocaleString('en-US')}
        </div>
      </div>

      <div style={{ fontSize: '9pt', marginBottom: '1.5mm', display: 'flex', marginTop: '-6mm' }}>
        <span style={{ width: '22mm' }}>Số lượng:</span>
        <span>{totalQty}</span>
      </div>

      <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', fontSize: '9pt', letterSpacing: '1px' }}>
        -------------------------------------------------------------
      </div>

      {/* Breakdown */}
      <div style={{ fontSize: '9pt', display: 'grid', gridTemplateColumns: '1fr 15mm 22mm', rowGap: '0.3mm' }}>
        <span style={{ textAlign: 'left' }}>Other Offline</span>
        <span style={{ textAlign: 'center' }}>VND</span>
        <span style={{ textAlign: 'right' }}>{subTotal.toLocaleString('en-US')}</span>

        <span style={{ textAlign: 'left' }}>{data.taxLabel || 'G.trị chưa thuế:'}</span>
        <span></span>
        <span></span>

        <div style={{ display: 'flex' }}>
          <span style={{ width: '4mm' }}>{data.items[0]?.vat || 8}</span>
          <span>{(data.items[0]?.vat || 8).toFixed(2)} %của</span>
        </div>
        <span style={{ textAlign: 'center' }}>{preTaxTotal.toLocaleString('en-US')}</span>
        <span style={{ textAlign: 'right' }}>{totalVAT.toLocaleString('en-US')}</span>
      </div>

      <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', fontSize: '9pt', letterSpacing: '1px' }}>
        -------------------------------------------------------------
      </div>

      {/* Metadata */}
      <div style={{
        fontSize: '8pt',
        display: 'grid',
        gridTemplateColumns: '16mm 15mm 6mm 12mm 1fr',
        columnGap: '0.5mm',
        marginBottom: '2mm',
        width: '100%'
      }}>
        <span>Ngày</span>
        <span style={{ textAlign: 'center' }}>Giờ</span>
        <span>POS</span>
        <span>Cashier</span>
        <span style={{ textAlign: 'right' }}>Ticket</span>

        <span>{data.dateTime.split('T')[0].split('-').reverse().join('/')}</span>
        <span style={{ textAlign: 'center' }}>{data.dateTime.split('T')[1]?.substring(0, 8) || '09:28:00'}</span>
        <span>{data.counterId.padStart(3, '0')}</span>
        <span>{data.staffName.split('-')[0] || '103112'}</span>
        <span style={{ textAlign: 'right' }}>{
          data.invoiceNo && data.invoiceNo.length === 36
            ? `0${data.invoiceNo.substring(12, 14)}${data.invoiceNo.substring(16, 22)}`
            : data.invoiceNo.slice(-9)
        }</span>
      </div>

      {/* QR Codes */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1mm', marginTop: '1mm' }}>
        <canvas ref={qrTopRef} style={{ width: '32mm', height: '32mm', imageRendering: 'pixelated' }}></canvas>
        <div style={{ fontSize: '8pt', textAlign: 'center', maxWidth: '65mm', lineHeight: '1.1' }}>
          {data.qrText || 'Để xuất hóa đơn điện tử vui lòng quét QR code phía trên'}
        </div>
        <canvas ref={qrBottomRef} style={{ width: '32mm', height: '32mm', imageRendering: 'pixelated' }}></canvas>
      </div>

      {/* Footer Text */}
      <div style={{ textAlign: 'center', fontSize: '8.5pt', marginTop: '1mm' }}>
        <span style={boldStrike}>{data.footerLine1 || 'Cảm ơn Quý Khách !'}</span><br />
        <span style={boldStrike}>{data.footerLine2 || 'Hẹn gặp lại!'}</span><br />
        <div style={{ fontSize: '7.5pt', marginTop: '0.5mm', lineHeight: '1.1', fontStyle: 'italic' }}>
          {data.footerNote || 'Phiếu tính tiền chỉ có giá trị xuất hóa đơn trong vòng 120 phút và trước 22h trong ngày mua hàng'}
        </div>
      </div>

      {/* Barcode */}
      <div style={{ marginTop: '2mm', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img ref={barcodeRef} style={{ width: '100%', maxWidth: '64mm', display: 'block', imageRendering: 'pixelated' }} alt="barcode" />
        <div style={{ fontSize: '7.5pt', marginTop: '0.2mm', letterSpacing: '0.1mm' }}>{data.invoiceNo}</div>
      </div>
    </div >
  );
};

export default BigCReceipt;
