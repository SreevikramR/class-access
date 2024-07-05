"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CircleArrowRight, Phone, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { getPhoneData, PhoneInput } from "@/components/ui/phoneInputComponents"
import { supabaseClient } from "@/components/util_function/supabaseCilent"
import { toast } from "@/components/ui/use-toast"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function StudentOnboardingPopup({ isOpen, setIsOpen, onComplete, classCode }) {
    const [step, setStep] = useState(0)
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [phone, setPhone] = useState("+91")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const phoneData = getPhoneData(phone)

    const [email, setEmail] = useState("")
    const [loginPassword, setLoginPassword] = useState("")

    const handleLogin = async () => {}
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

    const handleComplete = async () => {
        if (password !== confirmPassword) {
            toast({
                variant: 'destructive',
                title: "passwords don't match",
                description: "Enter your password",
                duration: 3000,
            });
            return;
        }
        if (password.length < 6) {
            toast({
                variant: 'destructive',
                title: "Password too short",
                description: "Password must be at least 6 characters long.",
                duration: 3000,
            });
            return;
        }

        try {
            const user = await supabaseClient.auth.getUser();
            const studentData = {
                first_name: firstName,
                last_name: lastName,
                details_added: true,
                phone: phoneData.phoneNumber
            };
            console.log("Data to be updated:", studentData);

            console.log("Existing row found. Attempting to update.");
            const { data: updateData, error: updateError } = await supabaseClient
                .from('students')
                .update(studentData)
                .eq('id', user.data.user.id)
                .select();

            if (updateError) {
                console.error("Error updating data:", updateError);
                throw updateError;
            }

            console.log("Update result:", updateData);

            const { data1, error2 } = await supabaseClient.auth.updateUser({
                password: password
            })

            if (error2) throw error2;

            toast({
                className: "bg-green-500 border-black border-2",
                title: "Done",
                duration: 3000,
            });
            setIsOpen(false);

        } catch (error) {
            console.error("Error saving student data:", error);
            toast({
                variant: 'destructive',
                title: "Failed to save",
                description: "Try again.",
                duration: 3000,
            });
        }
    };

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
                    <div className='sm:text-md text-sm cursor-pointer text-blue-700 underline w-fit' onClick={() => setStep(1)}>Don&apos;t have an Account?</div>
                </div>
            </div>
        </Card>
    )

    const _nameAndPassword = () => (
        <div>
            <DialogHeader>
                <DialogTitle>Welcome!</DialogTitle>
                <DialogDescription className="sm:text-xs text-pretty">Please create an account by entering your details below</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="sm:grid items-center sm:grid-cols-4 gap-4">
                    <Label htmlFor="first-name" className="text-right text-xs sm:text-base">
                        First Name
                    </Label>
                    <Input
                        id="first-name"
                        placeholder="Enter your first name"
                        className="col-span-3"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </div>
                <div className="sm:grid items-center sm:grid-cols-4 gap-4">
                    <Label htmlFor="last-name" className="text-right text-xs sm:text-base">
                        Last Name
                    </Label>
                    <Input
                        id="last-name"
                        placeholder="Enter your last name"
                        className="col-span-3"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </div>
            </div>
            <DialogFooter>
                <div className="flex sm:flex-row flex-col-reverse w-full justify-between mt-4">
                    <div className="flex flex-col">
                        <div className="text-sm text-muted-foreground mt-4 sm:mt-0">Already Have an Account?</div>
                        <div className="text-sm hover:cursor-pointer w-fit" onClick={() => setStep(0)}>Login</div>
                    </div>
                    <Button type="button" className="gap-2" onClick={() => { setStep(2) }}>Next<CircleArrowRight className="h-5 w-5" /></Button>
                </div>
            </DialogFooter>
        </div>
    )

    const _phoneAndJoin = () => (
        <div>
            <DialogHeader>
                <DialogTitle>Welcome!</DialogTitle>
                <DialogDescription>Please Confirm your phone number</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <PhoneInput value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="mb-10">
                <div className="text-sm mt-4 mb-2 text-muted-foreground">Please enter a new password for your account</div>
                <div className="sm:grid items-center sm:grid-cols-4 gap-4 mb-4">
                    <Label htmlFor="password" className="text-center">
                        Password
                    </Label>
                    <Input
                        id="password"
                        placeholder="Create a New Password"
                        className="col-span-3"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="sm:grid items-center sm:grid-cols-4 gap-4">
                    <Label htmlFor="confirm-password" className="text-center">
                        Re-enter Password
                    </Label>
                    <Input
                        id="confirm-password"
                        placeholder="Re-enter Password"
                        className="col-span-3"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
            </div>

            <DialogFooter>
                <div className='flex justify-between flex-wrap w-full'>
                    <Button className="border-slate-400 hover:border-black" variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button type="button" className="gap-2" onClick={handleComplete}>Complete<CheckCircle className="h-5 w-5" /></Button>
                </div>
            </DialogFooter>
        </div>
    )

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="lg:w-[36vw] sm:w-[60vw] w-[90vw]">
                {step === 0 && _login()}
                {step === 1 && _nameAndPassword()}
                {step === 2 && _phoneAndJoin()}
            </DialogContent>
        </Dialog>
    )
}
