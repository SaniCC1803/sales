import type { Language } from './application';

export type Role = 'USER' | 'SUPERADMIN';

export interface User {
  id: number;
  email: string;
  password?: string;
  role: Role;
  isConfirmed: boolean;
  applications?: Application[];
}

export interface Application {
  id: number;
  name: string;
  languages: Language[];
  ownerId?: number;
}
