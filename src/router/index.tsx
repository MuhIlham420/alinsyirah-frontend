import { createBrowserRouter } from 'react-router';
import MainDashboardLayout from '../components/layouts/MainDashboardLayout';
import AuthLayout from '../components/layouts/AuthLayout';
import OverviewPage from '../pages/dashboard/OverviewPage';
import StudentsListPage from '../pages/dashboard/students/StudentsListPage';
import InvoicesListPage from '../pages/dashboard/invoices/InvoicesListPage';
import PaymentHistoryPage from '../pages/dashboard/payments/PaymentHistoryPage';
import LoginPage from '../pages/auth/LoginPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainDashboardLayout />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'students', element: <StudentsListPage /> },
      { path: 'invoices', element: <InvoicesListPage /> },
      { path: 'payments', element: <PaymentHistoryPage /> },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
    ],
  },
]);
