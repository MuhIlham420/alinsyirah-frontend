import type { PaymentAttempt } from '../types';

export const getPaymentById = async (id: number): Promise<{ data: PaymentAttempt }> => {
  const response = await fetch(`/api/payment-attempts/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch payment details');
  }
  return response.json();
};
