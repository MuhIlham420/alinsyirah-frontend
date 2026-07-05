import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams, useNavigate } from 'react-router';
import { Search, FileText, CheckCircle, Clock, ChevronLeft, ChevronRight, Plus, Loader2 } from 'lucide-react';
import { getInvoices } from '../../../features/invoices/api/getInvoices';
import { payInvoice } from '../../../features/invoices/api/payInvoice';
import type { TuitionInvoice } from '../../../features/invoices/types';
import { AddInvoiceDialog } from '../../../features/invoices/components/AddInvoiceDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';

export default function InvoicesListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'Semua Status';
  const feeType = searchParams.get('fee_type') || 'Semua Jenis';
  const sort = searchParams.get('sort') || 'terbaru';
  const page = Number(searchParams.get('page')) || 1;
  const perPage = Number(searchParams.get('per_page')) || 10;

  const [searchInput, setSearchInput] = useState(search);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [confirmDialogId, setConfirmDialogId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (id: number) => payInvoice(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setProcessingId(null);
      if (res.data?.id) {
        navigate(`/payments/${res.data.id}`);
      }
    },
    onError: () => {
      setProcessingId(null);
    }
  });

  const handleCreateLink = () => {
    if (confirmDialogId) {
      setProcessingId(confirmDialogId);
      mutation.mutate(confirmDialogId);
      setConfirmDialogId(null);
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
      if (value && value !== 'Semua Status' && value !== 'Semua Jenis') prev.set(key, value);
      else prev.delete(key);
      if (key !== 'page') prev.set('page', '1');
      return prev;
    });
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['invoices', { search, status, fee_type: feeType, sort, page, per_page: perPage }],
    queryFn: () => getInvoices({ search, status, fee_type: feeType, sort, page, per_page: perPage }),
  });

  const getStatusBadge = (status: TuitionInvoice['status']) => {
    switch (status) {
      case 'paid':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200"><CheckCircle size={12} /> Lunas</span>;
      case 'pending_payment':
      case 'draft':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200"><Clock size={12} /> Belum Bayar</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">Unknown</span>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manajemen Tagihan SPP</h1>
          <p className="text-gray-500 mt-1">Pantau dan kelola tagihan SPP bulanan siswa.</p>
        </div>
        <AddInvoiceDialog />
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
              placeholder="Cari nama siswa atau bulan..."
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
                <option value="Semua Status">Semua Status</option>
                <option value="Belum Bayar">Belum Bayar</option>
                <option value="Lunas">Lunas</option>
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium whitespace-nowrap">
              <span>Jenis:</span>
              <select
                value={feeType}
                onChange={(e) => updateParam('fee_type', e.target.value)}
                className="bg-white border border-gray-200 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Semua Jenis">Semua Jenis</option>
                <option value="spp">SPP (Bulanan)</option>
                <option value="enrollment">Uang Pangkal</option>
                <option value="other">Lainnya</option>
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
                <th className="px-6 py-4">Bulan Tagihan</th>
                <th className="px-6 py-4">Jenis</th>
                <th className="px-6 py-4">Nominal</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Jatuh Tempo</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                      Memuat data tagihan...
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-red-500">
                    Gagal memuat data tagihan.
                  </td>
                </tr>
              ) : !data?.data || data.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Belum ada data tagihan SPP atau tidak ditemukan.
                  </td>
                </tr>
              ) : (
                data.data.map((invoice: TuitionInvoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{invoice.student?.name || 'Siswa tidak ditemukan'}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-gray-400" />
                        {invoice.period}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="uppercase text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                        {invoice.fee_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatCurrency(invoice.amount)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{invoice.due_date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {invoice.status === 'draft' && (
                          <button
                            onClick={() => setConfirmDialogId(invoice.id)}
                            disabled={mutation.isPending && processingId === invoice.id}
                            title="Buat Link Pembayaran"
                            className="p-1.5 text-primary hover:text-primary/80 transition-colors bg-primary/10 hover:bg-primary/20 rounded-lg disabled:opacity-50"
                          >
                            {mutation.isPending && processingId === invoice.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Plus size={16} />
                            )}
                          </button>
                        )}
                        <Link
                          to={`/invoices/${invoice.id}`}
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

      <AlertDialog open={!!confirmDialogId} onOpenChange={(open) => !open && setConfirmDialogId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Buat Link Pembayaran?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan membuat transaksi pembayaran di sistem untuk tagihan ini, dan mengalihkan Anda ke halaman detail pembayaran.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateLink} className="bg-primary text-white">Lanjutkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
