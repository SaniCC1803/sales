// fetchWithAuth.ts
// Wrapper for fetch that logs out and redirects on 401
export async function fetchWithAuth(input: RequestInfo, init?: RequestInit) {
  let token = localStorage.getItem('userToken');
  const refreshToken = localStorage.getItem('refreshToken');
  let headers = new Headers(init?.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  let response = await fetch(input, { ...init, headers });
  if (response.status === 401 && refreshToken) {
    // Try to refresh the access token
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (refreshRes.ok) {
      const data = await refreshRes.json();
      localStorage.setItem('userToken', data.token);
      token = data.token;
      headers = new Headers(init?.headers || {});
      headers.set('Authorization', `Bearer ${token}`);
      // Retry original request
      response = await fetch(input, { ...init, headers });
      if (response.status !== 401) return response;
    }
    // If refresh fails, logout
    localStorage.removeItem('userToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/';
    return Promise.reject(new Error('Unauthorized'));
  }
  return response;
}
