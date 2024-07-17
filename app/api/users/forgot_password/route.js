// app/api/users/forgot_password/route.js

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const sendResetEmail = async ({ email, link }) => {
    const mailerSend = new MailerSend({
        apiKey: process.env.EMAIL_TOKEN,
    });
    const sentFrom = new Sender("no-reply@classaccess.tech", "Class Access");
    const recipients = [
        new Recipient(email, email)
    ];
    const personalization = [
        {
            email: email,
            data: {
                url: link,
                user_email: email
            },
        }
    ];
    const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setReplyTo(sentFrom)
        .setSubject(`Password Recovery Link`)
        .setPersonalization(personalization)
        .setTemplateId('zr6ke4nmw2egon12');

    try {
        await mailerSend.email.send(emailParams);
    } catch (error) {
        console.log("Error Sending Forgot Password Email");
        console.log(error);
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
