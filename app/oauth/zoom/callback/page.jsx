"use client"
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import fetchTimeout from '@/components/util_function/fetch';

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

    return (
        <div>
            <div>User code: {JSON.stringify(code)}</div>
            <div className="cursor-pointer p-3 border-2 rounded-lg border-black" onClick={() => handleZoomToken()}>
				Test Zoom Token
			</div>
        </div>
    )
}

export default Page