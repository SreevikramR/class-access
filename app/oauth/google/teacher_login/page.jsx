"use client"
import React, { useEffect } from 'react'
import { supabaseClient } from '@/components/util_function/supabaseCilent';
import fetchTimeout from '@/components/util_function/fetch';

const Page = () => {
    const [status, setStatus] = React.useState('Loading...')

    useEffect(() => {
        checkUserExists()
    }, [])

    const checkUserExists = async () => {
        const jwt = (await supabaseClient.auth.getSession()).data.session.access_token
        const email = (await supabaseClient.auth.getUser()).data.user.email
        const controller = new AbortController()
        const { signal } = controller;
        const { data, error } = await supabaseClient.from('teachers').select('*').eq('email', email)
        const url = new URL(`${window.location.origin}/api/users/delete_user`)
        console.log(data, error)
        console.log(data.length === 0)
        if (data.length === 0) {
            const response = await fetchTimeout(url, 5500, { signal, headers: { 'jwt': jwt } });
            console.log(response)
            if (response.status === 200) {
                setStatus('Please Sign Up First. Redirecting to Sign Up Page in 5 seconds...')
                setTimeout(() => {
                    window.location.href = '/signup'
                }, 5000)
            }
        } else {
            window.location.href = '/dashboard'
        }
        if (error) {
            toast({
                title: 'Unable to Login',
                description: error.message,
                variant: "destructive"
            })
        }
    }

    return (
        <div className='justify-center items-center flex h-screen'>{status}</div>
    )
}

export default Page