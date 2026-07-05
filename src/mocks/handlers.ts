import { http, HttpResponse } from 'msw';

export const handlers = [
  // Auth
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      user: { id: 1, name: 'Admin', email: 'admin@alinsyirah.com', role: 'admin' },
      token: 'mock-jwt-token'
    });
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
  http.get('/api/students', () => {
    return HttpResponse.json({
      data: [
        { id: 1, nisn: '1234567890', name: 'Ahmad Budi', grade: 'X', class_name: 'X-A', parent_phone: '08123456789' },
        { id: 2, nisn: '0987654321', name: 'Siti Aminah', grade: 'XI', class_name: 'XI-B', parent_phone: '08987654321' }
      ]
    });
  }),

  // Invoices
  http.get('/api/tuition-invoices', () => {
    return HttpResponse.json({
      data: [
        { id: 1, student_id: 1, month: '2026-07', amount: 500000, status: 'unpaid', due_date: '2026-07-10', student: { id: 1, name: 'Ahmad Budi' } },
        { id: 2, student_id: 2, month: '2026-07', amount: 500000, status: 'paid', due_date: '2026-07-10', student: { id: 2, name: 'Siti Aminah' } }
      ]
    });
  }),

  // Payment Attempts
  http.get('/api/payment-attempts', () => {
    return HttpResponse.json({
      data: [
        { id: 1, invoice_id: 2, amount: 500000, status: 'success', payment_method: 'bank_transfer', created_at: '2026-07-01T10:00:00Z' }
      ]
    });
  })
];
