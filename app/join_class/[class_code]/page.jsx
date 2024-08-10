"use client"
import { useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { supabaseClient } from "@/components/util_function/supabaseCilent"
import fetchTimeout from "@/components/util_function/fetch"
import { useToast } from "@/components/ui/use-toast"
import LoadingOverlay from "@/components/page_components/loadingOverlay"

export default function Component({ params: { class_code } }) {
	const [joinedClass, setJoinedClass] = useState(false)
	const [isLoggedIn, setIsLoggedIn] = useState(false)
	const [classDetails, setClassDetails] = useState(null)
	const [studentData, setStudentData] = useState(null)
	const [teacherName, setTeacherName] = useState("")
	const [email, setEmail] = useState("")
	const [loginPassword, setLoginPassword] = useState("")
	const [step, setStep] = useState(0)
	const [loading, setLoading] = useState(false)
	const [unactivated, setUnactivated] = useState(false)
	const { toast } = useToast()

	useEffect(() => {
		fetchUser()
	}, [])

	const handlePasswordLogin = async () => {
		if (loading) return;
		if (!email || !loginPassword) {
			toast({
				title: 'Error',
				description: "Please enter both email and password",
				variant: "destructive"
			});
			return;
		}

		setLoading(true)
		const { data, error } = await supabaseClient.auth.signInWithPassword({
			email: email,
			password: loginPassword,
		});
		if (error) {
			toast({
				title: 'Login Failed',
				description: error.message,
				variant: "destructive"
			});
		}
		fetchUser()
		setIsLoggedIn(true)
		toast({
			title: 'Success',
			description: "Logged in successfully",
			variant: "default"
		});
	};

	const handleGoogleLogin = async () => {
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

	const handlePasswordReset = async () => {
		if (loading) return;
		setLoading(true)
		const controller = new AbortController()
		const { signal } = controller;

		try {
			const response = await fetchTimeout(`/api/users/forgot_password`, 5500, {
				signal,
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					"email": email
				},
			});
			if (response.status !== 200) {
				toast({
					title: 'Password Reset Failed',
					description: "Please try again later",
					variant: "destructive"
				});
				setLoading(dalse)
				return;
			}
			setStep(3)
		} catch (error) {
			toast({
				title: 'Password Reset Failed',
				description: error.message,
				variant: "destructive"
			});
		}
		setLoading(false)
	}

	const fetchUser = async () => {
		setLoading(true)
		const user = await supabaseClient.auth.getUser();
		if (user.data.user != null) {
			const { data, error } = await supabaseClient.from('students').select('*').eq('id', user.data.user.id);
			if (data.length > 0) {
				setStudentData(data[0])
				setIsLoggedIn(true)
				const { data: classData, error: classError } = await supabaseClient.from('classes').select('teacher_id, id').eq('class_code', class_code).single()
				const { data: proxyData, error: proxyError } = await supabaseClient
					.from('student_proxies')
					.select('status')
					.eq('student_id', user.data.user.id)
					.eq('teacher_id', classData.teacher_id)
					.single();
				if (proxyData && proxyData.status[classData.id] === 'Joined') {
					setJoinedClass(true)
				}
			} else {
				const { data: teacherData, error: teacherError } = await supabaseClient.from('teachers').select('*').eq('id', user.data.user.id);
				if (teacherData.length > 0) {
					toast({
						title: 'Teacher Account Found',
						description: "Please login through the teacher portal",
						variant: "destructive"
					})
					setLoading(false)
					setTimeout(() => {
						window.location.href = '/login'
					}, 5000)
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
						setLoading(false)
						setTimeout(() => {
							window.location.reload()
						}, 5000)
					}
				}
			}
			fetchClassDetails()
		} else {
			setLoading(false)
		}
	}

	const fetchClassDetails = async () => {
		const { data: classData, error: classError } = await supabaseClient
			.from('classes')
			.select('*')
			.eq('class_code', class_code)
			.single()

		if (classError) {
			console.log("Class does not exist")
			setLoading(false)
			return
		}
		const studentId = (await supabaseClient.auth.getUser()).data.user.id
		const { data, error } = await supabaseClient.from('students').select('*').eq('id', studentId)
		if (error) {
			toast({
				title: 'Error',
				description: "Please Try Again Later",
				variant: "destructive"
			})
			setLoading(false)
			return
		}
		if (data[0].first_name === null) {
			setUnactivated(true)
		}
		setClassDetails(classData)
		if (classData.teacher_id) {
			console.log("teacher id", classData.teacher_id)
			const { data: teacherData, error: teacherError } = await supabaseClient
				.from('teachers')
				.select('first_name, last_name, id')
				.eq('id', classData.teacher_id)
				.single()

			if (teacherError) {
				console.error("Error fetching teacher details:", teacherError)
			} else if (teacherData) {
				setTeacherName(`${teacherData.first_name} ${teacherData.last_name}`)
			}
		}
		setLoading(false)
	}

	const formatTime = (start, end) => {
		const formatTimeString = (timeString) => {
			const [time, offset] = timeString.split('+');
			const date = new Date();
			const [hours, minutes, seconds] = time.split(':').map(Number);
			date.setHours(hours, minutes, seconds);
			const options = {
				hour: '2-digit',
				minute: '2-digit',
				hour12: true // 24-hour time format
			};
			return date.toLocaleTimeString('en-US', options);
		}
		return `${formatTimeString(start)} - ${formatTimeString(end)}`
	}

	const formatDays = (days) => {
		console.log('Days data:', days); // Log the days data for debugging
		if (Array.isArray(days)) {
			return days.join(', ');
		} else if (typeof days === 'string') {
			// If it's a string, try parsing it as JSON
			try {
				const parsedDays = JSON.parse(days);
				if (Array.isArray(parsedDays)) {
					return parsedDays.join(', ');
				}
			} catch (e) {
				console.error('Failed to parse days string:', e);
			}
			// If parsing fails or result is not an array, return the string as-is
			return days;
		} else {
			console.error('Unexpected format for days:', days);
			return '';
		}
	}

	const _joinedClass = () => {
		return (
			<Card className="flex flex-col items-center justify-center bg-background">
				<div className="sm:max-w-md max-w-[90vw] p-6 rounded-lg bg-card">
					<div className="flex flex-col items-center space-y-4 text-center">
						<CircleCheckIcon className="text-green-500 size-12" />
						<h1 className="sm:text-3xl text-xl font-bold">You&#39;re all set!</h1>
						<p className="text-muted-foreground text-pretty sm:text-base text-sm">
                            Great! You&#39;ve successfully joined the class. Be sure to join at the scheduled time to participate.
						</p>
						<p className="text-muted-foreground text-pretty sm:text-base text-sm">
                            Look for a link from your instructor to join the class.
						</p>
					</div>
				</div>
			</Card>
		)
	}

	const handleComplete = async () => {
		if (loading) return
		setLoading(true)
		const { data, error } = await supabaseClient.from('student_proxies').select('*').eq('student_id', studentData.id).eq('teacher_id', classDetails.teacher_id)
		if (data.length === 0) {
			toast({
				title: 'Unable to Join Class',
				description: "Error Joining Class, Please try again later",
				variant: "destructive"
			})
		}
		const controller = new AbortController()
		const { signal } = controller;
		const url = new URL(`${window.location.origin}/api/students/update_proxy`)
		const jwt = (await supabaseClient.auth.getSession()).data.session.access_token
		const response = await fetchTimeout(url, 5500, {
			signal,
			method: 'PUT',
			headers: {
				'jwt': jwt,
				'student_proxy_id': data[0].id,
				'first_name': studentData.first_name,
				'last_name': studentData.last_name,
				'phone': studentData.phone,
				'class_id': classDetails.id,
				'class_status': 'Joined'
			},
		});
		if (response.status === 200) {
			setJoinedClass(true)
		} else {
			toast({
				title: 'Failed to join class',
				description: "Please try again later",
				variant: "destructive"
			});
		}
		setLoading(false)
	};

	const _login = () => {
		return (
			<Card className="p-6 space-y-4 lg:w-[36vw] sm:w-[60vw] w-[90vw]">
				<div className="text-center">
					<h1 className="font-semibold text-lg sm:text-xl text-foreground pt-6 pb-4 text-pretty">Please Login to Join your class</h1>
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
								<span
									onClick={() => setStep(2)}
									className="ml-auto cursor-pointer inline-block text-xs sm:text-sm underline"
								>
                                    Forgot your password?
								</span>
							</div>
							<Input
								id="password"
								placeholder="&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;"
								type="password"
								required
								value={loginPassword}
								onChange={(e) => setLoginPassword(e.target.value)}
							/>
						</div>
						<Button type="submit" onClick={handlePasswordLogin} className="w-full">
                            Login
						</Button>
						{/* <div className="flex items-center my-2">
                            <hr className="flex-grow border-t border-gray-300" />
                            <span className="mx-2 text-gray-500 text-xs">OR CONTINUE WITH</span>
                            <hr className="flex-grow border-t border-gray-300" />
                        </div>
                        <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
                            Google
                        </Button> */}
						<div className='sm:text-md text-sm cursor-pointer text-blue-700 underline w-fit' onClick={() => setStep(1)}>Don&apos;t have an Account?</div>
					</div>
				</div>
			</Card>
		)
	}

	const _forgotPassword = () => {
		return (
			<Card className="p-6 space-y-4 lg:w-[36vw] sm:w-[60vw] w-[90vw]">
				<div className="text-center">
					<h1 className="font-semibold text-lg sm:text-xl text-foreground pt-6 pb-4 text-pretty">Forgot Password</h1>
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

						<Button type="submit" onClick={handlePasswordReset} className={"w-full" + (loading ? " cursor-wait" : "")}>
                            Send Link
						</Button>
						<div className='sm:text-md text-sm cursor-pointer text-blue-700 underline w-fit' onClick={() => setStep(0)}>Back to login</div>
					</div>
				</div>
			</Card>
		)
	}

	const _passwordLinkSent = () => {
		return (
			<Card className="p-6 space-y-4 lg:w-[36vw] sm:w-[60vw] w-[90vw]">
				<div className="text-center">
					<h1 className="font-semibold text-lg sm:text-xl text-foreground pt-6 pb-4 text-pretty">Please check your email for a password reset link</h1>
				</div>
				<Button type="submit" onClick={() => setStep(0)} className="w-full mt-4">
                    Sounds Good!
				</Button>
			</Card>
		)
	}

	const _unactivated = () => {
		return (
			<Card className="p-6 space-y-4 lg:w-[36vw] sm:w-[60vw] w-[90vw]">
				<div className="text-center">
					<h1 className="font-semibold text-lg sm:text-xl text-foreground pt-6 pb-4 text-pretty">Please check your email for an account activation link. Come back to this page once you have activated your account</h1>
				</div>
			</Card>
		)
	}

	const noAccount = () => {
		return (
			<Card className="p-6 space-y-4 lg:w-[36vw] sm:w-[60vw] w-[90vw]">
				<h1 className="text-pretty">Please Look for an account activation E-Mail, if you don&#39;t have one, please request your teacher to resend an invite</h1>
				<Button type="submit" onClick={() => setStep(0)} className="w-full mt-6">
                    Back
				</Button>
			</Card>
		)
	}

	return (
		<main className="flex flex-col items-center justify-center h-screen">
			{loading && <LoadingOverlay />}
			{!isLoggedIn &&
                <>
                	{step === 0 && _login()}
                	{step === 1 && noAccount()}
                	{step === 2 && _forgotPassword()}
                	{step === 3 && _passwordLinkSent()}
                </>
			}
			{isLoggedIn && <>
				{unactivated && _unactivated()}
				{joinedClass && !unactivated && _joinedClass()}
				{!classDetails && !unactivated && (
					<Card className="p-6 space-y-4 lg:w-[36vw] sm:w-[60vw] w-[90vw]">
						<div className="flex flex-col items-center space-y-2">
							<div className="inline-block rounded-lg px-3 py-1 text-lg sm:text-lg font-medium text-pretty">
                                Class Does not exist
							</div>
							<p className="text-muted-foreground text-center sm:text-base text-sm text-pretty">
                                Please recheck your link or contact your instructor
							</p>
						</div>
					</Card>
				)}
				{!joinedClass && classDetails && !unactivated && (
					<div className="lg:w-[46vw] sm:w-[60vw] w-[90vw]">
						<Card className="w-full p-6 space-y-4">
							<div className="flex flex-col items-center space-y-2">
								<div className="inline-block rounded-lg px-3 py-1 text-xs sm:text-sm font-medium text-pretty">
                                    You have been invited to join
								</div>
								<h2 className="sm:text-2xl text-lg text-center font-bold text-pretty">{classDetails.name}</h2>
								<p className="text-muted-foreground text-xs sm:text-base">
                                    Taught by {teacherName}
								</p>
								<p></p>
								<p className="text-muted-foreground sm:text-base text-xs text-pretty">
									{formatDays(classDetails.days)}
								</p>
								<p className="text-muted-foreground sm:text-base text-xs text-pretty">
								 	{formatTime(classDetails.start_time, classDetails.end_time)}
								</p>
							</div>
							<div className="flex gap-2">
								<Button variant="outline" className="w-full">
                                    Decline
								</Button>
								<Button className={"w-full" + (loading ? " cursor-progress" : "")} onClick={handleComplete}>Join Class</Button>
							</div>
						</Card>
					</div>
				)}
			</>}
		</main>
	)

	function CircleCheckIcon(props) {
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
				<circle cx="12" cy="12" r="10" />
				<path d="m9 12 2 2 4-4" />
			</svg>
		)
	}
}
