'use client';

import { useEffect, useState } from 'react';

interface UserInfo {
  name: string;
  email: string;
  initials: string;
}

function getUserFromToken(): UserInfo | null {
  try {
    const token = document.cookie.split('; ').find(r => r.startsWith('auth_token='))?.split('=')[1];
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    const email: string = payload.email || payload.sub || '';
    const name: string = payload.name || payload.username || email.split('@')[0] || 'Admin';
    const initials = name.slice(0, 2).toUpperCase();
    return { name, email, initials };
  } catch {
    return null;
  }
}

export default function AdminHeader() {
  const [user, setUser] = useState<UserInfo>({ name: 'Admin', email: '', initials: 'A' });

  useEffect(() => {
    const info = getUserFromToken();
    if (info) setUser(info);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard</h2>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">{user.initials}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
