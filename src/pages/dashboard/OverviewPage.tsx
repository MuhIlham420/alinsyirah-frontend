import { useQuery } from '@tanstack/react-query';
import { Users, CheckCircle, Clock, Plus, ArrowRight, UserPlus, CreditCard, XCircle, FileWarning, AlertTriangle, BarChart3 } from 'lucide-react';
import { Link } from 'react-router';
import { getStudents } from '../../features/students/api/getStudents';
import { getInvoices } from '../../features/invoices/api/getInvoices';
import { getPayments } from '../../features/payments/api/getPayments';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, isToday } from 'date-fns';
import { id } from 'date-fns/locale';

// Data performa penagihan per bulan (jumlah siswa)
const chartData = [
  { name: 'Jan', lunas: 310, belum: 32 },
  { name: 'Feb', lunas: 305, belum: 37 },
  { name: 'Mar', lunas: 315, belum: 27 },
  { name: 'Apr', lunas: 300, belum: 42 },
  { name: 'Mei', lunas: 290, belum: 52 },
  { name: 'Jun', lunas: 150, belum: 192 },
];

export default function OverviewPage() {
  // Fetch real data
  const { data: studentsResponse, isLoading: loadingStudents } = useQuery({
    queryKey: ['students', { per_page: 1 }], // Fetch minimally just to get total count
    queryFn: () => getStudents({ page: 1, per_page: 1 }),
  });

  const { data: invoicesResponse, isLoading: loadingInvoices } = useQuery({
    queryKey: ['invoices', { per_page: 1000 }],
    queryFn: () => getInvoices({ page: 1, per_page: 1000 }),
  });

  const { data: paymentsResponse, isLoading: loadingPayments } = useQuery({
    queryKey: ['payments', { per_page: 5, sort: 'terbaru' }],
    queryFn: () => getPayments({ page: 1, per_page: 5, sort: 'terbaru' }), // Get top 5 recent payments
  });

  const isLoading = loadingStudents || loadingInvoices || loadingPayments;

  // Compute stats
  const totalStudents = studentsResponse?.meta?.total || 0;

  const allInvoices = invoicesResponse?.data || [];
  const activeInvoices = allInvoices.filter(inv => inv.status !== 'paid');

  const allPayments = paymentsResponse?.data || [];
  const todayPayments = allPayments.filter(p => isToday(new Date(p.created_at)));

  const overdueInvoices = activeInvoices.filter(inv => inv.due_date && new Date(inv.due_date) < new Date());

  const stats = [
    { title: 'Total Siswa Aktif', value: isLoading ? '...' : totalStudents.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-500/10 to-blue-500/5' },
    { title: 'Tagihan Belum Lunas', value: isLoading ? '...' : activeInvoices.length.toString(), icon: FileWarning, color: 'text-red-600', bg: 'bg-red-50', gradient: 'from-red-500/10 to-red-500/5' },
    { title: 'Transaksi Hari Ini', value: isLoading ? '...' : todayPayments.length.toString(), icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500/10 to-emerald-500/5' },
    { title: 'Tagihan Jatuh Tempo', value: isLoading ? '...' : overdueInvoices.length.toString(), icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', gradient: 'from-amber-500/10 to-amber-500/5' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const recentPayments = paymentsResponse?.data || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Selamat datang kembali!</h1>
          <p className="text-sm text-gray-500 mt-1">Berikut adalah ringkasan aktivitas dan keuangan Al-Insyirah hari ini.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/students" className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm">
            <UserPlus size={16} />
            Tambah Siswa
          </Link>
          <Link to="/invoices" className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm shadow-primary/20">
            <Plus size={16} />
            Buat Tagihan Baru
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon size={22} className={stat.color} />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">{stat.title}</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Admin Metric Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Statistik Kelancaran SPP</h3>
              <p className="text-xs text-gray-500 mt-0.5">Jumlah siswa yang sudah vs belum bayar</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-xl">
              <BarChart3 size={20} className="text-gray-400" />
            </div>
          </div>

          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Bar dataKey="lunas" name="Sudah Lunas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="belum" name="Belum Lunas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 text-lg">Transaksi Terbaru</h3>
            <Link to="/payments" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
              Lihat Semua
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3"></div>
                <p className="text-sm">Memuat data...</p>
              </div>
            ) : recentPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <CreditCard size={40} className="mb-3 text-gray-200" />
                <p className="text-sm">Belum ada transaksi</p>
              </div>
            ) : (
              recentPayments.map((payment) => {
                const isSuccess = payment.status === 'paid';
                const isPending = payment.status === 'pending';
                const Icon = isSuccess ? CheckCircle : (isPending ? Clock : XCircle);
                const colorClass = isSuccess ? 'text-emerald-600 bg-emerald-50' : (isPending ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50');
                const badgeClass = isSuccess ? 'bg-emerald-100 text-emerald-700' : (isPending ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700');
                const statusLabel = isSuccess ? 'Berhasil' : (isPending ? 'Tertunda' : 'Gagal');

                return (
                  <div key={payment.id} className="flex gap-4 items-start p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 cursor-pointer">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{payment.student?.name || 'Siswa'}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {payment.invoices && payment.invoices.length > 0
                          ? payment.invoices.map(i => i.description || `Tagihan ${i.period}`).join(', ')
                          : 'Pembayaran'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(payment.created_at), 'dd MMM yyyy, HH:mm', { locale: id })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${badgeClass}`}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
