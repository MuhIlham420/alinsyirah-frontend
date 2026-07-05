export const updateProfile = async (data: { name: string; email: string }) => {
  const response = await fetch('/api/auth/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Gagal memperbarui profil');
  }
  return response.json();
};
