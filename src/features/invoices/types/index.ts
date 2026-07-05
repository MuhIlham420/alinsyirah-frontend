import type { Student } from '../../students/types';

export type InvoiceStatus = 'draft' | 'pending_payment' | 'paid' | 'expired' | 'cancelled';
export type FeeType = 'enrollment' | 'spp' | 'other';

export interface TuitionInvoice {
  id: number;
  student_id: number;
  student?: Student;
  period: string; // e.g. "2026-07"
  fee_type: FeeType;
  description?: string;
  amount: number;
  status: InvoiceStatus;
  due_date: string;
  payment_url?: string;
  paid_at?: string;
  generation_source: 'manual' | 'scheduled';
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

import { z } from 'zod';

export const invoiceSchema = z.object({
  student_id: z.number().min(1, 'Siswa harus dipilih'),
  period: z.string().min(1, 'Bulan harus diisi'),
  fee_type: z.enum(['enrollment', 'spp', 'other']),
  description: z.string().optional(),
  amount: z.number().min(1000, 'Nominal tagihan tidak valid'),
  due_date: z.string().min(1, 'Jatuh tempo harus diisi'),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
