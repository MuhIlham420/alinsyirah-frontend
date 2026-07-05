import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import { addStudent } from '../api/addStudent';
import { studentSchema, type StudentFormData } from '../types';

export function AddStudentDialog() {
  const [open, setOpen] = useState(false);
  const [grade, setGrade] = useState('X');
  const [subClass, setSubClass] = useState('A');
  const [feeInput, setFeeInput] = useState('');
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      nis: '',
      name: '',
      school_class: '',
      parent_name: '',
      parent_phone: '',
      parent_email: '',
      monthly_fee: 0,
      status: 'active',
    },
  });

  const mutation = useMutation({
    mutationFn: addStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setOpen(false);
      reset(); // Reset form
      setGrade('X');
      setSubClass('A');
      setFeeInput('');
    },
  });

  const handleFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const numberValue = parseInt(rawValue, 10) || 0;
    setValue('monthly_fee', numberValue, { shouldValidate: true });
    setFeeInput(rawValue === '' ? '' : new Intl.NumberFormat('id-ID').format(numberValue));
  };

  const onSubmit = (data: StudentFormData) => {
    data.school_class = `${grade}-${subClass}`;
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) {
        reset();
        setGrade('X');
        setSubClass('A');
        setFeeInput('');
      }
    }}>
      <DialogTrigger 
        render={
          <Button className="bg-primary hover:bg-primary/90 text-white gap-2 rounded-xl" />
        }
      >
        <Plus size={18} />
        Tambah Siswa
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Tambah Data Siswa</DialogTitle>
            <DialogDescription>
              Masukkan data siswa baru ke dalam sistem. Klik simpan setelah selesai.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nis" className="text-right text-sm">
                NIS
              </Label>
              <div className="col-span-3">
                <Input
                  id="nis"
                  {...register('nis')}
                  className={errors.nis ? 'border-red-500 focus-visible:ring-red-200' : ''}
                />
                {errors.nis && <p className="text-xs text-red-500 mt-1">{errors.nis.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-sm">
                Nama Siswa
              </Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  {...register('name')}
                  className={errors.name ? 'border-red-500 focus-visible:ring-red-200' : ''}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-sm">
                Kelas
              </Label>
              <div className="col-span-3 flex gap-2">
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-1/2 bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="X">X</option>
                  <option value="XI">XI</option>
                  <option value="XII">XII</option>
                </select>
                <select
                  value={subClass}
                  onChange={(e) => setSubClass(e.target.value)}
                  className="w-1/2 bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parent_name" className="text-right text-sm">
                Nama Ortu
              </Label>
              <div className="col-span-3">
                <Input
                  id="parent_name"
                  {...register('parent_name')}
                  className={errors.parent_name ? 'border-red-500 focus-visible:ring-red-200' : ''}
                />
                {errors.parent_name && <p className="text-xs text-red-500 mt-1">{errors.parent_name.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parent_phone" className="text-right text-sm">
                No HP Ortu
              </Label>
              <div className="col-span-3">
                <Input
                  id="parent_phone"
                  {...register('parent_phone')}
                  className={errors.parent_phone ? 'border-red-500 focus-visible:ring-red-200' : ''}
                />
                {errors.parent_phone && <p className="text-xs text-red-500 mt-1">{errors.parent_phone.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parent_email" className="text-right text-sm">
                Email Ortu
              </Label>
              <div className="col-span-3">
                <Input
                  id="parent_email"
                  type="email"
                  {...register('parent_email')}
                  className={errors.parent_email ? 'border-red-500 focus-visible:ring-red-200' : ''}
                />
                {errors.parent_email && <p className="text-xs text-red-500 mt-1">{errors.parent_email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="monthly_fee" className="text-right text-sm">
                SPP Bulanan
              </Label>
              <div className="col-span-3 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                <Input
                  id="monthly_fee"
                  type="text"
                  value={feeInput}
                  onChange={handleFeeChange}
                  className={`pl-9 ${errors.monthly_fee ? 'border-red-500 focus-visible:ring-red-200' : ''}`}
                  placeholder="0"
                />
                {errors.monthly_fee && <p className="text-xs text-red-500 mt-1">{errors.monthly_fee.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right text-sm">
                Status
              </Label>
              <div className="col-span-3">
                <select
                  id="status"
                  {...register('status')}
                  className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                  <option value="graduated">Lulus</option>
                </select>
                {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status.message}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90 text-white rounded-xl"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Menyimpan...' : 'Simpan Siswa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
