import { supabaseClient } from './supabaseCilent';
import fetchTimeout from './fetch';

const createZoomMeeting = async () => {
    try {
        console.log('Attempting to create meeting...');
        const jwt = (await supabaseClient.auth.getSession()).data.session.access_token;
        const supabase_refresh = (await supabaseClient.auth.getSession()).data.session.refresh_token;

        const controller = new AbortController()
        const { signal } = controller;
        const url = new URL(`${window.location.origin}/api/zoom/create_meeting`)
        const response = await fetchTimeout(url, 10000, { signal, method: 'POST', headers: { 'jwt': jwt, 'supabase_refresh': supabase_refresh } })

        const responseJson = await response.json()
        if (responseJson.error === "Invalid access token") {
            console.log("invalid")
            const refreshResponse = await fetchTimeout(new URL(`${window.location.origin}/api/zoom/refresh_tokens`), 5500, { signal, method: 'POST', headers: { 'refresh_token': responseJson.refresh_token } })
            const refreshJson = await refreshResponse.json()
            const new_access_token = refreshJson.data.access_token
            const new_refresh_token = refreshJson.data.refresh_token
            const save_tokens_response = await fetchTimeout(new URL(`${window.location.origin}/api/zoom/save_tokens`), 5500, { signal, method: 'PUT', headers: { 'jwt': jwt, 'access_token': new_access_token, 'refresh_token': new_refresh_token, supabase_refresh: supabase_refresh } }).then(async () => {
                const url = new URL(`${window.location.origin}/api/zoom/create_meeting`)
                const response = await fetchTimeout(url, 10000, { signal, method: 'POST', headers: { 'jwt': jwt, 'supabase_refresh': supabase_refresh, access_token: new_access_token } })
                const responseJson = await response.json()
                console.log(responseJson)
                return responseJson.meetingLink
            })
        }
        return responseJson.meetingLink
    } catch (err) {
        return `ERROR`
    }
};

export default createZoomMeeting;