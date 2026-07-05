import { createBrowserRouter } from 'react-router';
import MainDashboardLayout from '../components/layouts/MainDashboardLayout';
import AuthLayout from '../components/layouts/AuthLayout';
import OverviewPage from '../pages/dashboard/OverviewPage';
import StudentsListPage from '../pages/dashboard/students/StudentsListPage';
import StudentDetailPage from '../pages/dashboard/students/StudentDetailPage';
import InvoicesListPage from '../pages/dashboard/invoices/InvoicesListPage';
import InvoiceDetailPage from '../pages/dashboard/invoices/InvoiceDetailPage';
import PaymentHistoryPage from '../pages/dashboard/payments/PaymentHistoryPage';
import PaymentDetailPage from '../pages/dashboard/payments/PaymentDetailPage';
import AnnualPrepaymentPage from '../pages/dashboard/payments/AnnualPrepaymentPage';
import ProfilePage from '../pages/dashboard/ProfilePage';
import LoginPage from '../pages/auth/LoginPage';
import NotFoundPage from '../pages/errors/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainDashboardLayout />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'students', element: <StudentsListPage /> },
      { path: 'students/:id', element: <StudentDetailPage /> },
      { path: 'invoices', element: <InvoicesListPage /> },
      { path: 'invoices/:id', element: <InvoiceDetailPage /> },
      { path: 'payments', element: <PaymentHistoryPage /> },
      { path: 'payments/:id', element: <PaymentDetailPage /> },
      { path: 'annual-prepayment', element: <AnnualPrepaymentPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
]);
