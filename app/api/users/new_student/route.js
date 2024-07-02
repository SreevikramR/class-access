// app/api/users/new-student/route.js

import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

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

    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    const classes = url.searchParams.get('classes');
    const notes = url.searchParams.get('notes');

    const { data, error } = await supabase.from('students').select('*').eq('email', email);
    if (data.length === 0) {
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: email,
            password: process.env.DEFAULT_PASSWORD,
        });

        if (signupError) {
            return new Response(JSON.stringify(signupError), { status: 500 });
        }

        let classes_jsonb = {};
        classes_jsonb[teacherUUID] = classes;
        let notes_jsonb = {};
        notes_jsonb[teacherUUID] = notes;
        let status_jsonb = {};
        status_jsonb[teacherUUID] = 'Pending';

        const { data: insertData, error: insertError } = await supabase.from('students').insert([
            {
                email: email,
                classes_left: classes_jsonb,
                notes: notes_jsonb,
                teachers: [teacherUUID],
                status: status_jsonb,
            },
        ]).select();

        if (insertError) {
            return new Response(JSON.stringify(insertError), { status: 500 });
        } else {
            return new Response(JSON.stringify(insertData), { headers: { 'Content-Type': 'application/json' } });
        }
    } else {
        return new Response('User already exists', { status: 409 });
    }
}
