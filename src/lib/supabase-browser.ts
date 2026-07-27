// Adapter Supabase phía BROWSER (Client Components). Dùng anon key → RLS bảo vệ.
// Tách khỏi supabase.ts vì file kia import 'next/headers' (chỉ chạy server).
import { createBrowserClient } from '@supabase/ssr'

export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
