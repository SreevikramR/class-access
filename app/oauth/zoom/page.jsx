"use client"
import React from 'react'
import { useSearchParams } from 'next/navigation';

const page = () => {
    const code = useSearchParams().get('code')

    return (
        <div>User code: {code}</div>
    )
}

export default page