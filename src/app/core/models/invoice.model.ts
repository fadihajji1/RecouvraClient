export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  client?: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    company?: string;
  };
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Cancelled';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceRequest {
  invoiceNumber: string;
  client: string;
  items: Omit<InvoiceItem, 'total'>[];
  taxRate?: number;
  status?: string;
  dueDate: string;
}

export interface InvoiceListResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  invoices: Invoice[];
  summary: { totalRevenue: number; count: number };
}
