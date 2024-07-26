// app/api/users/new_invoice/route.js

import { NextResponse } from 'next/server';
import fetchTimeout from '@/components/util_function/fetch';
import verifyJWT from '@/components/util_function/verifyJWT';

export async function POST(request) {
    const token = request.headers.get("jwt");
    const decodedJWT = verifyJWT(token);
    if (!decodedJWT) {
        return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
    }

    const email = request.headers.get('email');
    const teacherEmail = request.headers.get('teacherEmail');
    const invoiceDate = request.headers.get('invoice_date');
    const amount = request.headers.get('amount');
    const teacherName = request.headers.get('teacherName');
    const title = request.headers.get('title');
    const description = request.headers.get('description');
    const classes = request.headers.get('classes');

    const controller = new AbortController()
    const { signal } = controller;

    const data = {
        "sender": {
            "email": "no-reply@classaccess.tech",
            "name": "Class Access"
        },
        "templateId": 5,
        "params": {
            "teacher_name": teacherName,
            "invoice_date": invoiceDate,
            "title": title,
            "description": description,
            "amount": amount,
            "qty": classes,
            "total": amount
        },
        "to": [
            {
                "email": email,
                "name": email
            }
        ],
        "cc": [
            {
                "email": teacherEmail,
                "name": teacherName
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
        return NextResponse.json({ error: 'Email Failed' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Email Sent' }, { status: 200 });
}
