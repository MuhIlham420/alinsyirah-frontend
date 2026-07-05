import type { Student } from '../../students/types';

export type InvoiceStatus = 'unpaid' | 'paid' | 'partial';

export interface TuitionInvoice {
  id: number;
  student_id: number;
  student?: Student;
  month: string; // e.g. "2026-07"
  amount: number;
  status: InvoiceStatus;
  due_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceFormData {
  student_id: number;
  month: string;
  amount: number;
  due_date: string;
}
