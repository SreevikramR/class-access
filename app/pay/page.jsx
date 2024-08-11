"use client"
import React, { useEffect, useState } from 'react'
import LoadingOverlay from '@/components/page_components/loadingOverlay';
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { supabaseClient } from '@/components/util_function/supabaseCilent';
import { useToast } from '@/components/ui/use-toast';
import { useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Separator } from '@/components/ui/separator';
import fetchTimeout from '@/components/util_function/fetch';

const Payments = () => {
	const [loggedIn, setLoggedIn] = useState(false);
	const [invoice, setInvoice] = useState(null);
	const [loading, setLoading] = useState(false);
	const [link, setLink] = useState('');
	const { toast } = useToast();

	// Login States
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [noAccount, setNoAccount] = useState(false);
	const [noInvoiceFound, setNoInvoiceFound] = useState(false);
	const [teacherDetails, setTeacherDetails] = useState(null);
	const [classDetails, setClassDetails] = useState(null);
	const [paymentConfirmActive, setPaymentConfirmActive] = useState(false);
	const [hasPaid, setHasPaid] = useState(false);
	const [hasConfirmed, setHasConfirmed] = useState(false);

	const searchParams = useSearchParams()
	const invoiceId = searchParams.get('invoice_id')
	const [date, setDate] = useState(null);
	const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

	useEffect(() => {
		checkLogin();
	}, [])

	const handlePaid = async () => {
		if (loading) return
		setLoading(true)
		const signal = new AbortController().signal;
		const jwt = (await supabaseClient.auth.getSession()).data.session.access_token;
		const response = await fetchTimeout('/api/students/update_invoice', 7500, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'jwt': jwt,
				'invoice_id': invoiceId
			},
			signal
		})
		if (response.status === 200) {
			setHasPaid(true);
		} else {
			toast({
				title: 'An Error Occurred',
				description: 'You DO NOT need to pay again. Please try clicking on the button in a few minutes',
				variant: 'destructive'
			})
			console.log(await response.json())
		}
		setLoading(false)
	}

	const fetchInvoiceDetails = async ({email}) => {
		setLoading(true)
		let fetchedClassData;
		let fetchedTeacherData;
		const { data, error } = await supabaseClient.from('invoices').select('*').eq('id', invoiceId);
		if (error) {
			toast({
				title: 'Error',
				description: error.message,
				variant: "destructive"
			})
		} else {
			if (data.length === 0) {
				setNoInvoiceFound(true);
				setLoading(false)
				return;
			}
			if (data[0].status === 'Unconfirmed') {
				setHasPaid(true)
				setLoading(false)
				return
			} else if ( data[0].status === 'Paid') {
				setHasPaid(true)
				setHasConfirmed(true)
				setLoading(false)
				return
			}
			const invoiceDate = new Date(data[0].date);
			setDate(`${invoiceDate.getDate()} ${months[invoiceDate.getMonth()]} ${invoiceDate.getFullYear()}`);
			setInvoice(data[0]);
			const { data: classData, error: classError } = await supabaseClient.from('classes').select('*').eq('id', data[0].class_id)
			if (classError || classData.length === 0) {
				toast({
					title: 'Error',
					description: classError.message,
					variant: "destructive"
				})
				setNoInvoiceFound(true);
				setLoading(false)
				return;
			}
			fetchedClassData = classData;
			setClassDetails(classData[0]);
			const { data: teacherData, error: teacherError } = await supabaseClient.from('teachers').select('*').eq('id', classData[0].teacher_id)
			if (teacherError || teacherData.length === 0) {
				toast({
					title: 'Error',
					description: teacherError.message,
					variant: "destructive"
				})
				setNoInvoiceFound(true);
				setLoading(false)
				return;
			}
			fetchedTeacherData = teacherData;
			setTeacherDetails(teacherData[0]);
		}
		setLoading(false);
		setLink(`upi://pay?pa=${fetchedTeacherData[0].upi_vpa}&pn=${fetchedTeacherData[0].upi_name}&cu=INR&am=${data[0].amount}&tn=Payment from ${email}`)
		setTimeout(() => {setPaymentConfirmActive(true)}, 15000)
	}

	const checkLogin = async () => {
		const user = await supabaseClient.auth.getUser()
		if (user.data.user) {
			setLoggedIn(true);
			fetchInvoiceDetails({email: user.data.user.email});
		}
	}

	const handleLogin = async () => {
		setLoading(true);
		try {
			const { data, error } = await supabaseClient.auth.signInWithPassword({
				email: email,
				password: password,
			})
			if (error) {
				setLoading(false)
			} else {
				setLoggedIn(true)
				fetchInvoiceDetails();
			}
		} catch (error) {
			toast({
				title: 'Unable to Login',
				description: error.message,
				variant: "destructive"
			})
		}
	}

	return (
		<div className="flex flex-wrap flex-col justify-center h-screen items-center">
			{loading && <LoadingOverlay />}
			{!loggedIn && (
				<>
					{!noAccount && (
						<Card className="lg:w-[36vw] sm:w-[60vw] w-[90vw] border-2 h-fit">
							<div className="text-center">
								<h1 className="font-semibold text-md pb-4 lg:text-xl text-foreground pt-6 text-pretty">Please Login to Make Payments</h1>
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
									{/* <div className="flex items-center my-2">
											<hr className="flex-grow border-t border-gray-300" />
											<span className="mx-2 text-gray-500 text-xs">OR CONTINUE WITH</span>
											<hr className="flex-grow border-t border-gray-300" />
										</div>
										<Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
											Google
										</Button> */}
									<div className='sm:text-md text-sm cursor-pointer text-blue-700 underline w-fit' onClick={() => setNoAccount(true)}>Don&apos;t have an Account?</div>
								</div>
							</div>
						</Card>
					)}
					{noAccount && (
						<Card className="lg:w-[36vw] sm:w-[60vw] w-[90vw] border-2 p-10 h-fit">
							<div className="text-center">
								<h1 className="font-semibold text-md sm:text-lg text-foreground text-pretty">Please contact your instructor to gain access to the class and payment options</h1>
							</div>
						</Card>
					)}
				</>
			)}
			{loggedIn && noInvoiceFound && (
				<Card className="lg:w-[36vw] sm:w-[60vw] w-[90vw] border-2 p-10 h-fit">
					<div className="text-center">
						<h1 className="font-semibold text-md sm:text-lg text-foreground text-pretty">No Invoice Found</h1>
						<p className="text-sm text-gray-500">Please contact your instructor for more information</p>
					</div>
				</Card>
			)}
			{loggedIn && !noInvoiceFound && invoice !== null && classDetails !== null && teacherDetails !== null && !hasPaid && (
				<>
					<Card className="lg:w-[36vw] sm:w-[60vw] w-[90vw] border-2 border-black h-fit">
						<CardHeader className="bg-primary text-primary-foreground p-6 flex justify-between items-center text-center">
							<div className="space-y-1">
								<div className="font-semibold">{classDetails.name}</div>
								<div>{teacherDetails.first_name} {teacherDetails.last_name}</div>
							</div>
							<div className="text-4xl font-bold">&#8377;{invoice.amount}</div>
						</CardHeader>
						<CardContent className="p-6 grid gap-4">
							<div className="flex justify-between">
								<div className="text-muted-foreground">Invoice Date</div>
								<div>{date}</div>
							</div>
							<Separator />
							<div className="flex justify-center">
								<Link href={link} className="block" prefetch={false}>
									<QRCodeSVG value={link}/>
								</Link>
							</div>
							<div className="text-center text-muted-foreground">Scan or click the QR code to make a UPI payment</div>
						</CardContent>
					</Card>
					<Button className="bg-green-600 mt-6 hover:bg-green-700" onClick={handlePaid} disabled={!paymentConfirmActive}>I Have Paid!</Button>
					<div className="text-center text-muted-foreground pt-2">After paying, return to this link and click on the button above</div>
				</>
			)}
			{loggedIn && hasPaid && !hasConfirmed && (
				<Card className="lg:w-[36vw] sm:w-[60vw] w-[90vw] border-2 p-10 h-fit">
					<div className="text-center">
						<h1 className="font-semibold text-md sm:text-lg text-foreground text-pretty">Payment Complete!</h1>
						<p className="text-sm text-gray-500 pt-2">Thank you for paying! We will email you a confirmation once your instructor confirms receiving the payment.</p>
					</div>
				</Card>
			)}
			{loggedIn && hasPaid && hasConfirmed && (
				<Card className="lg:w-[36vw] sm:w-[60vw] w-[90vw] border-2 p-10 h-fit">
					<div className="text-center">
						<h1 className="font-semibold text-md sm:text-lg text-foreground text-pretty">Payment Complete!</h1>
						<p className="text-sm text-gray-500 pt-2">Your payment has been confirmed by your instructor. Please look in your email for the confirmation</p>
					</div>
				</Card>
			)}
		</div>
	)
}

export default Payments
