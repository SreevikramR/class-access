"use client"
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const Page = () => {
    const [ code, setCode ] = useState(null)
    const searchParams = useSearchParams()

    useEffect(() => {
        const code = searchParams.get('code')
        setCode(code)
    }, [])

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div>User code: {code}</div>
        </Suspense>
    )
}

export default Page