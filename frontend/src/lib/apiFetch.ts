export async function apiFetch<T = any>(path: string, options?: RequestInit): Promise<{ data: T | null; error: string | null }> {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`;
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const errorText = await res.text();
      return { data: null, error: errorText || res.statusText };
    }
    const data = await res.json();
    return { data, error: null };
  } catch (e: any) {
    return { data: null, error: e.message || 'Unknown error' };
  }
}
