// app/api/zoom/refresh_token/route.js

import QueryString from 'qs';
import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const refresh_token = request.headers.get('refresh_token');

    const client_id = process.env.ZOOM_CLIENT_ID;
    const client_secret = process.env.ZOOM_CLIENT_SECRET;
    const base64encodedString = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

    const data = QueryString.stringify({
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
    });

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://zoom.us/oauth/token',
        headers: {
            Authorization: `Basic ${base64encodedString}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 5000,
        data: data,
    };

    try {
        const response = await axios.request(config);
        return NextResponse.json({data: response.data, status: 200});
    } catch (error) {
        return new Response(JSON.stringify(error.response.data), {
            headers: { 'Content-Type': 'application/json' },
            status: error.response.status,
        });
    }
}
