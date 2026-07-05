export const getMe = async () => {
  const response = await fetch('/api/auth/me');
  if (!response.ok) {
    throw new Error('Gagal memuat profil');
  }
  return response.json();
};
