import type { TuitionInvoice } from '../types';

export const getInvoiceById = async (id: number): Promise<{ data: TuitionInvoice }> => {
  const response = await fetch(`/api/tuition-invoices/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch invoice detail');
  }
  return response.json();
};
