import type { TuitionInvoice, InvoiceFormData } from '../types';

export const createInvoice = async (data: InvoiceFormData): Promise<{ data: TuitionInvoice }> => {
  const response = await fetch('/api/tuition-invoices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create invoice');
  }

  return response.json();
};
