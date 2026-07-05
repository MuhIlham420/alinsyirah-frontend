import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, Clock, Printer, CreditCard, XCircle, FileText, Link as LinkIcon } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { getPaymentById } from '../../../features/payments/api/getPaymentById';

export default function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['payment', id],
    queryFn: () => getPaymentById(Number(id)),
  });

  const payment = data?.data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <div className="p-12 text-center text-gray-500">Memuat detail pembayaran...</div>;
  }

  if (isError || !payment) {
    return <div className="p-12 text-center text-red-500">Gagal memuat detail pembayaran.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/payments" className="p-2 bg-white rounded-full border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Detail Pembayaran</h1>
          <p className="text-gray-500 mt-1">Order ID: {payment.provider_order_id}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 flex items-center justify-center rounded-2xl ${payment.status === 'paid' ? 'bg-emerald-100 text-emerald-600' :
                payment.status === 'failed' || payment.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                  'bg-amber-100 text-amber-600'
              }`}>
              <CreditCard size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Pembayaran SPP</h2>
              <p className="text-gray-500 mt-1">Via {payment.payment_method && payment.payment_method !== '-' ? payment.payment_method.replace('_', ' ') : 'Sistem'}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-gray-900">{formatCurrency(payment.amount)}</div>
            <div className="mt-2">
              {payment.status === 'paid' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <CheckCircle size={16} /> Lunas
                </span>
              ) : payment.status === 'failed' || payment.status === 'cancelled' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-red-50 text-red-600 border border-red-200">
                  <XCircle size={16} /> Gagal
                </span>
              ) : payment.status === 'expired' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-50 text-gray-600 border border-gray-200">
                  <Clock size={16} /> Kedaluwarsa
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                  <Clock size={16} /> Belum Bayar
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 grid lg:grid-cols-3 gap-8 bg-gray-50/50">
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Rincian Tagihan Dibayar</h3>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3">No. Tagihan</th>
                      <th className="px-4 py-3">Keterangan</th>
                      <th className="px-4 py-3">Periode</th>
                      <th className="px-4 py-3 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payment.invoices && payment.invoices.length > 0 ? (
                      payment.invoices.map((inv: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <Link to={`/invoices/${inv.id}`} className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors">
                              <FileText size={14} />
                              INV-{inv.id.toString().padStart(6, '0')}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {inv.description || (inv.fee_type === 'spp' ? 'SPP' : 'Tagihan')}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {inv.period}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900 text-right">
                            {formatCurrency(inv.amount)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          Tidak ada rincian tagihan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Informasi Transaksi</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-gray-500">Siswa</span>
                  <span className="font-medium text-gray-900">{payment.student?.name || '-'}</span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-gray-500">Waktu Transaksi</span>
                  <span className="font-medium text-gray-900">{formatDate(payment.created_at)}</span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-gray-500">Metode</span>
                  <span className="font-medium text-gray-900 capitalize">{payment.payment_method && payment.payment_method !== '-' ? payment.payment_method.replace('_', ' ') : 'Menunggu Pembayaran'}</span>
                </div>
                <div className="grid grid-cols-2 text-sm pt-4 border-t border-gray-200">
                  <span className="text-gray-500">Total Nominal</span>
                  <span className="font-bold text-gray-900">{formatCurrency(payment.amount)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Aksi</h3>
              <div className="space-y-3">
                {['pending', 'creating', 'created'].includes(payment.status) && (
                  <Button
                    onClick={() => handleCopyLink((payment as any).payment_url || 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-url-123')}
                    className="w-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 gap-2 h-12 text-base rounded-xl border border-emerald-200"
                  >
                    <LinkIcon size={20} />
                    Salin Link Pembayaran
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full gap-2 h-12 text-base rounded-xl border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Printer size={20} />
                  {payment.status === 'paid' ? 'Cetak Kuitansi Resmi (PDF)' : 'Cetak Rincian Tagihan (PDF)'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
