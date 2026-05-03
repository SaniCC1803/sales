import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Status = 'pending' | 'success' | 'error';

export default function ConfirmPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<Status>('pending');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage(t('invalidConfirmationLink', 'Invalid confirmation link.'));
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/confirm?token=${encodeURIComponent(token)}`,
          { redirect: 'manual' },
        );
        // Backend returns 200 (or redirect) on success, 4xx on failure.
        if (res.ok || res.type === 'opaqueredirect') {
          setStatus('success');
          setMessage(t('emailConfirmed', 'Email confirmed! You can now log in.'));
        } else {
          const text = await res.text();
          setStatus('error');
          setMessage(text || t('confirmationFailed', 'Confirmation failed.'));
        }
      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Confirmation failed');
      }
    })();
  }, [token, t]);

  return (
    <div className="container mx-auto px-6 py-16 flex justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
          <CardTitle>{t('confirmEmail', 'Confirm email')}</CardTitle>
          {status === 'pending' && <Loader2 className="size-8 animate-spin text-primary" />}
          {status === 'success' && (
            <>
              <p className="text-sm text-muted-foreground">{message}</p>
              <Button asChild>
                <Link to="/admin">{t('signIn', 'Sign in')}</Link>
              </Button>
            </>
          )}
          {status === 'error' && (
            <>
              <p className="text-sm text-destructive">{message}</p>
              <Button asChild variant="outline">
                <Link to="/">{t('backHome', 'Back to home')}</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
