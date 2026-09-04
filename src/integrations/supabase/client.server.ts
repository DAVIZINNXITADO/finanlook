import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const backendUrl = process.env.BACKEND_URL;
const backendKey = process.env.BACKEND_KEY;

if (!backendUrl || !backendKey) {
  throw new Error(
    "Missing BACKEND_URL or BACKEND_KEY",
  );
}

export const supabase = createClient<Database>(
  backendUrl,
  backendKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);