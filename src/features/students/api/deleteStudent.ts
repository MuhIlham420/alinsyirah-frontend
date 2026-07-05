export const deleteStudent = async (id: number): Promise<void> => {
  const response = await fetch(`/api/students/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete student');
  }
};
