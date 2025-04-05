declare module '@supabase/ssr' {
  import { SupabaseClient } from '@supabase/supabase-js';

  export interface CookieOptions {
    domain?: string;
    path?: string;
    expires?: Date;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    maxAge?: number;
  }

  export interface SupabaseCookieOptions {
    get: (name: string) => string | undefined;
    set: (name: string, value: string, options: CookieOptions) => void;
    remove: (name: string, options: CookieOptions) => void;
  }

  export function createServerClient(
    supabaseUrl: string,
    supabaseKey: string,
    options: {
      cookies: {
        get: (name: string) => string | undefined;
        set: (name: string, value: string, options: CookieOptions) => void;
        remove: (name: string, options: CookieOptions) => void;
      }
    }
  ): SupabaseClient;

  export function createBrowserClient(
    supabaseUrl: string,
    supabaseKey: string,
    options?: {
      auth?: {
        persistSession?: boolean;
        autoRefreshToken?: boolean;
      }
    }
  ): SupabaseClient;
}
