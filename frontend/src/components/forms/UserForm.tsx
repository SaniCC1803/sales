'use client';

import { useForm, Controller } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select as NativeSelect } from '@/components/ui/select-native';
import { Label } from '@/components/ui/label';
import { ErrorMessage } from '@hookform/error-message';
import { Eye, EyeOff } from 'lucide-react';
import type { User } from '@/types/user';
import { getUserDefaultValues } from './utils';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { t } from 'i18next';

export type UserFormValues = {
  email: string;
  password: string;
  role: 'USER' | 'SUPERADMIN';
};

interface UserFormProps {
  editUser?: User | null;
  onCreated?: () => void;
  onEditComplete?: () => void;
  closeDrawer: () => void;
  formId?: string;
}

export default function UserForm({
  editUser,
  onCreated,
  onEditComplete,
  closeDrawer,
  formId = 'user-form',
}: UserFormProps) {
  const isEditMode = !!editUser;
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    defaultValues: getUserDefaultValues(editUser),
  });

  useEffect(() => {
    if (editUser) {
      reset(getUserDefaultValues(editUser));
    }
  }, [editUser, reset]);

  const onSubmit = async (data: UserFormValues) => {
    try {
      let res: Response;

      if (isEditMode) {
        res = await fetchWithAuth(`http://localhost:3000/users/${editUser?.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else {
        res = await fetchWithAuth('http://localhost:3000/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }

      if (!res.ok) throw new Error('Failed to save user');

      if (isEditMode) onEditComplete?.();
      else onCreated?.();

      closeDrawer();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-1">
      <div className="flex-1 flex flex-col gap-4">
        {/* Email */}
        <Label>{t('email')}</Label>
        <Controller
          name="email"
          control={control}
          rules={{
            required: t('emailRequired'),
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: t('emailInvalid'),
            },
          }}
          render={({ field }) => (
            <div className="flex flex-col gap-0.5">
              <Input
                {...field}
                type="email"
                placeholder={t('emailRequired')}
                disabled={isEditMode}
              />
              <ErrorMessage
                errors={errors}
                name="email"
                render={({ message }) => <p className="text-destructive text-sm mt-1">{message}</p>}
              />
            </div>
          )}
        />

        {/* Password */}
        <Label>{t('password')}</Label>
        <Controller
          name="password"
          control={control}
          rules={{
            required: !isEditMode ? t('passwordRequired') : false,
            minLength: { value: 6, message: t('passwordMinLength') },
          }}
          render={({ field }) => (
            <div className="relative flex flex-col gap-0.5">
              <div className="flex items-center">
                <Input
                  {...field}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('password')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-transparent hover:bg-transparent focus:bg-transparent pointer-events-auto"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <ErrorMessage
                errors={errors}
                name="password"
                render={({ message }) => <p className="text-destructive text-sm mt-1">{message}</p>}
              />
            </div>
          )}
        />

        {/* Role */}
        <Label>{t('role')}</Label>
        <Controller
          name="role"
          control={control}
          rules={{ required: t('roleRequired') }}
          render={({ field }) => (
            <>
              <NativeSelect value={field.value} onChange={field.onChange} disabled={field.disabled}>
                <option value="SUPERADMIN">{t('superadmin')}</option>
                <option value="USER">{t('user')}</option>
              </NativeSelect>
              <ErrorMessage
                errors={errors}
                name="role"
                render={({ message }) => <p className="text-destructive text-sm mt-1">{message}</p>}
              />
            </>
          )}
        />
      </div>

      <Button type="submit" className="mt-4 self-end">
        {isEditMode ? t('save') : t('create')}
      </Button>
    </form>
  );
}
