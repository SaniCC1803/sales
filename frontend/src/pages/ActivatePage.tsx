import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ActivatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="container mx-auto px-6 py-16 flex justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center text-destructive">
            {t('invalidActivationLink', 'Invalid activation link.')}
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError(t('passwordMinLength', 'Password must be at least 6 characters.'));
      return;
    }
    if (password !== confirm) {
      setError(t('passwordMismatch', 'Passwords do not match.'));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/activate`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || t('activationFailed', 'Activation failed.'));
      }
      setSuccess(true);
      setTimeout(() => navigate('/admin'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Activation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-16 flex justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <CardTitle className="mb-4">{t('activateAccount', 'Activate your account')}</CardTitle>
          {success ? (
            <p className="text-sm text-muted-foreground">
              {t('activationSuccess', 'Your account has been activated. Redirecting...')}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                {t('chooseYourPassword', 'Choose a password to finish setting up your account.')}
              </p>
              <Input
                type="password"
                placeholder={t('password', 'Password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <Input
                type="password"
                placeholder={t('confirmPassword', 'Confirm password')}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
              />
              {error && <div className="text-destructive text-sm">{error}</div>}
              <Button type="submit" disabled={loading}>
                {loading ? t('activating', 'Activating...') : t('activate', 'Activate')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
