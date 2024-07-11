// app/api/users/new-student/route.js

import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { MailtrapClient } from 'mailtrap';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const sendWelcomeEmail = async ({ jwt, teacherName, refresh_token, email }) => {
    const TOKEN = process.env.EMAIL_TOKEN;
    const ENDPOINT = process.env.EMAIL_ENDPOINT;
    const client = new MailtrapClient({ endpoint: ENDPOINT, token: TOKEN });

    const link = `https://classaccess.tech/activate#jwt=${jwt}&refresh_token=${refresh_token}`;
    const sender = {
        email: "no-reply@classaccess.tech",
        name: "Class Access",
    };
    const recipients = [{ email: email }];

    try {
        client.send({
            from: sender,
            to: recipients,
            template_uuid: "b4adc5e7-c8c3-4b1d-9bbf-556cd1cc7a00",
            template_variables: {
                "teacher_name": teacherName,
                "activation_link": link
            }
        })

        return "Email sent"
    } catch (error) {
        console.log(error);
        return "Email Failed"
    }
}

export async function POST(request) {
    const token = request.headers.get('jwt');
    const refresh_token = request.headers.get('refresh_token');
    let teacherUUID = '';

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        teacherUUID = decoded.sub;
    } catch (err) {
        return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
    }

    const { sessionData, sessionError } = await supabase.auth.setSession({jwt, refresh_token});
    if (sessionError) {
        return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
    }

    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    const notes = url.searchParams.get('notes');
    const teacher_fname = url.searchParams.get('teacher_fname');
    const teacher_lname = url.searchParams.get('teacher_lname');

    const { data, error } = await supabase.from('students').select('*').eq('email', email);
    const { error: signoutError } = await supabase.auth.signOut();
    if (signoutError) {
        console.log(signoutError)
        return NextResponse.json({ error: signoutError }, { status: 500 });
    }
    if (data.length === 0) {
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: email,
            password: process.env.DEFAULT_PASSWORD,
        });
        if (signupError) {
            console.log(signupError);
            return NextResponse.json({ error: signupError }, { status: 500 });
        }

        const jwt = signupData.session.access_token;
        const refresh_token = signupData.session.refresh_token;

        const emailResponse = await sendWelcomeEmail({ jwt: jwt, refresh_token: refresh_token, teacherName: `${teacher_fname} ${teacher_lname}`, email: email})
        if (emailResponse === "Email Failed") {
            console.log('Failed to send email');
            return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
        }

        let notes_jsonb = {};
        notes_jsonb[teacherUUID] = notes;

        const { data: insertData, error: insertError } = await supabase.from('students').insert([
            {
                email: email,
                notes: notes_jsonb,
            },
        ]).select();

        if (insertError) {
            console.log(insertError);
            return NextResponse.json({ error: insertError }, { status: 500 });
        } else {
            return NextResponse.json({ data: insertData }, { status: 200 });
        }
    } else {
        return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }
}
