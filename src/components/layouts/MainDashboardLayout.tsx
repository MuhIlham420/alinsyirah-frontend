import React from 'react';
import { Outlet, Link } from 'react-router';

export default function MainDashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Placeholder */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-primary">Al-Insyirah</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="block p-2 rounded hover:bg-gray-100">Dashboard</Link>
          <Link to="/students" className="block p-2 rounded hover:bg-gray-100">Students</Link>
          <Link to="/invoices" className="block p-2 rounded hover:bg-gray-100">Invoices</Link>
          <Link to="/payments" className="block p-2 rounded hover:bg-gray-100">Payments</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 p-4 flex justify-end">
          <div className="text-sm text-gray-600">Admin User</div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
