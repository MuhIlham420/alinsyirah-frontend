import type { PaymentAttempt } from '../types';
import type { PaginatedResponse } from '../../students/api/getStudents';

export interface PaymentQueryParams {
  search?: string;
  status?: string;
  payment_method?: string;
  sort?: string;
  page?: number;
  per_page?: number;
}

export const getPayments = async (params?: PaymentQueryParams): Promise<PaginatedResponse<PaymentAttempt>> => {
  const url = new URL('/api/payment-attempts', window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Failed to fetch payments');
  }
  return response.json();
};
