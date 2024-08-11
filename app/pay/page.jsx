"use client"
import React, { useEffect, useState } from 'react'
import LoadingOverlay from '@/components/page_components/loadingOverlay';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { supabaseClient } from '@/components/util_function/supabaseCilent';
import { useToast } from '@/components/ui/use-toast';
import { useSearchParams } from 'next/navigation';

const Payments = () => {
	const [loggedIn, setLoggedIn] = useState(false);
	const [invoice, setInvoice] = useState(null);
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();

	// Login States
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [noAccount, setNoAccount] = useState(false);
	const [noInvoiceFound, setNoInvoiceFound] = useState(false);
	const [teacherDetails, setTeacherDetails] = useState(null);
	const [classDetails, setClassDetails] = useState(null);

	const searchParams = useSearchParams()
	const invoiceId = searchParams.get('invoice_id')

	useEffect(() => {
		checkLogin();
	}, [])

	const fetchInvoiceDetails = async () => {
		setLoading(true)
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
			setTeacherDetails(teacherData[0]);
		}
		setLoading(false);
	}

	const checkLogin = async () => {
		const user = await supabaseClient.auth.getUser()
		if (user.data.user) {
			setLoggedIn(true);
			fetchInvoiceDetails();
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
		<>
			{loading && <LoadingOverlay />}
			{!loggedIn && (
				<>
					{!noAccount && (
						<Card className="lg:w-[36vw] sm:w-[60vw] w-[90vw] border-2">
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
						<Card className="lg:w-[36vw] sm:w-[60vw] w-[90vw] border-2 p-10">
							<div className="text-center">
								<h1 className="font-semibold text-md sm:text-lg text-foreground text-pretty">Please contact your instructor to gain access to the class and payment options</h1>
							</div>
						</Card>
					)}
				</>
			)}
			{loggedIn && noInvoiceFound && (
				<Card className="lg:w-[36vw] sm:w-[60vw] w-[90vw] border-2 p-10">
					<div className="text-center">
						<h1 className="font-semibold text-md sm:text-lg text-foreground text-pretty">No Invoice Found</h1>
						<p className="text-sm text-gray-500">Please contact your instructor for more information</p>
					</div>
				</Card>
			)}
			{loggedIn && !noInvoiceFound && invoice !== null && classDetails !== null && teacherDetails !== null && (
				<Card className="lg:w-[36vw] sm:w-[60vw] w-[90vw] border-2">
					<div className="text-center">
						<h1 className="font-semibold text-md sm:text-lg text-foreground text-pretty">Invoice Details</h1>
					</div>
					<div className="rounded-lg bg-white p-3 pt-0">
						<div className="grid gap-4">
							<div className="grid gap-2">
								<Label htmlFor="amount">Amount: { invoice.amount }</Label>
								<Label htmlFor="className">Class: { classDetails.name }</Label>
							</div>
						</div>
					</div>
				</Card>
			)}
		</>
	)
}

export default Payments
