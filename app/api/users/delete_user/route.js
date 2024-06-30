// app/api/users/delete-student/route.js

import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

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
        return new Response(JSON.stringify(error), { status: 500 });
    } else {
        return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' }, status: 200 });
    }
}
