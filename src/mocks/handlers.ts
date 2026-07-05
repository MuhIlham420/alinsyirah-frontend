import { http, HttpResponse } from 'msw';

let studentsData = [
  { id: 1, nis: '1234567890', name: 'Ahmad Budi', school_class: 'X-A', parent_name: 'Budi Santoso', parent_phone: '08123456789', parent_email: 'budi@example.com', monthly_fee: 500000, status: 'active' },
  { id: 2, nis: '0987654321', name: 'Siti Aminah', school_class: 'XI-B', parent_name: 'Siti Fadilah', parent_phone: '08987654321', parent_email: 'siti@example.com', monthly_fee: 500000, status: 'active' }
];

let invoicesData: any[] = [
  { id: 1, student_id: 1, period: '2026-07', fee_type: 'spp', description: 'SPP Juli 2026', amount: 500000, status: 'draft', due_date: '2026-07-10', student: { id: 1, name: 'Ahmad Budi' }, generation_source: 'manual', created_by: 1 },
  { id: 2, student_id: 2, period: '2026-07', fee_type: 'spp', description: 'SPP Juli 2026', amount: 500000, status: 'pending_payment', payment_url: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-url-123', due_date: '2026-07-10', student: { id: 2, name: 'Siti Aminah' }, generation_source: 'scheduled', created_by: 1 },
  { id: 3, student_id: 1, period: '2026-06', fee_type: 'enrollment', description: 'Uang Pangkal', amount: 2500000, status: 'paid', paid_at: '2026-06-05T08:00:00Z', due_date: '2026-06-10', student: { id: 1, name: 'Ahmad Budi' }, generation_source: 'manual', created_by: 1 },
  { id: 4, student_id: 1, period: '2026-01', fee_type: 'spp', description: 'SPP Januari 2026', amount: 500000, status: 'paid', paid_at: '2026-01-05T08:00:00Z', due_date: '2026-01-10', student: { id: 1, name: 'Ahmad Budi' }, generation_source: 'manual', created_by: 1 },
  { id: 5, student_id: 1, period: '2026-02', fee_type: 'spp', description: 'SPP Februari 2026', amount: 500000, status: 'paid', paid_at: '2026-02-05T08:00:00Z', due_date: '2026-02-10', student: { id: 1, name: 'Ahmad Budi' }, generation_source: 'manual', created_by: 1 }
];

let paymentsData: any[] = [
  { id: 1, provider_order_id: 'TRX-000001', amount: 500000, status: 'pending', payment_method: '-', payment_url: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-url-123', student: { id: 1, name: 'Ahmad Budi' }, invoices: [invoicesData[0]], created_at: '2026-07-01T10:00:00Z' },
  { id: 2, provider_order_id: 'TRX-000002', amount: 500000, status: 'paid', payment_method: 'qris', student: { id: 2, name: 'Siti Aminah' }, invoices: [invoicesData[1]], created_at: '2026-07-02T15:30:00Z' },
  { id: 3, provider_order_id: 'TRX-000003', amount: 1500000, status: 'paid', payment_method: 'bca_va', student: { id: 1, name: 'Ahmad Budi' }, invoices: [invoicesData[0]], created_at: '2026-07-03T09:15:00Z' }
];

// AUTH STATE
let currentUser = {
  id: 1,
  name: 'Admin User',
  email: 'admin@alinsyirah.com',
  role: 'Administrator',
  joined_at: '2026-01-01'
};

export const handlers = [
  // Auth
  http.post('/api/auth/login', async ({ request }) => {
    const data = await request.clone().json() as { email?: string; password?: string };
    if (data.email === 'admin@alinsyirah.com' && data.password === 'password') {
      return HttpResponse.json({
        message: 'Login berhasil',
        token: 'mock-jwt-token-12345',
        user: currentUser
      });
    }
    return HttpResponse.json({ message: 'Email atau kata sandi salah' }, { status: 401 });
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json({ data: currentUser });
  }),
  
  http.put('/api/auth/profile', async ({ request }) => {
    const data = await request.clone().json() as { name: string; email: string };
    currentUser.name = data.name;
    currentUser.email = data.email;
    return HttpResponse.json({ message: 'Profil berhasil diperbarui', data: currentUser });
  }),
  
  http.put('/api/auth/password', async ({ request }) => {
    const data = await request.clone().json() as { current_password?: string };
    if (data.current_password !== 'password' && data.current_password !== '12345678') {
      // Just a mock check
      return HttpResponse.json({ message: 'Kata sandi saat ini salah' }, { status: 400 });
    }
    return HttpResponse.json({ message: 'Kata sandi berhasil diperbarui' });
  }),

  // Pagination & Sorting Helpers
  http.get('/dummy', () => new HttpResponse(null)), // Dummy just to use http
];

const paginate = (items: any[], url: string) => {
  const urlObj = new URL(url);
  const page = Number(urlObj.searchParams.get('page')) || 1;
  const per_page = Number(urlObj.searchParams.get('per_page')) || 10;
  const start = (page - 1) * per_page;
  const end = start + per_page;
  const total = items.length;
  const last_page = Math.ceil(total / per_page) || 1;

  return {
    data: items.slice(start, end),
    meta: {
      total,
      page,
      last_page
    }
  };
};

const sortItems = (items: any[], sortBy: string | null) => {
  if (!sortBy) return items;
  const sorted = [...items];
  switch (sortBy) {
    case 'terbaru':
      return sorted.sort((a, b) => (b.id - a.id) || 0);
    case 'terlama':
      return sorted.sort((a, b) => (a.id - b.id) || 0);
    case 'nama_az':
      return sorted.sort((a, b) => (a.name || a.student?.name || '').localeCompare(b.name || b.student?.name || ''));
    case 'nama_za':
      return sorted.sort((a, b) => (b.name || b.student?.name || '').localeCompare(a.name || a.student?.name || ''));
    default:
      return items;
  }
};

handlers.push(
  http.post('/api/auth/login', async ({ request }) => {
    try {
      // Clone request before reading to avoid stream locking issues in some MSW setups
      const body = await request.clone().json() as any;

      if (body?.email === 'admin@alinsyirah.com' && body?.password === 'password') {
        return HttpResponse.json({
          user: { id: 1, name: 'Admin', email: 'admin@alinsyirah.com', role: 'admin' },
          token: 'mock-jwt-token'
        });
      }

      return HttpResponse.json({ message: 'Email atau password salah.' }, { status: 401 });
    } catch (e) {
      console.error('Mock server error reading body:', e);
      return HttpResponse.json({ message: 'Bad request format' }, { status: 400 });
    }
  }),
  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      user: { id: 1, name: 'Admin', email: 'admin@alinsyirah.com', role: 'admin' }
    });
  }),
  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  // Students (CRUD)
  http.get('/api/students', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase() || '';
    const className = url.searchParams.get('class_name') || '';
    const sortBy = url.searchParams.get('sort');

    let filtered = studentsData;
    if (search) {
      filtered = filtered.filter(s => s.name.toLowerCase().includes(search) || s.nis.includes(search));
    }
    if (className && className !== 'Semua Kelas') {
      filtered = filtered.filter(s => s.school_class.includes(className));
    }

    filtered = sortItems(filtered, sortBy);
    return HttpResponse.json(paginate(filtered, request.url));
  }),
  http.post('/api/students', async ({ request }) => {
    const newStudent = await request.json() as any;
    newStudent.id = Math.floor(Math.random() * 1000) + 3; // Mock ID
    studentsData.push(newStudent);

    return HttpResponse.json({ data: newStudent }, { status: 201 });
  }),
  http.get('/api/students/:id', ({ params }) => {
    const id = Number(params.id);
    const student = studentsData.find(s => s.id === id);
    if (!student) {
      return HttpResponse.json({ message: 'Siswa tidak ditemukan' }, { status: 404 });
    }
    return HttpResponse.json({ data: student });
  }),
  http.put('/api/students/:id', async ({ request, params }) => {
    const { id } = params;
    const body = await request.json() as any;
    const index = studentsData.findIndex(s => s.id === Number(id));

    if (index !== -1) {
      studentsData[index] = { ...studentsData[index], ...body };
      return HttpResponse.json({ data: studentsData[index] });
    }
    return HttpResponse.json({ message: 'Siswa tidak ditemukan' }, { status: 404 });
  }),
  http.delete('/api/students/:id', ({ params }) => {
    const { id } = params;
    studentsData = studentsData.filter(s => s.id !== Number(id));
    return new HttpResponse(null, { status: 204 });
  }),

  // Invoices (Tuition)
  http.get('/api/tuition-invoices', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase() || '';
    const status = url.searchParams.get('status') || '';
    const feeType = url.searchParams.get('fee_type') || '';
    const studentId = url.searchParams.get('student_id') || '';
    const sortBy = url.searchParams.get('sort');

    let filtered = invoicesData;
    if (studentId) {
      filtered = filtered.filter(i => i.student_id === Number(studentId));
    }
    if (search) {
      filtered = filtered.filter(i => (i.student?.name || '').toLowerCase().includes(search) || i.period.includes(search));
    }
    if (status && status !== 'Semua Status') {
      const dbStatus = status === 'Lunas' ? 'paid' : (status === 'Belum Bayar' ? 'pending_payment' : status);
      filtered = filtered.filter(i => i.status === dbStatus);
    }
    if (feeType && feeType !== 'Semua Jenis') {
      filtered = filtered.filter(i => i.fee_type === feeType);
    }

    filtered = sortItems(filtered, sortBy);
    return HttpResponse.json(paginate(filtered, request.url));
  }),

  http.post('/api/tuition-invoices', async ({ request }) => {
    try {
      const data = await request.clone().json() as Record<string, any>;
      const studentId = Number(data.student_id);
      const student = studentsData.find(s => s.id === studentId);

      const newInvoice = {
        id: invoicesData.length > 0 ? Math.max(...invoicesData.map(i => i.id)) + 1 : 1,
        student_id: studentId,
        period: data.period,
        fee_type: data.fee_type || 'spp',
        description: data.description || '',
        amount: Number(data.amount),
        status: 'draft',
        due_date: data.due_date,
        generation_source: 'manual',
        created_by: 1,
        student: student ? { id: student.id, name: student.name } : undefined,
      };

      invoicesData.push(newInvoice);
      return HttpResponse.json({ data: newInvoice }, { status: 201 });
    } catch (error) {
      return HttpResponse.json({ message: 'Invalid data' }, { status: 400 });
    }
  }),

  http.get('/api/tuition-invoices/:id', ({ params }) => {
    const id = Number(params.id);
    const invoice = invoicesData.find(i => i.id === id);
    if (!invoice) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    return HttpResponse.json({ data: invoice });
  }),

  http.post('/api/tuition-invoices/:id/pay', ({ params }) => {
    const id = Number(params.id);
    const invoice = invoicesData.find(i => i.id === id);
    if (!invoice) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }

    // Mutate state to pending_payment and generate a mock payment_url
    invoice.status = 'pending_payment';
    invoice.payment_url = 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-url-' + Math.random().toString(36).substring(7);

    // Simulate creating a payment attempt
    const newPaymentId = Math.floor(Math.random() * 1000) + 100;

    const paymentObj = {
      id: newPaymentId,
      provider_order_id: `TRX-${newPaymentId.toString().padStart(6, '0')}`,
      amount: invoice.amount,
      status: 'pending',
      payment_method: '-',
      payment_url: invoice.payment_url,
      student: invoice.student,
      invoices: [invoice],
      created_at: new Date().toISOString()
    };
    paymentsData.push(paymentObj);

    return HttpResponse.json({
      message: 'Pembayaran berhasil diproses',
      data: paymentObj
    });
  }),

  // Payment Attempts
  http.get('/api/payment-attempts', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase() || '';
    const status = url.searchParams.get('status') || '';
    const paymentMethod = url.searchParams.get('payment_method') || '';
    const sortBy = url.searchParams.get('sort');

    let filtered = paymentsData;
    if (search) {
      filtered = filtered.filter(p => p.provider_order_id.toLowerCase().includes(search));
    }
    if (status && status !== 'Semua Transaksi') {
      const dbStatus = status === 'Lunas' ? 'paid' : (status === 'Gagal' ? 'failed' : status === 'Kedaluwarsa' ? 'expired' : status === 'Belum Bayar' ? 'pending' : status);
      filtered = filtered.filter(p => p.status === dbStatus);
    }
    if (paymentMethod && paymentMethod !== 'Semua Metode') {
      filtered = filtered.filter(p => p.payment_method === paymentMethod);
    }

    filtered = sortItems(filtered, sortBy);
    return HttpResponse.json(paginate(filtered, request.url));
  }),

  http.get('/api/payment-attempts/:id', ({ params }) => {
    const id = Number(params.id);
    const payment = paymentsData.find(p => p.id === id);
    if (!payment) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    return HttpResponse.json({ data: payment });
  }),

  // Annual Prepayments
  http.post('/api/annual-prepayments', async ({ request }) => {
    try {
      const data = await request.clone().json() as Record<string, any>;

      const newPaymentId = Math.floor(Math.random() * 1000) + 200;
      const studentId = Number(data.student_id);
      const student = studentsData.find(s => s.id === studentId);
      const discount = data.discount_amount || 0;
      const amount = (student ? student.monthly_fee * 12 : 6000000) - discount;

      const newInvoices = Array.from({ length: 12 }, (_, i) => ({
        id: Math.floor(Math.random() * 10000) + 1000,
        student_id: studentId,
        period: `${data.year}-${(i + 1).toString().padStart(2, '0')}`,
        fee_type: 'spp',
        description: `SPP Bulan ${(i + 1).toString().padStart(2, '0')} ${data.year}`,
        amount: student ? student.monthly_fee : 500000,
        status: 'pending_payment',
        due_date: `${data.year}-${(i + 1).toString().padStart(2, '0')}-10`,
        student: student,
        generation_source: 'annual_prepayment',
        created_by: 1
      }));

      invoicesData.push(...newInvoices);

      const paymentObj = {
        id: newPaymentId,
        provider_order_id: `TRX-${newPaymentId.toString().padStart(6, '0')}`,
        amount: amount,
        status: 'pending',
        payment_method: '-',
        payment_url: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-annual-123',
        student: student,
        invoices: newInvoices,
        created_at: new Date().toISOString()
      };

      paymentsData.push(paymentObj);

      return HttpResponse.json({
        message: 'Pembayaran tahunan berhasil dicatat',
        data: paymentObj
      }, { status: 201 });
    } catch (error) {
      return HttpResponse.json({ message: 'Invalid data' }, { status: 400 });
    }
  })
);
