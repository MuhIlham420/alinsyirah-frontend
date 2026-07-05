import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { getStudents } from '../../../features/students/api/getStudents';
import type { Student } from '../../../features/students/types';
import { AddStudentDialog } from '../../../features/students/components/AddStudentDialog';
import { EditStudentDialog } from '../../../features/students/components/EditStudentDialog';
import { DeleteStudentDialog } from '../../../features/students/components/DeleteStudentDialog';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';

export default function StudentsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const className = searchParams.get('class_name') || 'Semua Kelas';
  const sort = searchParams.get('sort') || 'terbaru';
  const page = Number(searchParams.get('page')) || 1;
  const perPage = Number(searchParams.get('per_page')) || 10;

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        setSearchParams(prev => {
          if (searchInput) prev.set('search', searchInput);
          else prev.delete('search');
          prev.set('page', '1'); // reset page on search
          return prev;
        });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, search, setSearchParams]);

  const updateParam = (key: string, value: string) => {
    setSearchParams(prev => {
      if (value && value !== 'Semua Kelas') prev.set(key, value);
      else prev.delete(key);
      if (key !== 'page') prev.set('page', '1'); // reset page on filter
      return prev;
    });
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['students', { search, class_name: className, sort, page, per_page: perPage }],
    queryFn: () => getStudents({ search, class_name: className, sort, page, per_page: perPage }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manajemen Siswa</h1>
          <p className="text-gray-500 mt-1">Kelola data siswa, kelas, dan informasi kontak orang tua.</p>
        </div>
        <AddStudentDialog />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative w-full max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari nama atau NIS..."
              className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium whitespace-nowrap">
              <span>Kelas:</span>
              <select
                value={className}
                onChange={(e) => updateParam('class_name', e.target.value)}
                className="bg-white border border-gray-200 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Semua Kelas">Semua Kelas</option>
                <option value="X-A">X-A</option>
                <option value="X-B">X-B</option>
                <option value="XI-A">XI-A</option>
                <option value="XI-B">XI-B</option>
                <option value="XII-A">XII-A</option>
                <option value="XII-B">XII-B</option>
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium whitespace-nowrap">
              <span>Urutkan:</span>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="bg-white border border-gray-200 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="terbaru">Terbaru</option>
                <option value="terlama">Terlama</option>
                <option value="nama_az">Nama A-Z</option>
                <option value="nama_za">Nama Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Nama Siswa</th>
                <th className="px-6 py-4">NIS</th>
                <th className="px-6 py-4">Kelas</th>
                <th className="px-6 py-4">Orang Tua</th>
                <th className="px-6 py-4">SPP Bulanan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                      Memuat data siswa...
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-red-500">
                    Gagal memuat data siswa.
                  </td>
                </tr>
              ) : !data?.data || data.data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Belum ada data siswa atau tidak ditemukan.
                  </td>
                </tr>
              ) : (
                data.data.map((student: Student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{student.nis}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {student.school_class}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">{student.parent_name}</div>
                      <div className="text-xs text-gray-500">{student.parent_phone}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(student.monthly_fee)}
                    </td>
                    <td className="px-6 py-4">
                      {student.status === 'active' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">Aktif</span>
                      ) : student.status === 'graduated' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">Lulus</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">Tidak Aktif</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/students/${student.id}`}
                          className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors px-3 py-1.5 inline-block border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
                        >
                          Detail
                        </Link>
                        <Popover>
                          <PopoverTrigger render={<button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" />}>
                            <MoreVertical size={16} />
                          </PopoverTrigger>
                          <PopoverContent className="w-32 p-1 rounded-xl shadow-lg border border-gray-100" align="end">
                            <EditStudentDialog student={student} />
                            <DeleteStudentDialog student={student} />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && !isError && data && data.data.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 bg-gray-50/50">
            <div className="flex items-center gap-4">
              <span>Menampilkan {data.data.length} dari {data.meta.total} data</span>
              <div className="flex items-center gap-2">
                <span>Baris per halaman:</span>
                <select
                  className="bg-white border border-gray-200 rounded-lg py-1 px-2 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  value={perPage}
                  onChange={(e) => updateParam('per_page', e.target.value)}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span>Halaman {data.meta.page} dari {data.meta.last_page}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => updateParam('page', String(page - 1))}
                  disabled={page <= 1}
                  className="p-1.5 border border-gray-200 rounded-lg bg-white disabled:opacity-50 hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => updateParam('page', String(page + 1))}
                  disabled={page >= data.meta.last_page}
                  className="p-1.5 border border-gray-200 rounded-lg bg-white disabled:opacity-50 hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
