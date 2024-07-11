// app/api/users/delete_user/route.js

import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const token = request.headers.get('jwt');
    let user_uuid = '';

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user_uuid = decoded.sub;
    } catch (err) {
        return new Response('Invalid Token', { status: 401 });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase.auth.admin.deleteUser(user_uuid);
    if (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    } else {
        return NextResponse.json({ data: data }, { status: 200 });
    }
}
