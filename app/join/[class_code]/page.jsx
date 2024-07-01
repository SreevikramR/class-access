"use client"
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabaseClient } from '@/components/util_function/supabaseCilent';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import fetchTimeout from '@/components/util_function/fetch';
import { useToast } from '@/components/ui/use-toast';

export default function Component({ params: { class_code } }) {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isUnauthorized, setIsUnauthorized] = useState(false);
	const [noAccount, setNoAccount] = useState(false);
	const [credits, setCredits] = useState(1); // Replace 1 with your actual credit value
	const [willPay, setWillPay] = useState(false);

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { toast } = useToast()

	useEffect(() => {
		fetchUser()
	}, [])

	const handleLogin = () => {}
	const handleGoogleLogin = async () => {
		console.log(`${window.location.origin}/oauth/google/callback`)
		try {
			await supabaseClient.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: `${window.location.href}`,
				},
			})
		} catch (error) {
			toast({
				title: 'Unable to Login',
				description: error.message,
				variant: "destructive"
			})
		}
	}

	const fetchUser = async () => {
		const user = await supabaseClient.auth.getUser();
		if (user.data.user != null) {
			const { data, error } = await supabaseClient.from('students').select('*').eq('id', user.data.user.id);
			if (data.length > 0) {
				setIsLoggedIn(true)
			} else {
				const controller = new AbortController()
				const { signal } = controller;
				const url = new URL(`${window.location.origin}/api/users/delete_user`)
				const jwt = (await supabaseClient.auth.getSession()).data.session.access_token
				const response = await fetchTimeout(url, 5500, { signal, headers: { 'jwt': jwt } });
				console.log(response)
				if (response.status === 200) {
					toast({
						title: 'Account not found with Email',
						description: "Please Sign Up First",
						variant: "destructive"
					})
					setTimeout(() => {
						window.location.reload()
					}, 5000)
				}
			}
		} else {
			console.log("not logged in")
		}
	}

	return (
		<div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
			<main>
				{isLoggedIn && (
					<>
					{!isUnauthorized && (
						<div className="w-full flex justify-center items-center">
							{credits == 0 && (
								<Card className="w-[36vw] border-2">
									<div className="text-center">
										<h1 className="font-bold text-foreground sm:text-2xl pt-6">Class Name</h1>
										<h2><p className="text-muted-foreground">Teacher: John Doe</p></h2>
									</div>
									<div className="rounded-lg bg-white p-3 pt-0">
										<div className="flex flex-col sm:flex-row"></div>
										<div className="mt-6 rounded-lg bg-red-500 px-4 py-3 text-red-50">
											<div className="flex items-center">
												<TriangleAlertIcon className="mr-2 h-5 w-5" />
												<p className="text-sm font-medium">
													We see that you have not paid yet. Please pay to join the class.
												</p>
											</div>
										</div>
									</div>
								</Card>
							)}
							{credits == 1 && (
								<Card className="w-[36vw] border-2">
									<div className="text-center">
										<h1 className="font-bold text-foreground sm:text-2xl pt-6">Class Name</h1>
										<h2><p className="text-muted-foreground">Teacher: John Doe</p></h2>
									</div>
									<div className="rounded-lg bg-white p-3 pt-0">
										<div className="flex flex-col sm:flex-row"></div>
										<div className="mt-6 rounded-lg bg-red-500 px-4 py-3 text-red-50">
											<div className="flex items-center">
												<TriangleAlertIcon className="mr-2 h-5 w-5" />
												<p className="text-sm font-medium">
													Kindly Pay before your next class
												</p>
											</div>
										</div>
										<div className="mt-6 flex justify-between items-center">
											<div className='p-1 py-2 flex flex-row justify-center'>
												<input
													type="checkbox"
													id="willPay"
													checked={willPay}
													onChange={() => setWillPay(!willPay)}
													className="mr-2 w-5 h-5 border-2 checked:accent-green-600"
													/>
												<label htmlFor="willPay" className="text-foreground text-md items-center">I will complete the payment</label>
											</div>
											{willPay && (
												<div className="flex justify-end">
													<Button className="w-full sm:w-auto bg-green-700 hover:bg-green-500">Join Class</Button>
												</div>
											)}
										</div>
									</div>
								</Card>
							)}
							{credits >= 2 && (
								<div>Redirecting you to your class...</div>
							)}
						</div>
					)}
					{isUnauthorized && (
							<Card className="w-[36vw] border-2 p-10">
								<div className="text-center">
									<h1 className="font-semibold text-lg text-foreground">You do not have access to this class. Please contact your instructor for more details</h1>
								</div>
							</Card>
							)}
					</>
				)}
				{!isLoggedIn && (
					<>
						{!noAccount && (
							<Card className="w-[36vw] border-2">
								<div className="text-center">
									<h1 className="font-semibold text-xl text-foreground pt-6">Please Login to Join your class</h1>
								</div>
								<div className="rounded-lg bg-white p-3 pt-0">
									<div className="grid gap-4">
										<div className="grid gap-2">
											<Label htmlFor="email">Email</Label>
											<Input
												id="email"
												type="email"
												value={email}
												placeholder="email@example.com"
												required
												onChange={(e) => setEmail(e.target.value)}
											/>
										</div>
										<div className="grid gap-2">
											<div className="flex items-center">
												<Label htmlFor="password">Password</Label>
												<Link
													href="/forgot-password"
													className="ml-auto inline-block text-sm underline"
												>
													Forgot your password?
												</Link>
											</div>
											<Input
												id="password"
												placeholder="&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;"
												type="password"
												required
												value={password}
												onChange={(e) => setPassword(e.target.value)}
											/>
										</div>
										<Button type="submit" onClick={handleLogin} className="w-full">
											Login
										</Button>
										<div className="flex items-center my-2">
											<hr className="flex-grow border-t border-gray-300" />
											<span className="mx-2 text-gray-500 text-xs">OR CONTINUE WITH</span>
											<hr className="flex-grow border-t border-gray-300" />
										</div>
										<Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
											Google
										</Button>
										<div className='text-md cursor-pointer text-blue-700 underline w-fit' onClick={() => setNoAccount(true)}>Don&apos;t have an Account?</div>	
									</div>
								</div>
							</Card>
						)}
						{noAccount && (
							<Card className="w-[36vw] border-2 p-10">
								<div className="text-center">
									<h1 className="font-semibold text-lg text-foreground">Please contact your instructor to gain access to the class</h1>
								</div>
							</Card>
						)}
					</>
				)}
			</main>
		</div>
	);
}

function TriangleAlertIcon(props) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
			<path d="M12 9v4" />
			<path d="M12 17h.01" />
		</svg>
	);
}
