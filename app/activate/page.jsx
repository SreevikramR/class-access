"use client"
import React, { useEffect, useState } from 'react'
import { supabaseClient } from '@/components/util_function/supabaseCilent'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowRightCircle, CircleX, CheckCircleIcon, CircleCheckIcon } from 'lucide-react'
import { PhoneInput, getPhoneData } from '@/components/ui/phoneInputComponents'
import { toast } from "@/components/ui/use-toast"
import fetchTimeout from '@/components/util_function/fetch'
import LoadingOverlay from '@/components/page_components/loadingOverlay'
import { Skeleton } from "@/components/ui/skeleton";

const ActivationPage = () => {
	const [loading, setLoading] = useState(false)
	const [step, setStep] = useState(0)
	const [phone, setPhone] = useState('+91')
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [isLoggedIn, setIsLoggedIn] = useState(false)
	const [error, setError] = useState(false)
	const phoneData = getPhoneData(phone)

	const setSession = async () => {
		setLoading(true)
		const hash = (window.location.hash).split('#')[1];
		const params = new URLSearchParams(hash)
		const jwt = params.get('access_token');
		const refresh_token = params.get('refresh_token');

		const { data: user, error } = await supabaseClient.auth.setSession({ access_token: jwt, refresh_token: refresh_token })
		if (error) {
			setError(true)
			console.error("Error setting session:", error)
			setLoading(false)
			return
		}
		console.log(user.user)
		setLoading(false)
		setIsLoggedIn(true)
		checkActivationStatus()
	}

	const checkActivationStatus = async () => {
		setLoading(true)
		try {
			const { data: { user } } = await supabaseClient.auth.getUser()
			if (user) {
				const { data, error } = await supabaseClient
					.from('students')
					.select('first_name')
					.eq('id', user.id)
					.single()
				if (error) throw error
				if (data.first_name) {
					setStep(3)
				}
			}
		} catch (error) {
			console.error("Error checking activation status:", error)
		}
		setLoading(false)
	}

	useEffect(() => {
		setSession()
	}, [])

	const handleStep0 = () => {
		if (firstName === '' || lastName === '') {
			toast({
				title: "Please enter your first and last name",
				variant: "destructive"
			})
			return
		}
		setStep(1)
	}

	const handleStep1 = async () => {
		if (password !== confirmPassword) {
			toast({
				variant: 'destructive',
				title: "passwords don't match",
				description: "Enter your password",
				duration: 3000,
			});
			return;
		}
		setLoading(true)
		if (password.length < 6) {
			toast({
				variant: 'destructive',
				title: "Password too short",
				description: "Password must be at least 6 characters long.",
				duration: 3000,
			});
			setLoading(false)
			return;
		}

		try {
			const user = await supabaseClient.auth.getUser();
			const studentData = {
				first_name: firstName,
				last_name: lastName,
				phone: phoneData.phoneNumber
			};

			const { data: updateData, error: updateError } = await supabaseClient
				.from('students')
				.update(studentData)
				.eq('id', user.data.user.id)
				.select();

			const jwt = (await supabaseClient.auth.getSession()).data.session.access_token;
			const signal = new AbortController().signal;
			const response = await fetchTimeout('/api/students/update_has_joined', 2000, {
				signal,
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'jwt': jwt
				}
			});

			if (updateError || response.status !== 200) {
				console.error("Error updating data:", updateError);
				toast({
					variant: 'destructive',
					title: "Failed to save",
					description: "Try again.",
					duration: 3000,
				});
				setLoading(false);
				throw updateError;
			}

			const { data1, error2 } = await supabaseClient.auth.updateUser({
				password: password
			})

			if (error2) throw error2;

			toast({
				className: "bg-green-500 border-black border-2",
				title: "Done",
				duration: 3000,
			});
			setStep(3);
			setLoading(false);
		} catch (error) {
			console.error("Error saving student data:", error);
			toast({
				variant: 'destructive',
				title: "Failed to save",
				description: "Try again.",
				duration: 3000,
			});
			setLoading(false);
		}
		setLoading(false);
	}

	return (
		<>
			{loading && <LoadingOverlay />}
			<div className="flex h-screen w-full items-center justify-center bg-background">
				<Card className="lg:w-[36vw] sm:w-[60vw] w-[90vw]">
					{error && (
						<>
							<CardHeader className="space-y-2 text-center flex flex-col flex-wrap items-center">
								<CircleX className="text-red-500 size-12" />
								<CardTitle className="sm:text-2xl text-xl font-bold">Unable to Activate Account!</CardTitle>
								<CardDescription className="text-pretty">Your activation link may h	ave expired or be invalid. Please contact your instructor to get a new link.</CardDescription>
							</CardHeader>
						</>
					)}
					{!error && (
						<>
							{!isLoggedIn && (
								<div className="text-center">
									<Skeleton className="w-[90vw] h-[100px] lg:w-[36vw] sm:w-[60vw] rounded-md mb-4"/>
									<Skeleton className="w-[90vw] h-[50px] lg:w-[36vw] sm:w-[60vw] rounded-md"/>
								</div>
							)}
							{!isLoggedIn && (
								<>
								</>
							)}
							{isLoggedIn && (
								<>
									{step === 0 && (
										<>
											<CardHeader className="space-y-2 text-center">
												<CardTitle className="sm:text-2xl text-xl font-bold">Welcome to Class Access!</CardTitle>
												<CardDescription className="text-pretty">Please enter your information below to get started.</CardDescription>
											</CardHeader>
											<CardContent className="space-y-4">
												<div className="grid gap-2">
													<Label htmlFor="name">Student First Name</Label>
													<Input id="first name" placeholder="Enter your Student&#39;s First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
												</div>
												<div className="grid gap-2">
													<Label htmlFor="email">Student Last Name</Label>
													<Input id="last name" type="email" placeholder="Enter your Student&#39;s Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
												</div>
												<Button type="submit" className="w-full" onClick={handleStep0}>
													Next <ArrowRightCircle className='ml-2 w-4 h-4' />
												</Button>
											</CardContent>
										</>
									)}
									{step === 1 && (
										<>
											<CardHeader className="space-y-2 text-center">
												<CardTitle className="sm:text-2xl text-xl font-bold">Almost Done!</CardTitle>
											</CardHeader>
											<CardContent className="space-y-4">
												<div className="grid gap-2">
													<Label>Phone Nubmber</Label>
													<PhoneInput value={phone} onChange={(e) => setPhone(e.target.value)} />
												</div>
												<div className="grid gap-2">
													<Label htmlFor="name">New Password</Label>
													<Input id="password" type="password" placeholder="Please Enter a new Password" value={password} onChange={(e) => setPassword(e.target.value)} />
												</div>
												<div className="grid gap-2">
													<Label htmlFor="email">Confirm New Password</Label>
													<Input id="password" type="password" placeholder="Please Re-Enter your new Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
												</div>
												<Button type="submit" className="w-full" onClick={handleStep1}>
													Finish <CheckCircleIcon className='ml-2 w-4 h-4' />
												</Button>
											</CardContent>
										</>
									)}
									{step === 3 && (
										<>
											<CardHeader className="space-y-2 text-center flex flex-col flex-wrap items-center">
												<CircleCheckIcon className="text-green-500 size-12" />
												<CardTitle className="sm:text-2xl text-xl font-bold">Account Activation Complete!</CardTitle>
												<CardDescription className="text-pretty">Your account is setup and ready for use. Please look for another E-Mail from your teacher to join your class</CardDescription>
											</CardHeader>
										</>
									)}
								</>
							)}
						</>
					)}
				</Card>
			</div>
		</>
	)
}

export default ActivationPage
