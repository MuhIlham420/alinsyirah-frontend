import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/button';

const loginSchema = z.object({
  email: z.string().min(1, 'Email tidak boleh kosong').email('Format email tidak valid'),
  password: z.string().min(1, 'Kata sandi tidak boleh kosong'),
});

// Infer type dari schema
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 2. Inisialisasi React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // 3. Fungsi submit yang hanya dipanggil jika validasi Zod lolos
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate API call to MSW
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        const resData = await response.json();
        console.log('Login success:', resData);
        // Simulate setting token
        localStorage.setItem('token', resData.token);
        navigate('/');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Login gagal.');
      }
    } catch (err) {
      console.error('Login failed', err);
      setError('Terjadi kesalahan yang tidak terduga.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-8 sm:p-12">
      <div className="w-full max-w-[400px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Selamat Datang</h1>
          <p className="text-sm text-gray-500">Masuk ke akun administrasi Anda</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Alamat Email</label>
            <input
              type="email"
              {...register('email')}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'
              }`}
              placeholder="admin@alinsyirah.com"
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Kata Sandi</label>
            <input
              type="password"
              {...register('password')}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'
              }`}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <Button 
            type="submit" 
            className="w-full py-6 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? 'Memproses...' : 'Masuk'}
          </Button>
        </form>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Belum punya akun? <a href="#" className="text-primary font-medium hover:underline">Hubungi Administrator</a>
          </p>
        </div>
      </div>
    </div>
  );
}
