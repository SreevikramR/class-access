// app/api/zoom/retrieve_tokens/route.js

import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import Cryptr from 'cryptr';
import { NextResponse } from 'next/server';

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
        return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
    }

    
    const supabase_refresh = request.headers.get('supabase_refresh');
    const { authData, authError } = await supabase.auth.setSession({ access_token: token, refresh_token: supabase_refresh })
    if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 401 });
    }
    const { data, error } = await supabase.from('zoom_tokens').select("*").eq("user_uuid", teacherUUID)
    
    const cryptr = new Cryptr(process.env.ZOOM_ENCRYPTION_SECRET);
    const decrypted_access = cryptr.decrypt(data[0].access_token)
    const decrypted_refresh = cryptr.decrypt(data[0].refresh_token)

    data[0].access_token = decrypted_access
    data[0].refresh_token = decrypted_refresh

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ data: data }, { status: 200 });
}
