import type { TuitionInvoice } from '../types';
import type { PaginatedResponse } from '../../students/api/getStudents';

export interface InvoiceQueryParams {
  search?: string;
  status?: string;
  fee_type?: string;
  student_id?: number | string;
  sort?: string;
  page?: number;
  per_page?: number;
}

export const getInvoices = async (params?: InvoiceQueryParams): Promise<PaginatedResponse<TuitionInvoice>> => {
  const url = new URL('/api/tuition-invoices', window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Failed to fetch invoices');
  }
  return response.json();
};
