import { createClient } from "@supabase/supabase-js";

// One shared client prevents duplicate auth listeners and conflicting sessions.
export const db = createClient(
  "https://kxuszpixwfecawdeqkrx.supabase.co",
  "sb_publishable__auyhjNpepXiYdGV5HEJ_A_AGsPbBuS",
);
