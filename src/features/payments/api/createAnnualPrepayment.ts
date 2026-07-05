
export const createAnnualPrepayment = async (data: { student_id: number; year: string; discount_amount: number }): Promise<{ message: string; data: any }> => {
  const response = await fetch('/api/annual-prepayments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to process annual prepayment');
  }

  return response.json();
};
