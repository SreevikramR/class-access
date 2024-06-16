import { createClient } from "@supabase/supabase-js";

const anon_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

const supabaseClient = createClient( supabaseUrl, anon_key )

export default supabaseClient