import type { Student, StudentFormData } from '../types';

export const addStudent = async (data: StudentFormData): Promise<{ data: Student }> => {
  const response = await fetch('/api/students', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to add student');
  }

  return response.json();
};
