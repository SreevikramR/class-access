"use client"
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation';

const Page = () => {
    const [ code, setCode ] = useState(null)
    const searchParams = useSearchParams()

    useEffect(() => {
        const code = searchParams.get('code')
        setCode(code)
    }, [])

    return (
        <div>User code: {code}</div>
    )
}

export default Page