// app/api/users/reset_password/route.js

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
    const jwt = request.headers.get('jwt');
    const refresh_token = request.headers.get('refresh_token');
    const password = request.headers.get('password');

    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({ access_token: jwt, refresh_token: refresh_token });
    if (sessionError) {
        return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
    }

    const { data: data1, error: error2 } = await supabase.auth.updateUser({
        password: password
    });
    if (error2) {
        return NextResponse.json({ error: 'Error updating user' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Email Sent' }, { status: 200 });
}
