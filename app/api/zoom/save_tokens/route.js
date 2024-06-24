// app/api/zoom/save_tokens/route.js

import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import Cryptr from 'cryptr';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
    const token = request.headers.get('jwt');
    let teacherUUID = '';

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        teacherUUID = decoded.sub;
    } catch (err) {
        return new Response('Invalid Token', { status: 401 });
    }

    const cryptr = new Cryptr(process.env.ZOOM_ENCRYPTION_SECRET);

    const access_token = request.headers.get('access_token');
    const refresh_token = request.headers.get('refresh_token');
    const supabase_refresh = request.headers.get('supabase_refresh');
    
    const enc_access_token = cryptr.encrypt(access_token);
    const enc_refresh_token = cryptr.encrypt(refresh_token);

    const {authData, authError } = await supabase.auth.setSession({ access_token: token, refresh_token: supabase_refresh })
    if (authError) {
        return new Response(authError.message, { status: 500 });
    }

    const { data, error } = await supabase
        .from('zoom_tokens')
        .insert([
            { user_uuid: teacherUUID, access_token: enc_access_token, refresh_token: enc_refresh_token }
        ]).select();

    if (error) {
        return new Response(error.message, { status: 500 });
    }
    return new Response({ status: 200 });
}
