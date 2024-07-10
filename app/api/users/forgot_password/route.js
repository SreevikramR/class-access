// app/api/users/forgot_password/route.js

import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { MailtrapClient } from 'mailtrap';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const sendResetEmail = async ({ email, link }) => {
    const TOKEN = process.env.EMAIL_TOKEN;
    const ENDPOINT = process.env.EMAIL_ENDPOINT;
    const client = new MailtrapClient({ endpoint: ENDPOINT, token: TOKEN });

    const sender = {
        email: "no-reply@classaccess.tech",
        name: "Class Access",
    };
    const recipients = [{ email: email }];

    try {
        client.send({
            from: sender,
            to: recipients,
            template_uuid: "ea535c40-6e18-4fa8-8d5a-a696fdc60c49",
            template_variables: {
                "user_email": email,
                "pass_reset_link": link
            }
        })
        return "Email sent"

    } catch (error) {
        console.log(error);
        return "Email Failed"
    }
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
        return new Response('Email failed', { status: 500 });
    }
    return new Response('Email sent', { status: 200 });
}
