// app/api/zoom/retrieve_tokens/route.js

import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import Cryptr from 'cryptr';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request) {
    const token = request.headers.get('jwt');
    let teacherUUID = '';

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        teacherUUID = decoded.sub;
    } catch (err) {
        return new Response('Invalid Token', { status: 401 });
    }

    
    const supabase_refresh = request.headers.get('supabase_refresh');
    const { authData, authError } = await supabase.auth.setSession({ access_token: token, refresh_token: supabase_refresh })
    if (authError) {
        return new Response(authError.message, { status: 401 });
    }
    const { data, error } = await supabase.from('zoom_tokens').select("*").eq("user_uuid", teacherUUID)
    
    const cryptr = new Cryptr(process.env.ZOOM_ENCRYPTION_SECRET);
    const decrypted_access = cryptr.decrypt(data[0].access_token)
    const decrypted_refresh = cryptr.decrypt(data[0].refresh_token)

    data[0].access_token = decrypted_access
    data[0].refresh_token = decrypted_refresh

    if (error) {
        return new Response(error.message, { status: 400 });
    }
    return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    }); 
}
