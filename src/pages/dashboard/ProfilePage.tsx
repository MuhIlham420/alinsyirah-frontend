import { useState, useEffect } from 'react';
import { User, Mail, Lock, Shield, Camera, Save, LogOut, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMe } from '../../features/auth/api/getMe';
import { updateProfile } from '../../features/auth/api/updateProfile';
import { updatePassword } from '../../features/auth/api/updatePassword';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";

const profileSchema = z.object({
  name: z.string().min(3, 'Nama harus minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Kata sandi saat ini wajib diisi'),
  new_password: z.string().min(6, 'Kata sandi baru minimal 6 karakter'),
  confirm_password: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Konfirmasi kata sandi tidak cocok",
  path: ["confirm_password"],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: userResponse, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
  });

  const currentUser = userResponse?.data;

  // Dialog States
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [pendingProfileData, setPendingProfileData] = useState<ProfileForm | null>(null);
  
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [pendingPasswordData, setPendingPasswordData] = useState<PasswordForm | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
    }
  });

  useEffect(() => {
    if (currentUser) {
      resetProfile({
        name: currentUser.name,
        email: currentUser.email,
      });
    }
  }, [currentUser, resetProfile]);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      showToast('Informasi profil berhasil diperbarui!');
    },
    onError: (error: any) => {
      alert(`Gagal memperbarui profil: ${error.message}`);
    }
  });

  const passwordMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      resetPassword();
      showToast('Kata sandi berhasil diperbarui!');
    },
    onError: (error: any) => {
      alert(`Gagal memperbarui sandi: ${error.message}`);
    }
  });

  const onProfileSaveRequest = (data: ProfileForm) => {
    setPendingProfileData(data);
    setIsProfileDialogOpen(true);
  };

  const confirmProfileSave = () => {
    if (pendingProfileData) {
      profileMutation.mutate(pendingProfileData);
      setIsProfileDialogOpen(false);
    }
  };

  const onPasswordSaveRequest = (data: PasswordForm) => {
    setPendingPasswordData(data);
    setIsPasswordDialogOpen(true);
  };

  const confirmPasswordSave = () => {
    if (pendingPasswordData) {
      passwordMutation.mutate(pendingPasswordData);
      setIsPasswordDialogOpen(false);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-gray-500">Memuat profil...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle size={14} className="text-white" />
            </div>
            <span className="font-medium text-sm">{toastMessage}</span>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Profil Admin</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola informasi pribadi dan keamanan akun Anda.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        {/* Left Column - Profile Card */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative h-full">
            <div className="h-32 bg-gradient-to-br from-primary/80 to-primary/40 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
            </div>
            
            <div className="px-6 pb-6 relative">
              <div className="flex justify-center -mt-12 mb-4">
                <div className="relative">
                  <div className="w-24 h-24 bg-white rounded-full p-1.5 shadow-lg border border-gray-50">
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center text-primary border border-primary/10">
                      <span className="text-3xl font-bold">A</span>
                    </div>
                  </div>
                  <button className="absolute bottom-1 right-1 w-8 h-8 bg-white text-gray-600 border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:text-primary hover:border-primary/50 transition-all cursor-pointer">
                    <Camera size={14} />
                  </button>
                </div>
              </div>
              
              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold text-gray-900">{currentUser?.name || 'Admin'}</h2>
                <div className="flex items-center justify-center gap-1.5 text-sm text-primary font-medium bg-primary/5 w-max mx-auto px-3 py-1 rounded-full border border-primary/10">
                  <Shield size={14} />
                  {currentUser?.role || 'Administrator'}
                </div>
              </div>
              
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                  <Mail size={16} className="text-gray-400" />
                  <span className="truncate">{currentUser?.email || '-'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                  <User size={16} className="text-gray-400" />
                  <span className="truncate">Bergabung sejak 2026</span>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100">
                <AlertDialog>
                  <AlertDialogTrigger className="flex items-center justify-center gap-2 w-full text-red-600 font-medium hover:bg-red-50 py-2.5 rounded-xl transition-colors cursor-pointer">
                    <LogOut size={18} />
                    Keluar Akun
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Konfirmasi Keluar</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin keluar dari akun? Anda perlu memasukkan email dan kata sandi kembali untuk login.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => {
                        localStorage.removeItem('token');
                        navigate('/auth/login');
                      }} className="bg-red-600 text-white hover:bg-red-700">
                        Ya, Keluar Akun
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column - Edit Profile Form */}
        <div className="xl:col-span-1">
          {/* Edit Profile Form */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col h-full transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <User size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 leading-tight">Informasi Dasar</h3>
                <p className="text-xs text-gray-500 mt-0.5">Perbarui nama dan email.</p>
              </div>
            </div>
            
            <form className="space-y-4 flex-1 flex flex-col" onSubmit={handleProfileSubmit(onProfileSaveRequest)}>
              <div className="space-y-4 flex-1">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input id="name" {...registerProfile('name')} className={`h-10 rounded-xl bg-gray-50/50 focus:bg-white transition-colors ${profileErrors.name ? 'border-red-500' : ''}`} />
                  {profileErrors.name && <p className="text-xs text-red-500">{profileErrors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Alamat Email</Label>
                  <Input id="email" type="email" {...registerProfile('email')} className={`h-10 rounded-xl bg-gray-50/50 focus:bg-white transition-colors ${profileErrors.email ? 'border-red-500' : ''}`} />
                  {profileErrors.email && <p className="text-xs text-red-500">{profileErrors.email.message}</p>}
                </div>
              </div>
              
              <div className="pt-4 mt-auto">
                <Button type="submit" disabled={profileMutation.isPending} className="w-full h-10 rounded-xl shadow-sm shadow-primary/20 gap-2">
                  <Save size={18} />
                  {profileMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column - Change Password Form */}
        <div className="xl:col-span-1">
          {/* Change Password Form */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col h-full transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 leading-tight">Keamanan Akun</h3>
                <p className="text-xs text-gray-500 mt-0.5">Ubah kata sandi secara berkala.</p>
              </div>
            </div>
            
            <form className="space-y-4 flex-1 flex flex-col" onSubmit={handlePasswordSubmit(onPasswordSaveRequest)}>
              <div className="space-y-4 flex-1">
                <div className="space-y-2">
                  <Label htmlFor="current_password">Kata Sandi Saat Ini</Label>
                  <Input id="current_password" type="password" {...registerPassword('current_password')} placeholder="••••••••" className={`h-10 rounded-xl bg-gray-50/50 focus:bg-white transition-colors ${passwordErrors.current_password ? 'border-red-500' : ''}`} />
                  {passwordErrors.current_password && <p className="text-xs text-red-500">{passwordErrors.current_password.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new_password">Kata Sandi Baru</Label>
                  <Input id="new_password" type="password" {...registerPassword('new_password')} placeholder="••••••••" className={`h-10 rounded-xl bg-gray-50/50 focus:bg-white transition-colors ${passwordErrors.new_password ? 'border-red-500' : ''}`} />
                  {passwordErrors.new_password && <p className="text-xs text-red-500">{passwordErrors.new_password.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Konfirmasi Sandi Baru</Label>
                  <Input id="confirm_password" type="password" {...registerPassword('confirm_password')} placeholder="••••••••" className={`h-10 rounded-xl bg-gray-50/50 focus:bg-white transition-colors ${passwordErrors.confirm_password ? 'border-red-500' : ''}`} />
                  {passwordErrors.confirm_password && <p className="text-xs text-red-500">{passwordErrors.confirm_password.message}</p>}
                </div>
              </div>
              
              <div className="pt-4 mt-auto">
                <Button type="submit" disabled={passwordMutation.isPending} className="w-full h-10 rounded-xl bg-gray-900 hover:bg-gray-800 shadow-sm gap-2">
                  <Lock size={18} />
                  {passwordMutation.isPending ? 'Memperbarui...' : 'Perbarui Kata Sandi'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Profile */}
      <AlertDialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Perubahan Profil</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menyimpan perubahan informasi profil ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmProfileSave} className="bg-primary text-white hover:bg-primary/90">
              Ya, Simpan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog for Password */}
      <AlertDialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Ubah Kata Sandi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin memperbarui kata sandi akun Anda? Anda harus mengingat sandi yang baru untuk login berikutnya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPasswordSave} className="bg-gray-900 text-white hover:bg-gray-800">
              Ya, Perbarui
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
