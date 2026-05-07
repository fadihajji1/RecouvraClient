export interface Payment {
  _id: string;
  invoice: {
    _id: string;
    invoiceNumber: string;
    totalAmount: number;
    status: string;
  };
  amount: number;
  paymentDate: string;
  paymentMethod: 'bank_transfer' | 'check' | 'cash' | 'credit_card' | 'other';
  reference?: string;
  notes?: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRequest {
  invoice: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  notes?: string;
}

export interface PaymentListResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  payments: Payment[];
}
