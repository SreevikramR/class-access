"use client"
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import fetchTimeout from '@/components/util_function/fetch';
import { supabaseClient } from '@/components/util_function/supabaseCilent';

const Page = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CodeComponent />
        </Suspense>
    )
}

const CodeComponent = () => {
    const [ code, setCode ] = useState(null)
    const searchParams = useSearchParams()
    const controller = new AbortController()
	const { signal } = controller;

    useEffect(() => {
        const code = searchParams.get('code')
        setCode(code)
    }, [])

    async function handleZoomToken() {
		const redirect_uri = window.location.origin + "/oauth/zoom/callback";
		const url = new URL(`${window.location.origin}/api/zoom/access_token?code=${code}&redirect_uri=${redirect_uri}`)
		try {
			const response = await fetchTimeout(url, 5500, { signal });
			const data = await response.json();
			console.log(data)
            setCode(data)
		} catch (error) {
			if (error.name === "AbortError") {
			  console.log("request timed out")
			} else {
			  console.log("request failed")
			  console.log(error)
			}
		}
	}

    async function handleStoreZoomToken() {
        const url = new URL(`${window.location.origin}/api/zoom/save_tokens`)
        const jwt = await supabaseClient.auth.getSession().then((response) => {
            return response.data.session.access_token
        })
        const supabaseRefresh = await supabaseClient.auth.getSession().then((response) => {
            return response.data.session.refresh_token
        })
        const access_token = code.access_token
        const refresh_token = code.refresh_token
        const headers = {
            'jwt': jwt,
            'access_token': access_token,
            'refresh_token': refresh_token,
            'supabase_refresh': supabaseRefresh,
        }
        try {
            const response = await fetchTimeout(url, 5500, { method: 'POST', headers: headers, signal })
            const data = await response.json()
            console.log(data)
        } catch (error) {
            if (error.name === "AbortError") {
                console.log("request timed out")
            } else {
                console.log("request failed")
                console.log(error)
            }
        }
    }

    async function handleRetrieveZoomToken() {
        const url = new URL(`${window.location.origin}/api/zoom/retrieve_tokens`)
        const jwt = await supabaseClient.auth.getSession().then((response) => {
            return response.data.session.access_token
        })
        const supabaseRefresh = await supabaseClient.auth.getSession().then((response) => {
            return response.data.session.refresh_token
        })
        const headers = {
            'jwt': jwt,
            'supabase_refresh': supabaseRefresh,
        }
        try {
            const response = await fetchTimeout(url, 10000, { method: 'GET', headers: headers, signal })
            const data = await response.json()
            console.log(data)
        } catch (error) {
            if (error.name === "AbortError") {
                console.log("request timed out")
            } else {
                console.log("request failed")
                console.log(error)
            }
        }
    }

    return (
        <div>
            <div>User code: {JSON.stringify(code)}</div>
            <div className="cursor-pointer p-3 border-2 rounded-lg border-black" onClick={() => handleZoomToken()}>
				Test Zoom Token
			</div>
            <div className="cursor-pointer p-3 border-2 rounded-lg border-black" onClick={() => handleStoreZoomToken()}>
                Test Token Store
            </div>
            <div className="cursor-pointer p-3 border-2 rounded-lg border-black" onClick={() => handleRetrieveZoomToken()}>
                Test Token Retrieve
            </div>
        </div>
    )
}

export default Page