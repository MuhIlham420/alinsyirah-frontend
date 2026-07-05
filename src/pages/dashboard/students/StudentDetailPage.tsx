import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, User, Phone, Mail, GraduationCap, CreditCard, CalendarDays, Plus, CheckCircle, Clock, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { getStudent } from '../../../features/students/api/getStudent';
import { getInvoices } from '../../../features/invoices/api/getInvoices';
import { Button } from '../../../components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

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

export default function StudentDetailPage() {
  const currentYearObj = new Date().getFullYear();
  const yearsList = Array.from({ length: 30 }, (_, i) => (currentYearObj - 5 + i).toString());
  const academicYearsList = Array.from({ length: 15 }, (_, i) => {
    const y = currentYearObj - 5 + i;
    return `${y}/${y + 1}`;
  });

  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedBuatTagihanPeriod, setSelectedBuatTagihanPeriod] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [tagihanYear, tagihanMonth] = selectedBuatTagihanPeriod.split('-');

  const handlePeriodChange = (m: string, y: string) => {
    setSelectedBuatTagihanPeriod(`${y}-${m}`);
  };

  const [selectedBayarTahunanYear, setSelectedBayarTahunanYear] = useState(() => {
    const d = new Date();
    return d.getFullYear().toString();
  });

  const { data: studentData, isLoading: isLoadingStudent } = useQuery({
    queryKey: ['students', id],
    queryFn: () => getStudent(Number(id)),
    enabled: !!id,
  });

  const { data: invoicesData, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['invoices', 'student', id],
    queryFn: () => getInvoices({ student_id: Number(id), per_page: 100 }),
    enabled: !!id,
  });

  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    return currentMonth >= 7 ? currentYear : currentYear - 1;
  });

  const student = studentData?.data;
  const invoices = invoicesData?.data || [];

  // Local state for "Tagihan Lainnya" filters and pagination
  const [otherStatusFilter, setOtherStatusFilter] = useState('Semua Status');
  const [otherSortOrder, setOtherSortOrder] = useState('terbaru');
  const [otherPage, setOtherPage] = useState(1);
  const [otherPerPage, setOtherPerPage] = useState(5);

  const allOtherInvoices = useMemo(() => {
    let filtered = invoices.filter(i => i.fee_type !== 'spp');
    if (otherStatusFilter === 'Lunas') {
      filtered = filtered.filter(i => i.status === 'paid');
    } else if (otherStatusFilter === 'Belum Bayar') {
      filtered = filtered.filter(i => i.status === 'pending_payment' || i.status === 'draft');
    }
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || a.due_date).getTime();
      const dateB = new Date(b.created_at || b.due_date).getTime();
      return otherSortOrder === 'terlama' ? dateA - dateB : dateB - dateA;
    });
    return filtered;
  }, [invoices, otherStatusFilter, otherSortOrder]);

  const otherTotalPages = Math.max(1, Math.ceil(allOtherInvoices.length / otherPerPage));
  const otherPaginatedInvoices = allOtherInvoices.slice((otherPage - 1) * otherPerPage, otherPage * otherPerPage);

  if (isLoadingStudent) {
    return <div className="p-8 text-center text-gray-500">Memuat profil siswa...</div>;
  }

  if (!student) {
    return <div className="p-8 text-center text-red-500">Siswa tidak ditemukan.</div>;
  }

  const academicMonths = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 6) % 12 + 1; // 7 to 12, then 1 to 6
    const year = i < 6 ? selectedYear : selectedYear + 1;
    const periodStr = `${year}-${month.toString().padStart(2, '0')}`;
    const date = new Date(year, month - 1, 1);
    const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(date);
    return {
      period: periodStr,
      label: `${monthName} ${year}`
    };
  });

  const handleBuatTagihan = (period?: string) => {
    navigate('/invoices', {
      state: {
        openAddInvoice: true,
        prefillStudentId: student.id,
        prefillPeriod: period || selectedBuatTagihanPeriod,
      }
    });
  };

  const handleBayarTahunan = () => {
    navigate('/annual-prepayment', {
      state: {
        prefillStudentId: student.id,
        prefillYear: selectedBayarTahunanYear,
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/students">
            <Button variant="outline" className="w-10 h-10 p-0 rounded-xl border-gray-200">
              <ArrowLeft size={18} className="text-gray-600" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Siswa</h1>
            <p className="text-sm text-gray-500">Informasi lengkap profil dan riwayat tagihan</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger render={
              <Button
                variant="outline"
                className="gap-2 rounded-xl h-10 border-primary/20 text-primary hover:bg-primary/5 shadow-sm"
              >
                <CreditCard size={16} />
                Bayar SPP Setahun
              </Button>
            } />
            <PopoverContent className="w-64 p-4 rounded-xl shadow-lg border border-gray-100" align="end" sideOffset={8}>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm">Pembayaran Tahunan</h4>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Tahun Ajaran</Label>
                  <Select value={selectedBayarTahunanYear} onValueChange={setSelectedBayarTahunanYear}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Pilih Tahun" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      {yearsList.map(y => (
                        <SelectItem key={y} value={y}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleBayarTahunan} className="w-full bg-primary text-white h-9 rounded-lg text-sm">Lanjutkan</Button>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger render={
              <Button
                className="bg-primary hover:bg-primary/90 text-white gap-2 rounded-xl h-10 shadow-sm"
              >
                <Plus size={16} />
                Buat Tagihan Baru
              </Button>
            } />
            <PopoverContent className="w-64 p-4 rounded-xl shadow-lg border border-gray-100" align="end" sideOffset={8}>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm">Buat Tagihan Baru</h4>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Periode Tagihan</Label>
                  <div className="flex gap-2">
                    <div className="w-1/2">
                      <Select value={tagihanMonth} onValueChange={(val) => handlePeriodChange(val, tagihanYear)}>
                        <SelectTrigger className="h-9 text-sm">
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
                      <Select value={tagihanYear} onValueChange={(val) => handlePeriodChange(tagihanMonth, val)}>
                        <SelectTrigger className="h-9 text-sm">
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
                </div>
                <Button onClick={() => handleBuatTagihan()} className="w-full bg-primary text-white h-9 rounded-lg text-sm">Lanjutkan</Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 flex flex-col items-center justify-center border-b border-gray-100">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm text-primary mb-3">
                <User size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center">{student.name}</h2>
              <p className="text-sm text-gray-500 mt-1">NIS: {student.nis}</p>
              <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white text-primary border border-primary/20 shadow-sm gap-1.5">
                <GraduationCap size={14} />
                Kelas {student.school_class}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Status Siswa</p>
                <div>
                  {student.status === 'active' ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">Aktif</span>
                  ) : student.status === 'graduated' ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">Lulus</span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">Tidak Aktif</span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">SPP Bulanan</p>
                <p className="text-base font-bold text-gray-900">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(student.monthly_fee)}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-3">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Informasi Orang Tua</p>
                <div className="flex items-start gap-3">
                  <User size={16} className="text-gray-400 mt-0.5" />
                  <div className="text-sm font-medium text-gray-900">{student.parent_name}</div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-gray-400 mt-0.5" />
                  <div className="text-sm text-gray-600">{student.parent_phone}</div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-gray-400 mt-0.5" />
                  <div className="text-sm text-gray-600 break-all">{student.parent_email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: SPP History Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CalendarDays size={20} className="text-primary" />
                  Riwayat SPP
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">Tahun Ajaran:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                >
                  {academicYearsList.map(ay => {
                    const y = parseInt(ay.split('/')[0]);
                    return <option key={ay} value={y}>{ay}</option>;
                  })}
                </select>
              </div>
            </div>

            <div className="p-5">
              {isLoadingInvoices ? (
                <div className="text-center text-gray-500 py-8">Memuat tagihan...</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {academicMonths.map((m) => {
                    const invoice = invoices.find(i => i.period === m.period && i.fee_type === 'spp');

                    return (
                      <div key={m.period} className="border border-gray-100 rounded-xl p-2.5 flex flex-col justify-between gap-2 bg-white hover:border-primary/30 transition-colors shadow-sm hover:shadow-md">
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-gray-900 text-[11px] leading-tight">{m.label}</span>
                          {invoice && (
                            <Link to={`/invoices/${invoice.id}`} className="text-gray-400 hover:text-primary transition-colors" title="Lihat Detail Tagihan">
                              <FileText size={14} />
                            </Link>
                          )}
                        </div>

                        <div className="mt-auto">
                          {invoice ? (
                            invoice.status === 'paid' ? (
                              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                                <CheckCircle size={14} /> Lunas
                              </div>
                            ) : invoice.status === 'pending_payment' ? (
                              <div className="flex items-center gap-1.5 text-blue-600 text-xs font-medium">
                                <Clock size={14} /> Menunggu
                              </div>
                            ) : invoice.status === 'draft' ? (
                              <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                                <FileText size={14} /> Draft
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-red-500 text-xs font-medium">
                                <Clock size={14} /> {invoice.status}
                              </div>
                            )
                          ) : (
                            <Button
                              onClick={() => handleBuatTagihan(m.period)}
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 w-full text-primary hover:text-primary hover:bg-primary/10 gap-1 rounded-lg border border-dashed border-primary/30 text-xs"
                            >
                              <Plus size={12} /> Buat
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Other Invoices (Enrollment, Other) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                Tagihan Lainnya
              </h3>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium whitespace-nowrap">
                  <span>Status:</span>
                  <select
                    value={otherStatusFilter}
                    onChange={(e) => { setOtherStatusFilter(e.target.value); setOtherPage(1); }}
                    className="bg-white border border-gray-200 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Semua Status">Semua Status</option>
                    <option value="Belum Bayar">Belum Bayar</option>
                    <option value="Lunas">Lunas</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium whitespace-nowrap">
                  <span>Urutkan:</span>
                  <select
                    value={otherSortOrder}
                    onChange={(e) => { setOtherSortOrder(e.target.value); setOtherPage(1); }}
                    className="bg-white border border-gray-200 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="terbaru">Terbaru</option>
                    <option value="terlama">Terlama</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-0">
              {isLoadingInvoices ? (
                <div className="text-center text-gray-500 py-8">Memuat tagihan...</div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="divide-y divide-gray-100">
                    {allOtherInvoices.length === 0 ? (
                      <div className="p-6 text-center text-sm text-gray-500">
                        Belum ada tagihan selain SPP.
                      </div>
                    ) : (
                      otherPaginatedInvoices.map(invoice => (
                        <div key={invoice.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 hover:bg-gray-50/50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="uppercase text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md shrink-0">
                                {invoice.fee_type}
                              </span>
                              <span className="font-semibold text-gray-900 truncate">
                                {invoice.description || 'Tagihan Lainnya'}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1.5">
                              <CalendarDays size={13} className="text-gray-400" />
                              {invoice.period} <span className="text-gray-300">•</span> Jatuh tempo: {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(invoice.due_date))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 shrink-0">
                            <div className="w-24 text-left sm:text-right shrink-0">
                              <div className="font-bold text-gray-900">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(invoice.amount)}
                              </div>
                            </div>

                            <div className="w-[100px] flex justify-end shrink-0">
                              {invoice.status === 'paid' ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200 w-full justify-center">
                                  <CheckCircle size={12} /> Lunas
                                </span>
                              ) : invoice.status === 'pending_payment' || invoice.status === 'draft' ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200 w-full justify-center">
                                  <Clock size={12} /> Belum<span className="hidden sm:inline"> Bayar</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200 w-full justify-center">
                                  {invoice.status}
                                </span>
                              )}
                            </div>

                            <div className="shrink-0">
                              <Link to={`/invoices/${invoice.id}`} className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-primary/10 rounded-lg inline-flex" title="Lihat Detail Tagihan">
                                <FileText size={18} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {allOtherInvoices.length > 0 && (
                    <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 bg-gray-50/50">
                      <div className="flex items-center gap-4">
                        <span>Menampilkan {otherPaginatedInvoices.length} dari {allOtherInvoices.length} data</span>
                        <div className="flex items-center gap-2">
                          <span>Baris per halaman:</span>
                          <select
                            className="bg-white border border-gray-200 rounded-lg py-1 px-2 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                            value={otherPerPage}
                            onChange={(e) => { setOtherPerPage(Number(e.target.value)); setOtherPage(1); }}
                          >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span>Halaman {otherPage} dari {otherTotalPages}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setOtherPage(p => Math.max(1, p - 1))}
                            disabled={otherPage <= 1}
                            className="p-1.5 border border-gray-200 rounded-lg bg-white disabled:opacity-50 hover:bg-gray-50 text-gray-700 transition-colors"
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <button
                            onClick={() => setOtherPage(p => Math.min(otherTotalPages, p + 1))}
                            disabled={otherPage >= otherTotalPages}
                            className="p-1.5 border border-gray-200 rounded-lg bg-white disabled:opacity-50 hover:bg-gray-50 text-gray-700 transition-colors"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
