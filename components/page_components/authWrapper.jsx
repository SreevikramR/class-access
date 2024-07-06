"use client"
import React, { useEffect, useState } from 'react'
import { supabaseClient } from '../util_function/supabaseCilent'

const AuthWrapper = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        fetchUser()
    }, [])

    const fetchUser = async () => {
        const user = await supabaseClient.auth.getUser();
        if (user.data.user == null) {
            window.location.pathname = '/login'
        } else {
            setIsLoggedIn(true)
        }
    }

    return (
        <>
            {isLoggedIn ? children : <div className='flex items-center h-screen justify-center'>Please wait, Loading...</div>}
        </>
    )
}

export default AuthWrapper