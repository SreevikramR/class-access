"use client"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignupPage() {
    const [isTeacher, setIsTeacher] = useState(false)
    const [isStudent, setIsStudent] = useState(false)

    function handleStudentClicked () {
        setIsStudent(true)
        setIsTeacher(false)
    }

    function handleTeacherClicked () {
        setIsTeacher(true)
        setIsStudent(false)
    }

    return (
        <div className="w-full h-screen lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
            <div className="flex items-center justify-center py-12">
                <div className="mx-auto grid w-[350px] gap-8">
                    <div className="grid gap-2 text-center">
                        <h1 className="text-3xl font-bold">Sign Up</h1>
                        <p className="text-balance text-muted-foreground">
                            Enter your email below to create a new account
                        </p>
                    </div>
                    <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="first-name">First Name</Label>
                                <Input
                                    id="first-name"
                                    type="text"
                                    placeholder="John"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="last-name">Last Name</Label>
                                <Input
                                    id="last-name"
                                    type="text"
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="email@example.com"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                            </div>
                            <Input id="password" placeholder="&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;" type="password" required />
                        </div>
                        <div className="grid gap-2">
                            <Label>I am a...</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" className={`w-full ${isStudent ? "border-blue-500 border-2" : "border-gray-300"}`} onClick={handleStudentClicked}>
                                    Student
                                </Button>
                                <Button variant="outline" className={`w-full ${isTeacher ? "border-blue-500 border-2" : "border-gray-300"}`} onClick={handleTeacherClicked}>
                                    Teacher
                                </Button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full">
                            Sign Up
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
                        Have an account?{" "}
                        <Link href="/login" className="underline">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
            <div className="hidden bg-muted lg:block">
                <div className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale bg-slate-100">
                </div>
            </div>
        </div>
    )
}
