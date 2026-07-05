
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router';
import { Search, CreditCard, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import { getPayments } from '../../../features/payments/api/getPayments';
import type { PaymentAttempt } from '../../../features/payments/types';

export default function PaymentHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'Semua Transaksi';
  const paymentMethod = searchParams.get('payment_method') || 'Semua Metode';
  const sort = searchParams.get('sort') || 'terbaru';
  const page = Number(searchParams.get('page')) || 1;
  const perPage = Number(searchParams.get('per_page')) || 10;

  const [searchInput, setSearchInput] = useState(search);

  const handleCopyLink = async (url?: string) => {
    if (!url) {
      alert('Link pembayaran tidak tersedia untuk transaksi ini.');
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      alert('Link pembayaran berhasil disalin!');
    } catch (err) {
      alert('Gagal menyalin link.');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        setSearchParams(prev => {
          if (searchInput) prev.set('search', searchInput);
          else prev.delete('search');
          prev.set('page', '1');
          return prev;
        });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, search, setSearchParams]);

  const updateParam = (key: string, value: string) => {
    setSearchParams(prev => {
      if (value && value !== 'Semua Transaksi' && value !== 'Semua Metode') prev.set(key, value);
      else prev.delete(key);
      if (key !== 'page') prev.set('page', '1');
      return prev;
    });
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['payments', { search, status, payment_method: paymentMethod, sort, page, per_page: perPage }],
    queryFn: () => getPayments({ search, status, payment_method: paymentMethod, sort, page, per_page: perPage }),
  });

  const getStatusBadge = (status: PaymentAttempt['status']) => {
    switch (status) {
      case 'paid':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200"><CheckCircle size={12} /> Lunas</span>;
      case 'failed':
      case 'cancelled':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200"><XCircle size={12} /> Gagal</span>;
      case 'expired':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200"><Clock size={12} /> Kedaluwarsa</span>;
      case 'pending':
      case 'creating':
      case 'created':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200"><Clock size={12} /> Belum Bayar</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">{status}</span>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dateString));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Riwayat Pembayaran</h1>
          <p className="text-gray-500 mt-1">Log dan status seluruh transaksi pembayaran melalui Midtrans.</p>
        </div>
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
              placeholder="Cari ID transaksi..." 
              className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium whitespace-nowrap">
              <span>Status:</span>
              <select
                value={status}
                onChange={(e) => updateParam('status', e.target.value)}
                className="bg-white border border-gray-200 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Semua Transaksi">Semua Transaksi</option>
                <option value="Lunas">Lunas</option>
                <option value="Belum Bayar">Belum Bayar</option>
                <option value="Gagal">Gagal</option>
                <option value="Kedaluwarsa">Kedaluwarsa</option>
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium whitespace-nowrap">
              <span>Metode:</span>
              <select
                value={paymentMethod}
                onChange={(e) => updateParam('payment_method', e.target.value)}
                className="bg-white border border-gray-200 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Semua Metode">Semua Metode</option>
                <option value="qris">QRIS</option>
                <option value="bca_va">BCA VA</option>
                <option value="mandiri_va">Mandiri VA</option>
                <option value="bni_va">BNI VA</option>
                <option value="alfamart">Alfamart</option>
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
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Waktu Transaksi</th>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Siswa</th>
                <th className="px-6 py-4">Metode</th>
                <th className="px-6 py-4">Nominal</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                      Memuat riwayat pembayaran...
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-red-500">
                    Gagal memuat riwayat pembayaran.
                  </td>
                </tr>
              ) : !data?.data || data.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Belum ada data transaksi pembayaran atau tidak ditemukan.
                  </td>
                </tr>
              ) : (
                data.data.map((payment: PaymentAttempt) => (
                  <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(payment.created_at)}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {payment.provider_order_id}
                    </td>
                    <td className="px-6 py-4">
                      {payment.student ? (
                        <div className="font-medium text-gray-900">{payment.student.name}</div>
                      ) : (
                        <span className="text-gray-400 italic">Unknown</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <CreditCard size={14} className="text-gray-400" />
                        <span className="uppercase font-medium text-xs">
                          {payment.payment_method === '-' ? 'Menunggu' : payment.payment_method?.replace('_', ' ') || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {['pending', 'creating', 'created'].includes(payment.status) && (
                          <button
                            onClick={() => handleCopyLink((payment as any).payment_url || 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-url-123')}
                            title="Salin Link Pembayaran"
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 hover:bg-emerald-100 rounded-lg"
                          >
                            <Copy size={16} />
                          </button>
                        )}
                        <Link 
                          to={`/payments/${payment.id}`}
                          className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors px-3 py-1.5 inline-block border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
                        >
                          Detail
                        </Link>
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
