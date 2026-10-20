import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const cloudEnabled = () => process.env.ARENA_BACKEND === "supabase";
export function cloudConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || new URL(url).hostname !== "abtzrovcsomghbuwdmrr.supabase.co") {
    throw new Error("ONLINE_CONFIGURATION_REQUIRED");
  }
  return { url, key };
}
// Never share a request's authenticated client across Vercel invocations.
export async function playerClient() {
  const { url, key } = cloudConfig(), jar = await cookies();
  return createServerClient(url, key, {
    cookieOptions: { secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" },
    cookies: { getAll: () => jar.getAll(), setAll: (items) => {
      for (const { name, value, options } of items) jar.set(name, value, options);
    } },
  });
}
export function trustedClient() {
  const { url } = cloudConfig(), secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw new Error("ONLINE_CONFIGURATION_REQUIRED");
  return createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
}
