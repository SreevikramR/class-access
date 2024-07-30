"use client"
import React, { useEffect, useState } from 'react'
import { supabaseClient } from '@/components/util_function/supabaseCilent'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowRightCircle, CircleCheckIcon } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"
import LoadingOverlay from '@/components/page_components/loadingOverlay'
import fetchTimeout from '@/components/util_function/fetch'

const ResetPage = () => {
	const [loading, setLoading] = useState(false)
	const [step, setStep] = useState(0)
	const [jwt, setJwt] = useState('')
	const [refreshToken, setRefreshToken] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [error, setError] = useState(false)

	useEffect(() => {
		setSession()
	}, [])

	const setSession = async () => {
		setLoading(true)
		const hash = (window.location.hash).split('#')[1];
		const params = new URLSearchParams(hash)
		const jwt = params.get('access_token');
		const refresh_token = params.get('refresh_token');
		setJwt(jwt)
		setRefreshToken(refresh_token)

		const { data: user, error } = await supabaseClient.auth.setSession({ access_token: jwt, refresh_token: refresh_token })
		if (error) {
			setError(true)
			console.error("Error setting session:", error)
			setLoading(false)
			return
		}
		setLoading(false)
	}

	const handleStep0 = async () => {
		setLoading(true)
		if (password !== confirmPassword) {
			toast({
				title: "Passwords do not match",
				variant: "destructive"
			})
			return
		}
		const controller = new AbortController()
		const { signal } = controller;

		try {
			const response = await fetchTimeout(`/api/users/reset_password`, 5500, {
				signal,
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					"jwt": jwt,
					"refresh_token": refreshToken,
					"password": password,
				},
			});
			if (response.status !== 200) {
				setLoading(false)
				toast({
					title: "Unable to Reset Password. Please Try Again Later",
					variant: "destructive"
				})
				return;
			}
			setStep(1)
			setTimeout(() => {
				window.location.href = '/login'
			}, 5000)
		} catch (error) {
			toast({
				title: "Unable to Reset Password. Please Try Again Later",
				variant: "destructive"
			})
		}
		setLoading(false)
	}


	return (
		<div className="flex h-screen w-full items-center justify-center bg-background">
			{loading && <LoadingOverlay />}
			<Card className="lg:w-[36vw] sm:w-[60vw] w-[90vw]">
				{error && (
					<>
						<CardHeader className="space-y-2 text-center flex flex-col flex-wrap items-center">
							<CardTitle className="sm:text-2xl text-xl font-bold text-pretty">Please Check the Link and Retry</CardTitle>
							<CardDescription className="text-pretty">Please make sure you have the correct link. If this problem persists, please request your teacher to send you a new invite</CardDescription>
						</CardHeader>
					</>
				)}
				{!error && (
					<>
						{step === 0 && (
							<>
								<CardHeader className="space-y-2 text-center">
									<CardTitle className="sm:text-2xl text-xl font-bold">Password Recovery</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid gap-2">
										<Label htmlFor="name">New Password</Label>
										<Input id="password" type="password" placeholder="Please Enter a New Password" value={password} onChange={(e) => setPassword(e.target.value)} />
									</div>
									<div className="grid gap-2">
										<Label htmlFor="email">Confirm New Password</Label>
										<Input id="confirm password" type="password" placeholder="Please Confirm your New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
									</div>
									<Button type="submit" className="w-full" onClick={handleStep0}>
                                        Next <ArrowRightCircle className='ml-2 w-4 h-4' />
									</Button>
								</CardContent>
							</>
						)}
						{step === 1 && (
							<>
								<CardHeader className="space-y-2 text-center flex flex-col flex-wrap items-center">
									<CircleCheckIcon className="text-green-500 size-12" />
									<CardTitle className="sm:text-2xl text-xl font-bold">Password Reset Successful!</CardTitle>
									<CardDescription className="text-pretty">You may now login with your new password. You will be redirected to the login page in 5 seconds.</CardDescription>
								</CardHeader>
							</>
						)}
					</>
				)}
			</Card>
		</div>
	)
}

export default ResetPage
