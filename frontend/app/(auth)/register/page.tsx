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

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (password !== confirmPassword) {
        throw new Error('Password tidak sama');
      }
      if (password.length < 8) {
        throw new Error('Password minimal 8 karakter');
      }
      const data = await fetchData('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      return data;
    },
    onSuccess: () => {
      router.push('/login?registered=true');
    },
    onError: (err: any) => {
      setError(err.message || 'Registrasi gagal');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    registerMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Daftar</CardTitle>
        <CardDescription>Buat akun Notes App baru</CardDescription>
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
            <Label htmlFor="password">Password (min 8 karakter)</Label>
            <Input
              id="password"
              type="password"
              placeholder="masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="ulangi password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {registerMutation.isPending && <p className="text-sm text-gray-500">Loading...</p>}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? 'Mendaftar...' : 'Daftar'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}