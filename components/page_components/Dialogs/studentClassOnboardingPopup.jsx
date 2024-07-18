"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { supabaseClient } from "@/components/util_function/supabaseCilent"
import { toast } from "@/components/ui/use-toast"
import { Card } from "@/components/ui/card"
import fetchTimeout from "@/components/util_function/fetch"
//
export default function StudentClassOnboardingPopup({ isOpen, setIsOpen }) {
    const [step, setStep] = useState(0)
    const [email, setEmail] = useState("")
    const [loginPassword, setLoginPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        if (!email || !loginPassword) {
            toast({
                title: 'Error',
                description: "Please enter both email and password",
                variant: "destructive"
            });
            return;
        }

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: loginPassword,
            });

            if (error) throw error;
            if (data.user) {
                toast({
                    title: 'Success',
                    description: "Logged in successfully",
                    variant: "default"
                });
                setIsOpen(false);
            }
        } catch (error) {
            console.error("Login error:", error);
            toast({
                title: 'Login Failed',
                description: error.message,
                variant: "destructive"
            });
        }
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

	useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabaseClient.auth.getUser();
            if (user) {
                setIsOpen(false);
            }
        };
        checkUser();
    }, []);

    const _login = () => (
        <Card className="w-fill border-0">
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
                    <div className='sm:text-md text-sm cursor-pointer text-blue-700 underline w-fit' onClick={() => setStep(1)}>Don&apos;t have an Account?</div>
                </div>
            </div>
        </Card>
    )

    const handlePasswordReset = async () => {
        if (loading) return;
        setLoading(true)
        const controller = new AbortController()
        const { signal } = controller;

        try{
            const response = await fetchTimeout(`/api/users/forgot_password`, 5500, {
                signal,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "email": "sreevikram.r@tamu.edu"
                },
            });
            if (response.status !== 200) {
                toast({
                    title: 'Password Reset Failed',
                    description: "Please try again later",
                    variant: "destructive"
                });
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

    const _forgotPassword = () => {
        return (
            <Card className="w-fill border-0">
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
                        <div className='sm:text-md text-sm cursor-pointer text-blue-700 underline w-fit' onClick={() => setStep(1)}>Back to login</div>
                    </div>
                </div>
            </Card>
        )
    }

    const _passwordLinkSent = () => {
        return (
            <Card className="w-fill border-0">
                <div className="text-center">
                    <h1 className="font-semibold text-lg sm:text-xl text-foreground pt-6 pb-4 text-pretty">Please check your email for a password reset link</h1>
                </div>
                <Button type="submit" onClick={() => setStep(0)} className="w-full mt-4">
                    Sounds Good!
                </Button>
            </Card>
        )
    }

    const noAccount = () => {
        return (
            <Card className="w-fill border-0">
                <h1 className="text-pretty">Please Look for an account activation E-Mail, if you don&#39;t have one, please request your teacher to resend an invite</h1>
                <Button type="submit" onClick={() => setStep(0)} className="w-full mt-6">
                    Back
                </Button>
            </Card>
        )
    }

    return (
        <Dialog open={isOpen}>
            <DialogContent className="lg:w-[36vw] sm:w-[60vw] w-[90vw]">
                {step === 0 && _login()}
                {step === 1 && noAccount()}
                {step === 2 && _forgotPassword()}
                {step === 3 && _passwordLinkSent()}
            </DialogContent>
        </Dialog>
    )
}
