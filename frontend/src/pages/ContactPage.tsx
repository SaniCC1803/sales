import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

export default function ContactPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!form.email && !form.phone) {
      setError(t('contactValidation'));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(t('contactSuccess'));
        setForm({ name: '', email: '', phone: '', message: '' });
      } else {
        setError(t('contactError'));
      }
    } catch {
      setError(t('contactError'));
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-6 py-12 flex justify-center">
      <Card className="w-full max-w-lg">
        <CardContent className="p-6">
          <CardTitle className="mb-4">{t('contactUs')}</CardTitle>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="name"
              placeholder={t('name')}
              value={form.name}
              onChange={handleChange}
            />
            <Input
              name="email"
              type="email"
              placeholder={t('email')}
              value={form.email}
              onChange={handleChange}
            />
            <Input
              name="phone"
              type="tel"
              placeholder={t('phone')}
              value={form.phone}
              onChange={handleChange}
            />
            <Textarea
              name="message"
              placeholder={t('message', 'Message')}
              value={form.message}
              onChange={handleChange}
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('sending') : t('send')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
