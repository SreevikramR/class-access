"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import supabaseClient from "@/components/util_function/supabaseCilent"

export default function LoginPage() {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)

	const handleLogin = async (e) => {
		e.preventDefault()
		setLoading(true)
		setError(null)
		console.log("clicked")

		const { user, error } = await supabaseClient.auth.signInWithPassword({
			email,
			password,
		})
		if (error) {
			console.log(error)
			setError(error.message)
			setLoading(false)
		} else {
			console.log("logged in")
			window.location.href = "/dashboard"
		}
	}

	return (
		<div className="w-full h-screen lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
			<div className="hidden bg-muted lg:block">
				<div className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale bg-slate-100">
				</div>
			</div>
			<div className="flex items-center justify-center py-12">
				<div className="mx-auto grid w-[350px] gap-6">
					<div className="grid gap-2 text-center">
						<h1 className="text-3xl font-bold">Login</h1>
						<p className="text-balance text-muted-foreground">
							Enter your email below to login to your account
						</p>
					</div>
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
						<Button variant="outline" className="w-full">
							Google
						</Button>
					</div>
					<div className="mt-4 text-center text-sm">
						Don&apos;t have an account?{" "}
						<Link href="/signup" className="underline">
							Sign up
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}
