function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

export function getAccessSecret(): string {
  return requireEnv('JWT_SECRET');
}

export function getRefreshSecret(): string {
  return requireEnv('JWT_REFRESH_SECRET');
}
