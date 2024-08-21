"use client"
import React, { useEffect, useState } from 'react'
import { supabaseClient } from '@/components/util_function/supabaseCilent';
import fetchTimeout from '@/components/util_function/fetch';

const Page = () => {
	const [status, setStatus] = React.useState('Loading...')

	useEffect(() => {
		const fragment = window.location.href.split('#')[1];
		const searchParams = new URLSearchParams(fragment)
		const accessToken = searchParams.get('provider_token')
		const refreshToken = searchParams.get('provider_refresh_token')
		checkUserExists(accessToken, refreshToken)
	}, [])

	const checkUserExists = async (providerAccessToken, providerRefreshToken) => {
		const jwt = (await supabaseClient.auth.getSession()).data.session.access_token
		const email = (await supabaseClient.auth.getUser()).data.user.email
		const controller = new AbortController()
		const { signal } = controller;
		const { data, error } = await supabaseClient.from('teachers').select('*').eq('email', email)
		if (data.length === 0) {
			const { data: studentData, error: studentError } = await supabaseClient.from('students').select('*').eq('email', email)
			if (studentData.length > 0) {
				setStatus('This is a teacher login portal, please login with a teacher account')
			} else {
				const url = new URL(`${window.location.origin}/api/users/delete_user`)
				const response = await fetchTimeout(url, 5500, { signal, headers: { 'jwt': jwt } });
				console.log(response)
				if (response.status === 200) {
					setStatus('Please Sign Up First. Redirecting to Sign Up Page in 5 seconds...')
					setTimeout(() => {
					    window.location.href = '/signup'
					}, 5000)
				}
			}
		} else {
			console.log(providerAccessToken, providerRefreshToken)
			if (providerRefreshToken) {
				const refreshToken = (await supabaseClient.auth.getSession()).data.session.refresh_token
				const url = new URL(`${window.location.origin}/api/google/save_tokens`)
				const response = await fetchTimeout(url, 5500, { signal, method: 'POST', headers: { 'jwt': jwt, 'refresh_token': providerRefreshToken, 'access_token': providerAccessToken, 'supabase_refresh': refreshToken } });
				if (response.status !== 200) {
					setStatus('Unable to log in, please try again later')
					setTimeout(() => {
						window.location.href = '/login'
					}, 5000)
				}
			}
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
