// app/api/users/forgot_password/route.js

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const sendResetEmail = async ({ email, link }) => {
    const controller = new AbortController()
    const { signal } = controller;

    const data = {
        "sender": {
            "email": "no-reply@classaccess.tech",
            "name": "Class Access"
        },
        "templateId": 3,
        "params": {
            "url": link,
            "email": email,
        },
        "to": [
            {
                "email": email,
                "name": email
            }
        ],
    }

    const response = await fetchTimeout(`https://api.brevo.com/v3/smtp/email`, 2000, {
        signal,
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'api-key': process.env.EMAIL_TOKEN,
        },
        'body': JSON.stringify(data),
    })

    if (response.status !== 201) {
        console.log("Error Sending Email Welcome Email");
        console.log(await response.json());
        return "Email Failed"
    }
    return "Email Sent"
}

export async function POST(request) {
    const email = request.headers.get('email');

    const { data, error } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
            redirectTo: 'https://classaccess.tech/reset-password',
        }
    })

    const result = await sendResetEmail({ email, link: data.properties.action_link });
    console.log(result);
    if (error) {
        return NextResponse.json({ error: 'Email Failed' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Email Sent' }, { status: 200 });
}
