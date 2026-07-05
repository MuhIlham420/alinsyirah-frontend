import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CalendarIcon } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from '../../../lib/utils';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Calendar } from '../../../components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { createInvoice } from '../api/createInvoice';
import { invoiceSchema, type InvoiceFormData } from '../types';
import { getStudents } from '../../students/api/getStudents';

const MONTHS_LIST = [
  { value: '01', label: 'Januari' },
  { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

export function AddInvoiceDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const [openStudent, setOpenStudent] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  const currentYear = new Date().getFullYear();
  // Munculkan pilihan tahun dari 5 tahun lalu hingga 25 tahun ke depan (total 30 tahun)
  const yearsList = Array.from({ length: 30 }, (_, i) => (currentYear - 5 + i).toString());

  const { data: studentsData } = useQuery({
    queryKey: ['students', 'all'],
    queryFn: () => getStudents({ per_page: 1000 }),
  });
  const students = studentsData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      student_id: 0,
      period: '',
      fee_type: 'spp',
      amount: 500000,
      due_date: '',
    },
  });

  const mutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setOpen(false);
      resetState();
    },
  });

  useEffect(() => {
    const state = location.state as any;
    if (state?.openAddInvoice) {
      setOpen(true);
      if (state.prefillStudentId) {
        setValue('student_id', state.prefillStudentId, { shouldValidate: true });
      }
      if (state.prefillPeriod) {
        const [y, m] = state.prefillPeriod.split('-');
        setSelectedYear(y);
        setSelectedMonth(m);
        setValue('period', state.prefillPeriod, { shouldValidate: true });
        setValue('due_date', `${state.prefillPeriod}-10`);
      }
      // Clear state so it doesn't re-open on refresh
      navigate('.', { replace: true, state: {} });
    }
  }, [location.state, navigate, setValue]);

  const resetState = () => {
    reset();
    setSelectedMonth('');
    setSelectedYear(new Date().getFullYear().toString());
    setStudentSearch('');
  };

  const onSubmit = (data: InvoiceFormData) => {
    mutation.mutate(data);
  };

  const handlePeriodChange = (m: string, y: string) => {
    setSelectedMonth(m);
    setSelectedYear(y);
    if (m && y) {
      const period = `${y}-${m}`;
      setValue('period', period, { shouldValidate: true });
      setValue('due_date', `${period}-10`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) resetState();
    }}>
      <DialogTrigger 
        render={
          <Button className="bg-primary hover:bg-primary/90 text-white gap-2 rounded-xl" />
        }
      >
        <Plus size={18} />
        Buat Tagihan
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] rounded-2xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Buat Tagihan Baru</DialogTitle>
            <DialogDescription>
              Buat tagihan SPP bulanan untuk siswa.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="student_id" className="text-left font-medium">Siswa</Label>
              <div className="col-span-3">
                <Controller
                  name="student_id"
                  control={control}
                  render={({ field }) => {
                    const selectedStudent = students.find((s) => s.id === field.value);
                    const filteredStudents = students.filter(s => 
                      s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                      s.nis.includes(studentSearch)
                    );
                    
                    return (
                      <Popover open={openStudent} onOpenChange={setOpenStudent}>
                        <PopoverTrigger
                          render={
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal border rounded-lg h-10 px-3 py-2",
                                errors.student_id ? "border-red-500" : "border-gray-200"
                              )}
                            />
                          }
                        >
                          {selectedStudent ? `${selectedStudent.nis} - ${selectedStudent.name}` : <span className="text-gray-500">Pilih Siswa...</span>}
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0 rounded-xl" align="start">
                          <div className="p-2 border-b border-gray-100">
                            <Input
                              placeholder="Ketik nama atau NIS..."
                              value={studentSearch}
                              onChange={(e) => setStudentSearch(e.target.value)}
                              className="h-8 border-gray-200 focus-visible:ring-primary/20"
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto p-1">
                            {filteredStudents.length === 0 ? (
                              <div className="p-2 text-sm text-gray-500 text-center">Siswa tidak ditemukan</div>
                            ) : (
                              filteredStudents.map(student => (
                                <div
                                  key={student.id}
                                  className={cn(
                                    "p-2 text-sm rounded-md cursor-pointer transition-colors",
                                    field.value === student.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-gray-100 text-gray-700"
                                  )}
                                  onClick={() => {
                                    field.onChange(student.id);
                                    setOpenStudent(false);
                                    setStudentSearch('');
                                  }}
                                >
                                  {student.nis} - {student.name}
                                </div>
                              ))
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    );
                  }}
                />
                {errors.student_id && <p className="text-xs text-red-500 mt-1">{errors.student_id.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-left font-medium">Periode</Label>
              <div className="col-span-3">
                <div className="flex gap-2">
                  <div className="w-1/2">
                    <Select value={selectedMonth} onValueChange={(val) => handlePeriodChange(val, selectedYear)}>
                      <SelectTrigger className={`h-10 ${errors.period ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Bulan" />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false}>
                        {MONTHS_LIST.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-1/2">
                    <Select value={selectedYear} onValueChange={(val) => handlePeriodChange(selectedMonth, val)}>
                      <SelectTrigger className={`h-10 ${errors.period ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Tahun" />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false}>
                        {yearsList.map((y) => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Hidden input untuk meregistrasikan value period di RHF */}
                <input type="hidden" {...register('period')} />
                {errors.period && <p className="text-xs text-red-500 mt-1">{errors.period.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-left font-medium">Jenis Tagihan</Label>
              <div className="col-span-3">
                <Controller
                  name="fee_type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={`w-full h-10 ${errors.fee_type ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Pilih Jenis..." />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false}>
                        <SelectItem value="spp">SPP (Bulanan)</SelectItem>
                        <SelectItem value="enrollment">Uang Pangkal</SelectItem>
                        <SelectItem value="other">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.fee_type && <p className="text-xs text-red-500 mt-1">{errors.fee_type.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="due_date" className="text-left font-medium">Jatuh Tempo</Label>
              <div className="col-span-3">
                <Controller
                  name="due_date"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal border rounded-lg h-10 px-3 py-2",
                              !field.value && "text-gray-500",
                              errors.due_date ? "border-red-500 text-red-500" : "border-gray-200"
                            )}
                          />
                        }
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(new Date(field.value), "d MMMM yyyy", { locale: localeId }) : <span>Pilih Tanggal</span>}
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(format(date, "yyyy-MM-dd"));
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.due_date && <p className="text-xs text-red-500 mt-1">{errors.due_date.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-left font-medium">Nominal</Label>
              <div className="col-span-3 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    const formatted = value ? new Intl.NumberFormat('id-ID').format(value) : '';
                    return (
                      <Input
                        id="amount"
                        type="text"
                        value={formatted}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/\D/g, '');
                          onChange(rawValue ? Number(rawValue) : 0);
                        }}
                        className={`pl-9 h-10 ${errors.amount ? 'border-red-500 focus-visible:ring-red-200' : ''}`}
                        placeholder="0"
                      />
                    );
                  }}
                />
                {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4 pt-2">
              <div className="text-left">
                <Label htmlFor="description" className="mt-1 block font-medium">Deskripsi</Label>
                <span className="text-[10px] text-gray-400 font-normal leading-none block mt-0.5">(Opsional)</span>
              </div>
              <div className="col-span-3">
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      id="description"
                      {...field}
                      value={field.value || ''}
                      placeholder="Catatan atau rincian tagihan..."
                      className="flex w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 min-h-[60px] resize-y"
                    />
                  )}
                />
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90 text-white rounded-xl"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Menyimpan...' : 'Simpan Tagihan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
