export interface RecoveryAction {
  _id: string;
  invoice: {
    _id: string;
    invoiceNumber: string;
    amount?: number;
    status?: string;
  };
  actionType: 'email' | 'phone_call' | 'meeting' | 'reminder' | 'legal_notice' | 'other';
  actionDate: string;
  status: 'planned' | 'completed' | 'cancelled';
  notes?: string;
  nextActionDate?: string;
  performedBy: {
    _id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  result?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecoveryActionRequest {
  invoice: string;
  actionType: string;
  actionDate?: string;
  status?: string;
  notes?: string;
  nextActionDate?: string;
  result?: string;
}

export interface RecoveryActionListResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  actions: RecoveryAction[];
}
