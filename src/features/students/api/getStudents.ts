import type { Student } from '../types';

export interface StudentQueryParams {
  search?: string;
  class_name?: string;
  sort?: string;
  page?: number;
  per_page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    last_page: number;
  };
}

export const getStudents = async (params?: StudentQueryParams): Promise<PaginatedResponse<Student>> => {
  const url = new URL('/api/students', window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Failed to fetch students');
  }
  return response.json();
};
