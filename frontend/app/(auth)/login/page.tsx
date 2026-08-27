'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchData } from '@/lib/api-client';
import { setToken, setUser, setTokenCookie } from '@/lib/auth';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginMutation = useMutation({
    mutationFn: async () => {
      console.log('📤 Login request:', { email, password });
      const data = await fetchData<{ token: string; user: { id: number; email: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      console.log('📥 Login response:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('💾 Menyimpan token...');
      setToken(data.token);
      setUser(data.user);
      setTokenCookie(data.token);
      console.log('✅ Token tersimpan di localStorage:', localStorage.getItem('token'));

      toast.success('Login berhasil!');

      console.log('🔄 Redirect ke dashboard...');
      router.push('/dashboard');
    },
    onError: (err: any) => {
      console.error('❌ Login error:', err);
      setError(err.message || 'Login gagal');
      toast.error(err.message || 'Login gagal');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Masuk ke akun Notes App Anda</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="masukkan email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {loginMutation.isPending && (
            <p className="text-sm text-gray-500">Loading...</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Login...' : 'Login'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Belum punya akun?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Daftar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}