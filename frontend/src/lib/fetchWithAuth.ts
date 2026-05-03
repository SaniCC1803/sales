// fetchWithAuth.ts
// Sends cookie-bound auth credentials, attempts a single /auth/refresh on 401, and
// signals logout (clearing client state) on persistent failure.
export async function fetchWithAuth(input: RequestInfo, init?: RequestInit) {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const send = () => fetch(input, { ...init, credentials: 'include' });

  let response = await send();
  if (response.status === 401) {
    const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (refreshRes.ok) {
      response = await send();
      if (response.status !== 401) return response;
    }
    window.dispatchEvent(new Event('auth-change'));
    window.location.href = '/';
    return Promise.reject(new Error('Unauthorized'));
  }
  return response;
}
