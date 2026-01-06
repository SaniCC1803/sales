import { useState, useEffect } from "react";
import RegisterModal from "./RegisterModal";
import LoginModal from "./LoginModal";

function isAuthenticated() {
  return !!localStorage.getItem("userToken");
}

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [usersExist, setUsersExist] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/users")
      .then(res => res.json())
      .then(users => setUsersExist(users.length > 0))
      .catch(() => setUsersExist(true));
    setAuth(isAuthenticated());
  }, []);

  if (usersExist === null) return null;
  if (!usersExist) return <RegisterModal onRegistered={() => setUsersExist(true)} />;
  if (auth === null) return null;
  if (!auth) return <LoginModal onLogin={() => setAuth(true)} />;
  return children;
}
