import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export default function LoginModal({ onLogin }: { onLogin: () => void }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error(t('error') || 'Login failed');
      const data = await res.json();
      localStorage.setItem('userToken', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      onLogin();
    } catch (err: any) {
      setError(err.message || t('error') || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        onSubmit={handleLogin}
        className="bg-background p-6 rounded shadow w-full max-w-sm flex flex-col gap-4"
      >
        <h2 className="text-lg font-semibold mb-2">{t('signIn')}</h2>
        <Input
          type="email"
          placeholder={t('email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder={t('password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-destructive text-sm">{error}</div>}
        <Button type="submit" disabled={loading}>
          {loading ? t('loading') || 'Logging in...' : t('signIn')}
        </Button>
      </form>
    </div>
  );
}
