import * as XLSX from 'xlsx';
import { ProductTemplate } from './products';
import { BillData } from './types';

export const parseExcelData = async (file: File): Promise<{
  products: ProductTemplate[];
  config: Partial<BillData>;
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        let products: ProductTemplate[] = [];
        let config: Partial<BillData> = {};

        // Parse Products Sheet
        const productSheet = workbook.Sheets['SanPham'] || workbook.Sheets[workbook.SheetNames[0]];
        if (productSheet) {
          const productRows = XLSX.utils.sheet_to_json(productSheet) as any[];
          products = productRows.map(row => ({
            code: String(row['Mã SP'] || row['Code'] || row['Barcode'] || '').trim(),
            name: String(row['Tên SP'] || row['Name'] || '').trim(),
            price: Number(row['Giá'] || row['Price'] || 0),
            vat: Number(row['VAT'] || 8),
            isSpecial: row['Đặc biệt'] === 'Có' || row['Special'] === true || row['isSpecial'] === true,
            unit: String(row['Đơn vị'] || row['Unit'] || row['ĐVT'] || 'Cái').trim(),
            originalPrice: row['Giá gốc'] || row['OriginalPrice'] ? Number(row['Giá gốc'] || row['OriginalPrice']) : undefined
          })).filter(p => p.name && p.code);
        }

        // Parse Config Sheet
        const configSheet = workbook.Sheets['CauHinh'] || workbook.Sheets[workbook.SheetNames[1]];
        if (configSheet) {
          const configRows = XLSX.utils.sheet_to_json(configSheet) as any[];
          const configMap: Record<string, string> = {};
          configRows.forEach(row => {
            const key = String(row['Trường'] || row['Key'] || '').trim();
            const value = String(row['Giá trị'] || row['Value'] || '').trim();
            if (key) configMap[key] = value;
          });

          config = {
            storeName: configMap['Tên cửa hàng'] || configMap['StoreName'],
            taxCode: configMap['MST'] || configMap['TaxCode'],
            address: configMap['Địa chỉ'] || configMap['Address'],
            phone: configMap['Điện thoại'] || configMap['Phone'],
            hotline: configMap['Hotline'],
            email: configMap['Email'],
            website: configMap['Website'],
            note: configMap['Ghi chú'] || configMap['Note'],
            taxAuthorityCode: configMap['Mã CQT'] || configMap['Ma CQT'] || configMap['TaxAuthorityCode'],
            sloganLine1: configMap['Slogan Dòng 1'] || configMap['Slogan1'],
            sloganLine2: configMap['Slogan Dòng 2'] || configMap['Slogan2'],
            sloganLine3: configMap['Slogan Dòng 3'] || configMap['Slogan3'],
            qrText: configMap['Văn bản QR'] || configMap['QRText'],
            footerLine1: configMap['Lời chào 1'] || configMap['Footer1'],
            footerLine2: configMap['Lời chào 2'] || configMap['Footer2'],
            footerNote: configMap['Ghi chú chân trang'] || configMap['FooterNote'],
            taxLabel: configMap['Nhãn thuế'] || configMap['TaxLabel'],
            billTitle: configMap['Tiêu đề hóa đơn'] || configMap['BillTitle'],
            orderType: configMap['Loại đơn hàng'] || configMap['OrderType'],
            confirmationLabel: configMap['Nhãn xác nhận'] || configMap['ConfirmationLabel']
          };
        }

        resolve({ products, config });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};

export const exportToExcel = (products: ProductTemplate[], config: BillData) => {
  const workbook = XLSX.utils.book_new();

  // Prepare Products Sheet
  const productData = products.map(p => ({
    'Mã SP': p.code,
    'Tên SP': p.name,
    'Giá': p.price,
    'VAT': p.vat,
    'Đơn vị': p.unit || 'Cái',
    'Giá gốc': p.originalPrice || '',
    'Đặc biệt': p.isSpecial ? 'Có' : ''
  }));
  const productSheet = XLSX.utils.json_to_sheet(productData);
  XLSX.utils.book_append_sheet(workbook, productSheet, 'SanPham');

  // Prepare Config Sheet
  const configData = [
    { 'Trường': 'Tên cửa hàng', 'Giá trị': config.storeName },
    { 'Trường': 'MST', 'Giá trị': config.taxCode },
    { 'Trường': 'Địa chỉ', 'Giá trị': config.address },
    { 'Trường': 'Điện thoại', 'Giá trị': config.phone },
    { 'Trường': 'Hotline', 'Giá trị': config.hotline },
    { 'Trường': 'Email', 'Giá trị': config.email },
    { 'Trường': 'Website', 'Giá trị': config.website },
    { 'Trường': 'Mã CQT', 'Giá trị': config.taxAuthorityCode },
    { 'Trường': 'Tiêu đề hóa đơn', 'Giá trị': config.billTitle },
    { 'Trường': 'Slogan Dòng 1', 'Giá trị': config.sloganLine1 },
    { 'Trường': 'Slogan Dòng 2', 'Giá trị': config.sloganLine2 },
    { 'Trường': 'Slogan Dòng 3', 'Giá trị': config.sloganLine3 },
    { 'Trường': 'Văn bản QR', 'Giá trị': config.qrText },
    { 'Trường': 'Lời chào 1', 'Giá trị': config.footerLine1 },
    { 'Trường': 'Lời chào 2', 'Giá trị': config.footerLine2 },
    { 'Trường': 'Ghi chú chân trang', 'Giá trị': config.footerNote },
    { 'Trường': 'Nhãn thuế', 'Giá trị': config.taxLabel },
    { 'Trường': 'Loại đơn hàng', 'Giá trị': config.orderType },
    { 'Trường': 'Nhãn xác nhận', 'Giá trị': config.confirmationLabel },
    { 'Trường': 'Ghi chú', 'Giá trị': config.note },
  ];
  const configSheet = XLSX.utils.json_to_sheet(configData);
  XLSX.utils.book_append_sheet(workbook, configSheet, 'CauHinh');

  // Download
  XLSX.writeFile(workbook, 'Mau_Du_Lieu_In_Bill.xlsx');
};
