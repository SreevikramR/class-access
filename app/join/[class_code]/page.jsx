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
import LoadingOverlay from '@/components/page_components/loadingOverlay';

export default function Component({ params: { class_code } }) {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [noAccount, setNoAccount] = useState(false);
	const [credits, setCredits] = useState(null); // Replace 1 with your actual credit value
	const [willPay, setWillPay] = useState(false);
	const [classDoesNotExist, setClassDoesNotExist] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [className, setClassName] = useState("Class Name");
	const [classLink, setClassLink] = useState("")
	const [loading, setLoading] = useState(true);
	const [hasJoinedClass, setHasJoinedClass] = useState(false);
	const { toast } = useToast()

	useEffect(() => {
		fetchUser()
	}, [])

	const handleLogin = async () => {
		setLoading(true)
		try {
			const { data } = await supabaseClient.auth.signInWithPassword({
				email: email,
				password: password,
			})
			setIsLoggedIn(true)
			fetchUser()
		} catch (error) {
			toast({
				title: 'Unable to Login',
				description: error.message,
				variant: "destructive"
			})
		}
		setLoading(false)
	}
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
		setLoading(true)
		const user = await supabaseClient.auth.getUser();
		if (user.data.user != null) {
			console.log(class_code)

			const { data: classData, error: classError } = await supabaseClient.from('classes').select("name, id, teacher_id").eq('class_code', class_code);
			if (classData.length == 0) {
				setClassDoesNotExist(true)
				setLoading(false)
				return
			}
			setClassName(classData[0].name)
			const { data, error } = await supabaseClient.from('student_proxies').select('classes_left, status').eq('student_id', user.data.user.id).eq('teacher_id', classData[0].teacher_id);
			if (error) {
				console.error('Error fetching classes:', error)
			}
			if (data[0].status[classData[0].id] === 'Joined') {
				setHasJoinedClass(true)
			}
			setCredits(data[0].classes_left[classData[0].id])
			if (data[0].classes_left[classData[0].id] > 0) {
				const { data: classData2, error: classError2 } = await supabaseClient.from('classes').select('meeting_link').eq('class_code', class_code);
				if (classData2[0].meeting_link !== null) {
					setClassLink(classData2[0].meeting_link)
				}
			}

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
			setLoading(false)
		} else {
			console.log("not logged in")
			setLoading(false)
		}
		setLoading(false)
	}

	return (
		<div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
			{loading && <LoadingOverlay />}
			<main>
				{!loading && <>
					{classDoesNotExist && (
						<Card className="lg:w-[36vw] sm:w-[60vw] w-[90vw] border-2 p-10">
							<div className="text-center">
								<h1 className="font-semibold text-md sm:text-lg text-foreground text-pretty">Class you are looking for does not exist. Please contact your instructor for more details</h1>
							</div>
						</Card>
					)}
					{!classDoesNotExist && ( <>
						{isLoggedIn && (
							<>
								{!hasJoinedClass && (
									<Card className="lg:w-[36vw] sm:w-[60vw] w-[90vw] border-2">
										<div className="text-center">
											<h1 className="font-bold text-foreground text-lg sm:text-xl pt-6 text-pretty pb-6">Please check you email for a class invite. Return to this link after accepting the invite</h1>
										</div>
									</Card>
								)}
								{hasJoinedClass && (
									<div className="w-full flex justify-center items-center">
										{credits == 0 && (
											<Card className="lg:w-[36vw] sm:w-[60vw] w-[90vw] border-2">
												<div className="text-center">
													<h1 className="font-bold text-foreground text-xl sm:text-2xl pt-6 text-pretty">{className}</h1>
												</div>
												<div className="rounded-lg bg-white p-3 pt-0">
													<div className="flex flex-col sm:flex-row"></div>
													<div className="mt-6 rounded-lg bg-red-500 px-4 py-3 text-red-50">
														<div className="flex items-center">
															<TriangleAlertIcon className="mr-2 h-5 w-5" />
															<p className="sm:text-sm text-xs font-medium text-pretty">
																We see that you have not paid yet. Please pay to join the class.
															</p>
														</div>
													</div>
												</div>
											</Card>
										)}
										{credits == 1 && (
											<Card className="lg:w-[40vw] sm:w-[60vw] w-[90vw] border-2">
												<div className="text-center">
													<h1 className="font-bold text-foreground text-xl sm:text-2xl pt-6 text-pretty">{className}</h1>
												</div>
												<div className="rounded-lg bg-white p-3 pt-0">
													<div className="flex flex-col sm:flex-row"></div>
													<div className="mt-6 rounded-lg bg-red-500 px-4 py-3 text-red-50">
														<div className="flex items-center">
															<TriangleAlertIcon className="mr-2 h-5 w-5" />
															<p className="sm:text-sm text-xs font-medium text-pretty">
															Kindly Pay before your next class
															</p>
														</div>
													</div>
													<div className="mt-6 flex flex-col sm:flex-row justify-between items-center">
														<div className='p-1 py-2 flex flex-row justify-center'>
															<input
																type="checkbox"
																id="willPay"
																checked={willPay}
																onChange={() => setWillPay(!willPay)}
																className="mr-2 w-5 h-5 border-2 checked:accent-green-600"
															/>
															<label htmlFor="willPay" className="text-foreground text-sm sm:text-md items-center text-pretty">I will complete the payment</label>
														</div>
														{willPay && (
															<div className="flex justify-end">
																<Button className="w-full sm:w-auto bg-green-700 hover:bg-green-500" onClick={() => window.location.href = classLink}>Join Class</Button>
															</div>
														)}
													</div>
												</div>
											</Card>
										)}
										{credits >= 2 && (
											<>
												<span className='hidden'>{window.location.href = classLink}</span>
												<div>Redirecting you to your class...</div>
											</>
										)}
									</div>
								)}
							</>
						)}
						{!isLoggedIn && (
							<>
								{!noAccount && (
									<Card className="lg:w-[36vw] sm:w-[60vw] w-[90vw] border-2">
										<div className="text-center">
											<h1 className="font-semibold text-md pb-4 lg:text-xl text-foreground pt-6 text-pretty">Please Login to Join your class</h1>
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
															className="ml-auto inline-block text-xs sm:text-sm underline"
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
												<div className='sm:text-md text-sm cursor-pointer text-blue-700 underline w-fit' onClick={() => setNoAccount(true)}>Don&apos;t have an Account?</div>
											</div>
										</div>
									</Card>
								)}
								{noAccount && (
									<Card className="lg:w-[36vw] sm:w-[60vw] w-[90vw] border-2 p-10">
										<div className="text-center">
											<h1 className="font-semibold text-md sm:text-lg text-foreground text-pretty">Please contact your instructor to gain access to the class</h1>
										</div>
									</Card>
								)}
							</>
						)}
					</>)}
				</>}
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
