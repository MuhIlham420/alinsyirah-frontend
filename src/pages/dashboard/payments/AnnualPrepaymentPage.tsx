import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, CreditCard, Receipt, CheckCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { createAnnualPrepayment } from '../../../features/payments/api/createAnnualPrepayment';
import { annualPrepaymentSchema } from '../../../features/payments/types';
import { getStudents } from '../../../features/students/api/getStudents';
import { getInvoices } from '../../../features/invoices/api/getInvoices';

export default function AnnualPrepaymentPage() {
  const [successMessage, setSuccessMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch students for dropdown
  const { data: studentsData } = useQuery({
    queryKey: ['students', 'all'],
    queryFn: () => getStudents({ per_page: 1000 }),
  });
  const students = studentsData?.data || [];

  const years = Array.from({ length: 30 }, (_, i) => (2021 + i).toString());

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(annualPrepaymentSchema),
    defaultValues: {
      student_id: 0,
      year: new Date().getFullYear().toString(),
      discount_percentage: 0,
    },
  });

  const selectedStudentId = watch('student_id');
  const discountPercentage = watch('discount_percentage') || 0;
  const selectedYear = watch('year');

  const selectedStudent = students.find((s: any) => s.id === selectedStudentId);
  const monthlyFee = selectedStudent?.monthly_fee || 0;

  // Fetch invoices for this student to check already paid months
  const { data: invoicesData } = useQuery({
    queryKey: ['invoices', 'student', selectedStudentId],
    queryFn: () => getInvoices({ student_id: selectedStudentId, per_page: 100 }),
    enabled: !!selectedStudentId && selectedStudentId > 0,
  });

  const invoices = invoicesData?.data || [];
  const paidMonthsCount = invoices.filter(
    (inv: any) => inv.fee_type === 'spp' && inv.status === 'paid' && inv.period.startsWith(selectedYear)
  ).length;

  const remainingMonths = Math.max(0, 12 - paidMonthsCount);
  const grossAmount = monthlyFee * remainingMonths;
  const discountAmount = grossAmount * (discountPercentage / 100);
  const totalAmount = grossAmount > discountAmount ? grossAmount - discountAmount : 0;
  
  const isFullyPaid = paidMonthsCount >= 12;

  const mutation = useMutation({
    mutationFn: createAnnualPrepayment,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setSuccessMessage('Pembayaran tahunan berhasil diproses. Mengalihkan...');
      reset();
      if (response.data?.id) {
        setTimeout(() => navigate(`/payments/${response.data.id}`), 1500);
      } else {
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  useEffect(() => {
    const state = location.state as any;
    if (state?.prefillStudentId || state?.prefillYear) {
      if (state.prefillStudentId) {
        setValue('student_id', state.prefillStudentId, { shouldValidate: true });
      }
      if (state.prefillYear) {
        setValue('year', state.prefillYear, { shouldValidate: true });
      }
      // Clear state so it doesn't persist on refresh
      navigate('.', { replace: true, state: {} });
    }
  }, [location.state, navigate, setValue]);

  const onSubmit = (data: any) => {
    mutation.mutate({
      student_id: data.student_id,
      year: data.year,
      discount_amount: discountAmount,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Pembayaran Tahunan</h1>
        <p className="text-gray-500 mt-1">Catat pembayaran SPP siswa untuk satu tahun ajaran penuh (12 bulan).</p>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm border border-emerald-100 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
          <Receipt size={18} />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Calendar size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Form Pembayaran 1 Tahun</h2>
            <p className="text-sm text-gray-500">Isi data di bawah ini dengan teliti.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="student_id">Pilih Siswa</Label>
              <Controller
                name="student_id"
                control={control}
                render={({ field }) => (
                  <Select 
                    value={field.value ? field.value.toString() : ""} 
                    onValueChange={(val) => field.onChange(Number(val))}
                  >
                    <SelectTrigger className={`w-full h-11 rounded-lg ${errors.student_id ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'}`}>
                      <SelectValue placeholder="Pilih Siswa..." />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      {students.map((student: any) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.nis} - {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.student_id && <p className="text-xs text-red-500 mt-1">{errors.student_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Tahun Kalender</Label>
              <Controller
                name="year"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={`w-full h-11 rounded-lg ${errors.year ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'}`}>
                      <SelectValue placeholder="Pilih Tahun" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      {years.map((y) => (
                        <SelectItem key={y} value={y}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.year && <p className="text-xs text-red-500 mt-1">{errors.year.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_percentage">Diskon (%)</Label>
              <Input
                id="discount_percentage"
                type="number"
                {...register('discount_percentage', { valueAsNumber: true })}
                className={`h-11 rounded-lg ${errors.discount_percentage ? 'border-red-500 focus-visible:ring-red-200' : 'border-gray-200 focus-visible:ring-primary/20 focus-visible:border-primary'}`}
                placeholder="0 - 100"
              />
              {errors.discount_percentage && <p className="text-xs text-red-500 mt-1">{errors.discount_percentage.message}</p>}
            </div>
          </div>

          {selectedStudent && (
            <div className={`mt-8 border rounded-xl p-6 ${isFullyPaid ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
              {isFullyPaid ? (
                <div className="text-center space-y-2">
                  <CheckCircle size={32} className="mx-auto text-emerald-500 mb-2" />
                  <h3 className="font-bold text-emerald-800 text-lg">Semua SPP Lunas!</h3>
                  <p className="text-sm text-emerald-600">Siswa ini telah melunasi seluruh 12 bulan SPP untuk tahun {selectedYear}. Tidak ada tagihan yang perlu dibayar.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Ringkasan Pembayaran</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>SPP Bulanan ({selectedStudent.name})</span>
                      <span>{formatCurrency(monthlyFee)}</span>
                    </div>
                    {paidMonthsCount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Telah Dibayar (Lunas)</span>
                        <span>{paidMonthsCount} Bulan</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>Total Tagihan ({remainingMonths} Bulan)</span>
                      <span>{formatCurrency(grossAmount)}</span>
                    </div>
                    {discountPercentage > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Diskon ({discountPercentage}%)</span>
                        <span>- {formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-gray-200 flex justify-between font-bold text-lg text-gray-900">
                      <span>Total Harus Dibayar</span>
                      <span>{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-8 gap-2"
              disabled={mutation.isPending || isSubmitting || isFullyPaid}
            >
              <CreditCard size={18} />
              {mutation.isPending ? 'Memproses...' : 'Proses Pembayaran Tahunan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
