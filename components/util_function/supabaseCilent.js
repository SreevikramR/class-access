import { createClient } from "@supabase/supabase-js";

const anon_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

const supabaseClient = createClient( supabaseUrl, anon_key )

export const fetchStudentList = async (teacherUUID) => {
    let { data, error } = await supabaseClient.from("students").select("*").contains("teachers",[teacherUUID])
    if (error) {
        console.log(error)
        return []
    }
    return data
}

export default supabaseClient
