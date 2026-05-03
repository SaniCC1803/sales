import { useState, useEffect } from 'react';
import RegisterModal from './RegisterModal';
import LoginModal from './LoginModal';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [usersExist, setUsersExist] = useState<boolean | null>(null);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        credentials: 'include',
      });
      setAuth(res.ok);
    } catch {
      setAuth(false);
    }
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/users/exists`)
      .then((res) => res.json())
      .then((data) => setUsersExist(!!data.exists))
      .catch(() => setUsersExist(true));
    checkAuth();

    const onAuthChange = () => checkAuth();
    window.addEventListener('auth-change', onAuthChange);
    return () => window.removeEventListener('auth-change', onAuthChange);
  }, []);

  if (usersExist === null) return null;
  if (!usersExist) return <RegisterModal onRegistered={() => setUsersExist(true)} />;
  if (auth === null) return null;
  if (!auth) return <LoginModal onLogin={() => setAuth(true)} />;
  return children;
}
