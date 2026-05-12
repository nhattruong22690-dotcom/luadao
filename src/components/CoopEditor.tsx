"use client";

import React, { useEffect, useState } from 'react';
import type { BillData, BillItem } from '@/lib/types';
import { defaultProductCatalog, type ProductTemplate } from '@/lib/products';
import { Plus, Trash2, Printer, RefreshCw, Database, FileText, Upload, Download } from 'lucide-react';
import CatalogModal from './CatalogModal';
import { parseExcelData, exportToExcel } from '@/lib/excel';

interface EditorProps {
  data: BillData;
  setData: React.Dispatch<React.SetStateAction<BillData>>;
  onPrint: () => void;
  onExportPDF: () => void;
  storeType?: 'COOP' | 'BIGC';
}

const CoopEditor: React.FC<EditorProps> = ({ data, setData, onPrint, onExportPDF, storeType = 'COOP' }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [targetSpecialAmount, setTargetSpecialAmount] = useState<number>(500000);
  const [minLines, setMinLines] = useState<number>(1);
  const [maxLines, setMaxLines] = useState<number>(5);
  const [showConfig, setShowConfig] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [catalog, setCatalog] = useState<ProductTemplate[]>(defaultProductCatalog);

  // Cập nhật maxLines khi danh mục sản phẩm thay đổi để tránh vượt quá số lượng trong kho
  useEffect(() => {
    if (catalog.length > 0 && maxLines > catalog.length) {
      setMaxLines(catalog.length);
    }
  }, [catalog.length]);

  const formatWithCommas = (num: number) => {
    return num.toLocaleString('en-US');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '');
    const num = parseInt(value) || 0;
    setTargetSpecialAmount(num);
  };

  const generateVerificationCode = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('productCatalog_coop');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Đảm bảo tất cả sản phẩm đều có đơn vị tính
        const upgraded = parsed.map((p: any) => ({
          ...p,
          unit: p.unit || 'Cái'
        }));
        setCatalog(upgraded);
      } catch (e) {
        console.error('Failed to parse catalog', e);
      }
    }
  }, []);

  const handleSaveCatalog = (newCatalog: ProductTemplate[]) => {
    setCatalog(newCatalog);
    localStorage.setItem('productCatalog_coop', JSON.stringify(newCatalog));
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { products, config } = await parseExcelData(file);

      if (products.length > 0) {
        handleSaveCatalog(products);
      }

      if (Object.keys(config).length > 0) {
        setData(prev => ({
          ...prev,
          ...config
        }));
      }

      alert('Đã nạp dữ liệu từ Excel thành công!');
    } catch (err) {
      console.error(err);
      alert('Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng!');
    }

    // Reset input
    e.target.value = '';
  };

  const handleStoreChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target;
    if (name === 'invoiceNo') {
      value = value.replace(/\D/g, '');
    }
    setData(prev => ({ ...prev, [name]: value }));
  };

  const addItem = () => {
    const newItem: BillItem = {
      id: Math.random().toString(36).substring(2, 9),
      code: '000000',
      name: 'Sản phẩm mới',
      qty: 1,
      price: 0,
      vat: 8,
      unit: 'Cái'
    };
    setData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (id: string) => {
    setData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
  };

  const updateItem = (id: string, field: keyof BillItem, value: any) => {
    setData(prev => {
      const newItems = prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Tự động điền thông tin nếu nhập mã hoặc tên khớp với danh mục
          if (field === 'code' || field === 'name') {
            const product = catalog.find(p =>
              (field === 'code' && p.code === value) ||
              (field === 'name' && p.name === value)
            );

            if (product) {
              return {
                ...updatedItem,
                code: product.code,
                name: product.name,
                price: product.price,
                vat: product.vat,
                unit: product.unit || 'Cái',
                originalPrice: product.originalPrice
              };
            }
          }
          return updatedItem;
        }
        return item;
      });
      return { ...prev, items: newItems };
    });
  };

  const generateRandomItems = () => {
    if (isGenerating) return;

    if (targetSpecialAmount <= 0) {
      alert('Vui lòng nhập số tiền nhóm đặc biệt > 0');
      return;
    }

    setIsGenerating(true);

    const specialCatalog = catalog.filter(p => p.isSpecial);
    const normalCatalog = catalog.filter(p => !p.isSpecial);

    let currentSpecialSum = 0;
    const newItems: BillItem[] = [];

    const shuffledSpecial = [...specialCatalog].sort(() => 0.5 - Math.random());

    // Nhặt hàng đặc biệt cho đến khi đạt mức tiền tối thiểu
    for (const prod of shuffledSpecial) {
      if (currentSpecialSum >= targetSpecialAmount) break;

      // Tính số lượng ngẫu nhiên (1-5) để nhanh chóng đạt mục tiêu
      const qty = Math.floor(Math.random() * 5) + 1;
      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        code: prod.code,
        name: prod.name,
        price: prod.price,
        qty: qty,
        vat: prod.vat,
        unit: prod.unit || 'Cái',
        originalPrice: prod.originalPrice
      });
      currentSpecialSum += (prod.price * qty);
    }

    // Nếu sau khi duyệt hết mà vẫn chưa đủ tiền (do kho hàng đặc biệt ít), 
    // ta sẽ tăng số lượng của món cuối cùng lên để bù cho đủ.
    if (newItems.length > 0 && currentSpecialSum < targetSpecialAmount) {
      const lastItem = newItems[newItems.length - 1];
      const needed = targetSpecialAmount - currentSpecialSum;
      const extraQty = Math.ceil(needed / lastItem.price);
      lastItem.qty += extraQty;
      currentSpecialSum += (extraQty * lastItem.price);
    }

    // Tính toán số dòng cần thêm để đạt được khoảng Min-Max
    const targetLines = Math.floor(Math.random() * (maxLines - minLines + 1)) + minLines;
    const currentLines = newItems.length;
    const neededLines = Math.max(0, targetLines - currentLines);

    const shuffledNormal = [...normalCatalog].sort(() => 0.5 - Math.random());

    for (let i = 0; i < neededLines; i++) {
      if (!shuffledNormal[i]) break;
      const prod = shuffledNormal[i];
      const qty = Math.floor(Math.random() * 2) + 1;
      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        code: prod.code,
        name: prod.name,
        price: prod.price,
        qty: qty,
        vat: prod.vat,
        unit: prod.unit || 'Cái',
        originalPrice: prod.originalPrice
      });
    }

    newItems.sort(() => 0.5 - Math.random());

    const staffList = [
      '30544207-YAN NHI',
      '30512345-MINH TUAN',
      '30599821-HONG NGOC',
      '30533421-THANH THUY',
      '30577889-BAO LONG',
      '30545678-THU HA',
      '30511223-KIM LIEN',
      '30588990-TUAN KIET'
    ];
    const randomStaff = staffList[Math.floor(Math.random() * staffList.length)];
    const randomCounter = String(Math.floor(Math.random() * 25) + 1);

    const storeCode = storeType === 'BIGC' ? '66' : '00305';
    const counterStr = storeType === 'BIGC' ? randomCounter.padStart(3, '0') : randomCounter.padStart(3, '0');
    let d, m, y;
    if (data.dateTime && data.dateTime.includes('-')) {
      const parts = data.dateTime.split('-');
      y = parts[0].slice(-2);
      m = parts[1];
      d = parts[2].substring(0, 2);
    } else {
      const now = new Date();
      d = String(now.getDate()).padStart(2, '0');
      m = String(now.getMonth() + 1).padStart(2, '0');
      y = String(now.getFullYear()).slice(-2);
    }
    const dateStr = `${y}${m}${d}`;
    const randomSeq = String(Math.floor(Math.random() * 100000)).padStart(5, '0');

    let newInvoiceNo = "";
    if (storeType === 'BIGC') {
      // Bắt chước: 660000 + Cashier(7) + Counter(3) + Ticket(8)
      const cashierPart = (data.staffName.split('-')[0] || '103112').padStart(7, '0');
      const ticketPart = String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
      newInvoiceNo = `66${cashierPart}${counterStr}${ticketPart}`;
    } else {
      newInvoiceNo = `${storeCode}${counterStr}${dateStr}${randomSeq}`;
    }


    // Tạo ngày giờ ngẫu nhiên (Hôm nay, từ 9h đến 21h)
    const now = new Date();
    const randomHour = Math.floor(Math.random() * 12) + 9;
    const randomMin = Math.floor(Math.random() * 60);
    const randomSec = Math.floor(Math.random() * 60);
    const isoDate = now.toISOString().split('T')[0];
    const newDateTime = `${isoDate}T${String(randomHour).padStart(2, '0')}:${String(randomMin).padStart(2, '0')}:${String(randomSec).padStart(2, '0')}`;

    setData(prev => ({
      ...prev,
      items: newItems,
      staffName: randomStaff,
      counterId: randomCounter,
      invoiceNo: newInvoiceNo,
      dateTime: newDateTime,
      verificationCode: generateVerificationCode()
    }));

    // Kết thúc hiệu ứng sau 1 giây
    setTimeout(() => {
      setIsGenerating(false);
    }, 500);
  };

  if (!mounted) return null;

  return (
    <div className="editor-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Cấu hình Hóa đơn</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <Upload size={16} />
            Nạp Excel
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleExcelImport}
              style={{ display: 'none' }}
            />
          </label>
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => exportToExcel(catalog, data)}>
            <Download size={16} />
            Tải Excel Mẫu
          </button>
          <button className="btn btn-outline" onClick={() => setShowHelp(true)}>
            Hướng dẫn in
          </button>
          <button className="btn btn-primary" onClick={onPrint}>
            <Printer size={18} /> In Hóa Đơn
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <button
          className="btn btn-outline"
          onClick={() => setShowConfig(!showConfig)}
          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
            <FileText size={18} /> Cấu hình Thông tin Siêu thị
          </span>
          <span>{showConfig ? 'Thu gọn ▲' : 'Mở rộng ▼'}</span>
        </button>
      </div>

      {showConfig && (
        <div className="config-container" style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label>Tên siêu thị/Cửa hàng</label>
              <input name="storeName" value={data.storeName} onChange={handleStoreChange} />
            </div>
            <div className="input-group">
              <label>Mã số thuế</label>
              <input name="taxCode" value={data.taxCode} onChange={handleStoreChange} />
            </div>
            <div className="input-group">
              <label>Mã CQT (Cố định)</label>
              <input name="taxAuthorityCode" value={data.taxAuthorityCode || ''} onChange={handleStoreChange} />
            </div>
          </div>

          <div className="input-group">
            <label>Địa chỉ</label>
            <textarea name="address" value={data.address} onChange={handleStoreChange} rows={1} style={{ minHeight: '42px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '1rem' }}>
            <div className="input-group">
              <label>Điện thoại</label>
              <input name="phone" value={data.phone} onChange={handleStoreChange} />
            </div>
            <div className="input-group">
              <label>Hotline</label>
              <input name="hotline" value={data.hotline} onChange={handleStoreChange} />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input name="email" value={data.email} onChange={handleStoreChange} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label>Ngày in hóa đơn</label>
              <input type="datetime-local" name="dateTime" value={data.dateTime} onChange={handleStoreChange} />
            </div>
            <div className="input-group">
              <label>Số Quầy</label>
              <input name="counterId" value={data.counterId} onChange={handleStoreChange} />
            </div>
            <div className="input-group">
              <label>Số HĐ</label>
              <input
                placeholder="Nhập số HĐ"
                value={data.invoiceNo.length > 14 ? data.invoiceNo.substring(14) : ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  const prefix = data.invoiceNo.substring(0, 14);
                  setData(prev => ({ ...prev, invoiceNo: prefix + val }));
                }}
                style={{
                  fontWeight: 'bold',
                  color: 'var(--primary)',
                  border: (data.invoiceNo.length - 14) !== 5 ? '1.5px solid #ef4444' : '1px solid var(--border)',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Mã vạch Barcode (19 chữ số)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                name="invoiceNo"
                value={data.invoiceNo}
                readOnly
                style={{ opacity: 0.6, cursor: 'not-allowed', outline: 'none', flex: 1 }}
              />
              <button
                className="btn btn-outline"
                style={{ whiteSpace: 'nowrap', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => {
                  setIsGenerating(true);
                  setTimeout(() => setIsGenerating(false), 500);

                  const storeCode = storeType === 'BIGC' ? '66' : '00305';
                  const counter = data.counterId.padStart(3, '0').slice(0, 3);

                  let d, m, y;
                  if (data.dateTime && data.dateTime.includes('-')) {
                    const parts = data.dateTime.split('-');
                    y = parts[0].slice(-2);
                    m = parts[1];
                    d = parts[2].substring(0, 2);
                  } else {
                    const dateMatch = data.dateTime.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-]\d{2}(\d{2})/);
                    if (dateMatch) {
                      d = dateMatch[1].padStart(2, '0');
                      m = dateMatch[2].padStart(2, '0');
                      y = dateMatch[3];
                    } else {
                      const now = new Date();
                      d = String(now.getDate()).padStart(2, '0');
                      m = String(now.getMonth() + 1).padStart(2, '0');
                      y = String(now.getFullYear()).slice(-2);
                    }
                  }
                  const dateStr = `${y}${m}${d}`;
                  const randomSeq = String(Math.floor(Math.random() * 100000)).padStart(5, '0');

                  let newInvoiceNo = "";
                  if (storeType === 'BIGC') {
                    const cashierPart = (data.staffName.split('-')[0] || '103112').padStart(7, '0');
                    const ticketPart = String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
                    newInvoiceNo = `66${cashierPart}${counter}${ticketPart}`;
                  } else {
                    newInvoiceNo = `${storeCode}${counter}${dateStr}${randomSeq}`;
                  }

                  setData(prev => ({
                    ...prev,
                    invoiceNo: newInvoiceNo,
                    verificationCode: generateVerificationCode()
                  }));
                }}
                title="Tạo số ngẫu nhiên"
                type="button"
              >
                <RefreshCw size={18} className={isGenerating ? "animate-spin" : ""} />
                Làm mới mã
              </button>
            </div>
          </div>

          <div style={{ height: '1px', background: 'var(--border)', margin: '1.5rem 0' }}></div>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--primary)' }}>Cấu hình nội dung cố định trên Bill</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label>Tiêu đề Bill</label>
              <input name="billTitle" value={data.billTitle || ''} onChange={handleStoreChange} />
            </div>
            <div className="input-group">
              <label>Loại đơn hàng</label>
              <input name="orderType" value={data.orderType || ''} onChange={handleStoreChange} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label>Lời chào (Footer)</label>
              <input name="footerLine1" value={data.footerLine1 || ''} onChange={handleStoreChange} />
            </div>
            <div className="input-group">
              <label>Nhãn mã xác nhận</label>
              <input name="confirmationLabel" value={data.confirmationLabel || ''} onChange={handleStoreChange} />
            </div>
          </div>

          <div className="input-group">
            <label>Thông tin pháp lý / Lưu ý chân trang</label>
            <textarea name="footerNote" value={data.footerNote || ''} onChange={handleStoreChange} rows={4} />
          </div>

          <div className="input-group">
            <label>Ghi chú giao dịch (KTHE, thẻ ATM...)</label>
            <input name="note" value={data.note} onChange={handleStoreChange as any} placeholder="VD: KTHE" />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Danh sách mặt hàng</h3>
        <button className="btn btn-outline" onClick={() => setShowCatalog(true)}>
          <Database size={18} /> Dữ liệu sản phẩm
        </button>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', border: '1px dashed var(--border)' }}>
        <div style={{ flex: 2, display: 'flex', gap: '1rem' }}>
          <div className="input-group" style={{ marginBottom: 0, flex: 2 }}>
            <label>Tiền đặc biệt tối thiểu (VNĐ)</label>
            <input
              type="text"
              value={formatWithCommas(targetSpecialAmount)}
              onChange={handleAmountChange}
              placeholder="VD: 500,000"
            />
          </div>
          <div className="input-group" style={{ marginBottom: 0, flex: 1 }}>
            <label>Số dòng Min</label>
            <input
              type="number"
              value={minLines}
              onChange={(e) => setMinLines(parseInt(e.target.value) || 1)}
              min={1}
            />
          </div>
          <div className="input-group" style={{ marginBottom: 0, flex: 1 }}>
            <label>Số dòng Max</label>
            <input
              type="number"
              value={maxLines}
              onChange={(e) => setMaxLines(parseInt(e.target.value) || 1)}
              min={1}
              max={catalog.length}
            />
          </div>
        </div>
        <button
          className={`btn btn-primary ${isGenerating ? 'loading' : ''}`}
          style={{
            opacity: isGenerating ? 0.7 : 1,
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            width: '200px',
            flexShrink: 0,
            justifyContent: 'center',
            whiteSpace: 'nowrap'
          }}
          onClick={generateRandomItems}
          disabled={isGenerating}
        >
          <RefreshCw size={18} className={isGenerating ? 'animate-spin' : ''} />
          {isGenerating ? 'Đang tạo...' : 'Tạo mới'}
        </button>
      </div>

      <table className="items-table">
        <thead>
          <tr>
            <th>Mã/Tên</th>
            <th style={{ width: '80px' }}>SL</th>
            <th style={{ width: '120px' }}>Giá</th>
            <th style={{ width: '80px' }}>VAT%</th>
            <th style={{ width: '80px' }}>ĐVT</th>
            <th style={{ width: '120px' }}>Giá gốc</th>
            <th style={{ width: '50px' }}></th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item) => (
            <tr key={item.id}>
              <td>
                <input
                  style={{ marginBottom: '4px' }}
                  placeholder="Mã SP"
                  value={item.code}
                  onChange={(e) => updateItem(item.id, 'code', e.target.value)}
                />
                <input
                  placeholder="Tên SP"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={item.qty}
                  onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={item.vat}
                  onChange={(e) => updateItem(item.id, 'vat', e.target.value)}
                />
              </td>
              <td>
                <input
                  placeholder="ĐVT"
                  value={item.unit || ''}
                  onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  placeholder="Giá gốc"
                  value={item.originalPrice || ''}
                  onChange={(e) => updateItem(item.id, 'originalPrice', e.target.value ? Number(e.target.value) : undefined)}
                />
              </td>
              <td>
                <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={() => removeItem(item.id)}>
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn btn-outline" style={{ marginTop: '1rem', width: '100%' }} onClick={addItem}>
        <Plus size={18} /> Thêm mặt hàng
      </button>

      {/* Note field moved into config section above */}

      {showCatalog && (
        <CatalogModal
          catalog={catalog}
          onSave={handleSaveCatalog}
          onClose={() => setShowCatalog(false)}
        />
      )}

      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-[#334155] flex justify-between items-center bg-[#1e293b]">
              <h3 className="text-xl font-bold text-white m-0">Hướng dẫn in khổ 80mm</h3>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-8 text-[#94a3b8] space-y-6">
              <div className="space-y-4">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', flexShrink: 0, alignItems: 'center', justifyContent: 'center', color: '#0f172a', fontWeight: 'bold' }}>1</div>
                  <div>
                    <p style={{ color: 'white', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>Chọn máy in phù hợp</p>
                    <p style={{ fontSize: '0.875rem', margin: 0 }}>Đảm bảo bạn đã chọn đúng máy in nhiệt khổ 80mm (Xprinter, KiotViet, v.v.)</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', flexShrink: 0, alignItems: 'center', justifyContent: 'center', color: '#0f172a', fontWeight: 'bold' }}>2</div>
                  <div>
                    <p style={{ color: 'white', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>Thiết lập Lề (Margins)</p>
                    <p style={{ fontSize: '0.875rem', margin: 0 }}>Trong hộp thoại in, chọn <strong>Margins: None</strong> (hoặc Tùy chỉnh: 0) để hóa đơn không bị lệch.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', flexShrink: 0, alignItems: 'center', justifyContent: 'center', color: '#0f172a', fontWeight: 'bold' }}>3</div>
                  <div>
                    <p style={{ color: 'white', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>Tỷ lệ (Scale)</p>
                    <p style={{ fontSize: '0.875rem', margin: 0 }}>Đặt <strong>Scale: 100%</strong>. Tránh chọn "Fit to page" để kích thước mã vạch được chính xác nhất.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', flexShrink: 0, alignItems: 'center', justifyContent: 'center', color: '#0f172a', fontWeight: 'bold' }}>4</div>
                  <div>
                    <p style={{ color: 'white', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>Đồ họa nền (Background Graphics)</p>
                    <p style={{ fontSize: '0.875rem', margin: 0 }}>Bật tùy chọn <strong>Background Graphics</strong> để hiển thị đúng các đường kẻ và logo.</p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '0.75rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#60a5fa', fontStyle: 'italic', margin: 0 }}>
                  * Mẹo: Sử dụng trình duyệt Chrome hoặc Edge để có kết quả in ổn định nhất.
                </p>
              </div>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-primary"
                onClick={() => setShowHelp(false)}
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoopEditor;
