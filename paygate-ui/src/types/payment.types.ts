export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paywallId: string | null;
  paywallTitle?: string;
  customerEmail?: string;
  customerName?: string;
  reference: string;
  paymentMethod?: string;
  channel?: string;
  gatewayResponse?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentResponse {
  data: Payment;
}

export interface PaymentListResponse {
  data: Payment[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface CreatePaymentRequest {
  paywallId: string;
  amount: number;
  currency: string;
  customer_email: string;
  customer_name?: string;
  payment_method?: string;
  channel?: string;
  metadata?: Record<string, any>;
}
