import { z } from 'zod';

export interface Student {
  id: number;
  nis: string;
  name: string;
  school_class: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  monthly_fee: number;
  status: 'active' | 'inactive' | 'graduated';
  created_at?: string;
  updated_at?: string;
}

export const studentSchema = z.object({
  nis: z.string().min(1, 'NIS tidak boleh kosong').max(20, 'NIS maksimal 20 karakter'),
  name: z.string().min(1, 'Nama tidak boleh kosong').max(255, 'Nama maksimal 255 karakter'),
  school_class: z.string().min(1, 'Kelas tidak boleh kosong').max(255, 'Kelas maksimal 255 karakter'),
  parent_name: z.string().min(1, 'Nama orang tua tidak boleh kosong').max(255, 'Nama orang tua maksimal 255 karakter'),
  parent_phone: z.string().min(1, 'Nomor telepon tidak boleh kosong').max(20, 'Nomor telepon maksimal 20 karakter'),
  parent_email: z.string().email('Format email tidak valid').max(255, 'Email maksimal 255 karakter'),
  monthly_fee: z.number().min(0, 'SPP bulanan tidak boleh kurang dari 0'),
  status: z.enum(['active', 'inactive', 'graduated']),
});

export type StudentFormData = z.infer<typeof studentSchema>;
