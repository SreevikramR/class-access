"use client"
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation';

const page = () => {

    const searchParams = useSearchParams()
    const code = searchParams.get('code')

    return (
        <div>User code: {code}</div>
    )
}

export default page