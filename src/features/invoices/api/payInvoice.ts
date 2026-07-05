import type { PaymentAttempt } from '../../payments/types';

export const payInvoice = async (id: number): Promise<{ message: string; data: PaymentAttempt }> => {
  const response = await fetch(`/api/tuition-invoices/${id}/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to process payment');
  }

  return response.json();
};
