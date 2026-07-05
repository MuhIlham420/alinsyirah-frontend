import type { Student, StudentFormData } from '../types';

export const updateStudent = async ({ id, data }: { id: number; data: StudentFormData }): Promise<{ data: Student }> => {
  const response = await fetch(`/api/students/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update student');
  }

  return response.json();
};
