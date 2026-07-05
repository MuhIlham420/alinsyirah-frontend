export interface Student {
  id: number;
  nisn: string;
  name: string;
  grade: string;
  class_name: string;
  parent_phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StudentFormData {
  nisn: string;
  name: string;
  grade: string;
  class_name: string;
  parent_phone?: string;
}
