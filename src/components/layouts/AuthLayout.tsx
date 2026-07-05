import React from 'react';
import { Outlet } from 'react-router';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
