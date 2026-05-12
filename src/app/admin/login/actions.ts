'use server';

import { cookies } from 'next/headers';

export async function adminLogin(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

  console.log('Server Action - API URL:', apiUrl);
  console.log('Server Action - Email:', email);

  try {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Server Action - Login failed:', errorData);
      return { success: false, error: errorData.message || 'Login failed' };
    }

    const data = await response.json();
    console.log('Server Action - Login response received, token length:', data.access_token?.length);

    // Validate token has admin role
    const tokenPayload = JSON.parse(atob(data.access_token.split('.')[1]));
    console.log('Server Action - Token payload:', tokenPayload);

    if (tokenPayload.role !== 'admin') {
      console.error('Server Action - Role check failed. Expected admin, got:', tokenPayload.role);
      return { success: false, error: 'Access denied. Admin role required.' };
    }

    // Set cookies on the server
    const cookieStore = await cookies();
    cookieStore.set('auth_token', data.access_token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600,
      path: '/',
    });

    cookieStore.set('user_role', tokenPayload.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600,
      path: '/',
    });

    console.log('Server Action - Cookies set successfully');
    return { success: true };
  } catch (error) {
    console.error('Server Action - Login error:', error);
    return { success: false, error: 'Invalid email or password' };
  }
}