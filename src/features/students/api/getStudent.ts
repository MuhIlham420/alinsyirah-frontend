import type { Student } from '../types';

export const getStudent = async (id: number): Promise<{ data: Student }> => {
  const response = await fetch(`/api/students/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch student');
  }
  return response.json();
};
