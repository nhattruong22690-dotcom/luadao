export interface BillItem {
  id: string;
  code: string;
  name: string;
  qty: number;
  price: number;
  vat: number;
  unit?: string;
  originalPrice?: number;
}

export interface BillData {
  storeName: string;
  taxCode: string;
  address: string;
  phone: string;
  hotline: string;
  email: string;
  website: string;
  invoiceNo: string;
  counterId: string;
  staffName: string;
  dateTime: string;
  items: BillItem[];
  note: string;
  verificationCode: string;
  taxAuthorityCode: string;
  sloganLine1?: string;
  sloganLine2?: string;
  sloganLine3?: string;
  qrText?: string;
  footerLine1?: string;
  footerLine2?: string;
  footerNote?: string;
  taxLabel?: string;
  billTitle?: string;
  orderType?: string;
  confirmationLabel?: string;
}
