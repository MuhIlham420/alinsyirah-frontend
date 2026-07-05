import type { TuitionInvoice } from '../../invoices/types';

export type PaymentStatus = 'pending' | 'success' | 'failed';

export interface PaymentAttempt {
  id: number;
  invoice_id?: number;
  invoice?: TuitionInvoice;
  amount: number;
  payment_method?: string;
  status: PaymentStatus;
  snap_token?: string; // For Midtrans
  created_at?: string;
  updated_at?: string;
}
