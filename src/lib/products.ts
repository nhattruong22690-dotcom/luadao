export interface ProductTemplate {
  code: string;
  name: string;
  price: number;
  vat: number;
  isSpecial: boolean;
  unit?: string;
}

export const defaultProductCatalog: ProductTemplate[] = [
  // Nhóm đặc biệt
  { code: '933053121360', name: 'Khăn mặt PASED 3L 130T', price: 33000, vat: 8, isSpecial: true, unit: 'Cái' },
  { code: '893458801211', name: 'Nước giặt OMO Matic cửa trước 3.6kg', price: 189000, vat: 8, isSpecial: true, unit: 'Túi' },
  { code: '893456401011', name: 'Giấy vệ sinh Bless You 10 cuộn', price: 75000, vat: 8, isSpecial: true, unit: 'Lốc' },
  { code: '893482210101', name: 'Nước rửa chén Sunlight chanh 3.6kg', price: 115000, vat: 8, isSpecial: true, unit: 'Can' },
  { code: '893504950123', name: 'Bột giặt LIX Extra 6kg', price: 145000, vat: 8, isSpecial: true, unit: 'Bao' },
  { code: '893500660000', name: 'Sữa tươi Vinamilk 100% không đường 1L', price: 35000, vat: 8, isSpecial: true, unit: 'Hộp' },
  
  // Nhóm thường (để chêm vào cho tự nhiên)
  { code: '893504950001', name: 'Mì Hảo Hảo tôm chua cay (thùng 30 gói)', price: 115000, vat: 8, isSpecial: false, unit: 'Thùng' },
  { code: '893458801212', name: 'Dầu ăn Tường An 1L', price: 48000, vat: 8, isSpecial: false, unit: 'Chai' },
  { code: '893456401012', name: 'Nước mắm Nam Ngư 750ml', price: 42000, vat: 8, isSpecial: false, unit: 'Chai' },
  { code: '893482210102', name: 'Đường tinh luyện Biên Hòa 1kg', price: 25000, vat: 8, isSpecial: false, unit: 'Gói' },
  { code: '893504950124', name: 'Tương ớt Chinsu 250g', price: 15000, vat: 8, isSpecial: false, unit: 'Chai' },
  { code: '893500660001', name: 'Snack khoai tây Ostar', price: 12000, vat: 8, isSpecial: false, unit: 'Gói' },
  { code: '893500660002', name: 'Nước suối Aquafina 500ml', price: 5000, vat: 8, isSpecial: false, unit: 'Chai' },
  { code: '893500660003', name: 'Trà ô long Tea Plus 1L', price: 18000, vat: 8, isSpecial: false, unit: 'Chai' },
  { code: '893500660004', name: 'Bánh gạo One One', price: 28000, vat: 8, isSpecial: false, unit: 'Gói' },
  { code: '893500660005', name: 'Cà phê G7 3in1 (hộp 18 gói)', price: 52000, vat: 8, isSpecial: false, unit: 'Hộp' },
  { code: '893500660006', name: 'Nước ngọt Coca-Cola 1.5L', price: 20000, vat: 8, isSpecial: false, unit: 'Chai' },
  { code: '893500660007', name: 'Bánh Chocopie 12 cái', price: 55000, vat: 8, isSpecial: false, unit: 'Hộp' }
];
