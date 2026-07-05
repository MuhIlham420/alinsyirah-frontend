import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, Clock, Printer, FileText, Link as LinkIcon } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { getInvoiceById } from '../../../features/invoices/api/getInvoiceById';
import { payInvoice } from '../../../features/invoices/api/payInvoice';
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

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoiceById(Number(id)),
  });

  const invoice = data?.data;

  const mutation = useMutation({
    mutationFn: () => payInvoice(Number(id)),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      if (res.data?.id) {
        navigate(`/payments/${res.data.id}`);
      }
    },
  });

  const handleCancelInvoice = () => {
    alert('Fungsi pembatalan tagihan akan segera hadir. Sedang dikoordinasikan dengan tim Backend.');
  };



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  if (isLoading) {
    return <div className="p-12 text-center text-gray-500">Memuat detail tagihan...</div>;
  }

  if (isError || !invoice) {
    return <div className="p-12 text-center text-red-500">Gagal memuat detail tagihan atau tagihan tidak ditemukan.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/invoices" className="p-2 bg-white rounded-full border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Detail Tagihan</h1>
          <p className="text-gray-500 mt-1">Nomor Tagihan: INV-{invoice.id.toString().padStart(6, '0')}</p>
        </div>
      </div>



      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header Invoice */}
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 text-primary flex items-center justify-center rounded-2xl">
              <FileText size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{invoice.student?.name}</h2>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                Tagihan {invoice.fee_type === 'spp' ? 'SPP' : invoice.fee_type === 'enrollment' ? 'Pangkal' : 'Lainnya'} Periode <span className="font-semibold text-gray-700">{invoice.period}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-gray-900">{formatCurrency(invoice.amount)}</div>
            <div className="mt-2">
              {invoice.status === 'paid' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <CheckCircle size={16} /> Lunas
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                  <Clock size={16} /> Belum Bayar
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Info */}
        <div className="p-8 grid md:grid-cols-2 gap-8 bg-gray-50/50">
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Informasi Tagihan</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 text-sm">
                <span className="text-gray-500">ID Siswa</span>
                <span className="font-medium text-gray-900">{invoice.student?.id || '-'}</span>
              </div>
              <div className="grid grid-cols-2 text-sm">
                <span className="text-gray-500">Bulan Periode</span>
                <span className="font-medium text-gray-900">{invoice.period}</span>
              </div>
              <div className="grid grid-cols-2 text-sm">
                <span className="text-gray-500">Jatuh Tempo</span>
                <span className="font-medium text-gray-900">{invoice.due_date}</span>
              </div>
              {invoice.paid_at && (
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-gray-500">Tanggal Bayar</span>
                  <span className="font-medium text-emerald-600">{new Date(invoice.paid_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
              {invoice.description && (
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-gray-500">Keterangan</span>
                  <span className="font-medium text-gray-900">{invoice.description}</span>
                </div>
              )}
              <div className="grid grid-cols-2 text-sm pt-4 border-t border-gray-200">
                <span className="text-gray-500">Total Nominal</span>
                <span className="font-bold text-gray-900">{formatCurrency(invoice.amount)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Aksi</h3>
            <div className="space-y-3">
              {invoice.status === 'draft' && (
                <Button 
                  onClick={() => setConfirmDialogOpen(true)} 
                  disabled={mutation.isPending}
                  className="w-full bg-primary hover:bg-primary/90 text-white gap-2 h-12 text-base rounded-xl"
                >
                  <LinkIcon size={20} />
                  {mutation.isPending ? 'Memproses...' : 'Proses Pembayaran'}
                </Button>
              )}

              <Button variant="outline" className="w-full gap-2 h-12 text-base rounded-xl border-gray-200 text-gray-700 bg-white hover:bg-gray-50">
                <Printer size={20} />
                Cetak Tagihan (Bill)
              </Button>

              {invoice.status !== 'paid' && (
                <Button 
                  variant="outline" 
                  onClick={handleCancelInvoice}
                  className="w-full gap-2 h-12 text-base rounded-xl border-red-200 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 hover:border-red-300"
                >
                  Batalkan Tagihan
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Proses Pembayaran?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan membuat transaksi pembayaran di sistem untuk tagihan ini, dan mengalihkan Anda ke halaman detail pembayaran untuk menyalin link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                mutation.mutate();
                setConfirmDialogOpen(false);
              }} 
              className="bg-primary text-white"
            >
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
