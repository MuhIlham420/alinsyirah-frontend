import type { TuitionInvoice } from '../../invoices/types';

import { z } from 'zod';

export type PaymentAttemptStatus = 'creating' | 'created' | 'failed' | 'pending' | 'paid' | 'expired' | 'cancelled';

export interface PaymentAttempt {
  id: number;
  provider_order_id: string;
  payment_url?: string | null;
  status: PaymentAttemptStatus;
  amount: number; // dynamically calculated on backend, served as gross amount
  payment_method?: string | null;
  student?: {
    id: number;
    name: string;
  };
  invoices?: TuitionInvoice[];
  snap_token?: string; // For Midtrans
  created_at?: string;
  updated_at?: string;
}

export const annualPrepaymentSchema = z.object({
  student_id: z.number().min(1, 'Siswa harus dipilih'),
  year: z.string().regex(/^\d{4}$/, 'Tahun harus 4 digit (contoh: 2026)'),
  discount_percentage: z.number().min(0, 'Diskon tidak boleh negatif').max(100, 'Maksimal 100%').optional().default(0),
});

export type AnnualPrepaymentFormData = z.infer<typeof annualPrepaymentSchema>;
