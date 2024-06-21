// app/api/zoom/access_token/route.js

import QueryString from 'qs';
import axios from 'axios';

export async function GET(request) {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const redirect_uri = url.searchParams.get('redirect_uri');

    const client_id = process.env.ZOOM_CLIENT_ID;
    const client_secret = process.env.ZOOM_CLIENT_SECRET;
    const base64encodedString = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

    const data = QueryString.stringify({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code',
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
        return new Response(JSON.stringify(response.data), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify(error.response.data), {
            headers: { 'Content-Type': 'application/json' },
            status: error.response.status,
        });
    }
}
