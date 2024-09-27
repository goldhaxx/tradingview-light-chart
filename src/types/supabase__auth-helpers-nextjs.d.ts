declare module '@supabase/auth-helpers-nextjs' {
  import { SupabaseClient } from '@supabase/supabase-js'
  import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

  export function createServerComponentClient<Database = any>(
    { cookies }: { cookies: () => ReadonlyRequestCookies }
  ): SupabaseClient<Database>
}