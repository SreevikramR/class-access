"use client"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import supabaseCilent from "@/components/util_function/supabaseCilent"

export default function SignupPage() {
    const [isTeacher, setIsTeacher] = useState(false)
    const [isStudent, setIsStudent] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    async function handleSignUp () {
        // if (loading) return
        // if (email == "" || password == "" || firstName == "" || lastName == "" || (!isStudent && !isTeacher)) {
        //     toast({
        //         variant: "destructive",
        //         title: "Missing Inofrmation",
        //         description: "Please fill all the fields.",
        //         duration: 3000
        //     })
        //     return
        // }
        // setLoading(true)

        // let { data, error } = await supabaseCilent.auth.signUp({
        //     email: email,
        //     password: password
        // })

        // if (error) {
        //     if (error.message == "User already registered") {
        //         toast({
        //             variant: "destructive",
        //             title: "User Already Registered",
        //             description: "Please login with your credentials.",
        //             duration: 5000
        //         })
        //     } else {
        //         toast({
        //             variant: "destructive",
        //             title: `Could not create user, Please try again later`,
        //             description: `Error Code: ${error.code}, Msg: ${error.message}. Please contact support for more information.`,
        //             duration: 8000
        //         })
        //     }
        //     setLoading(false)
        //     return
        // }
        
        // let role = ""
        // if (isStudent) {
        //     role = "student"
        // } else if (isTeacher) {
        //     role = "teacher"
        // }

        // let { insertData, insertError } = await supabaseCilent.from("users").insert([
        //     {
        //         email: email,
        //         first_name: firstName,
        //         last_name: lastName,
        //         role: role
        //     }
        // ]).select()

        // console.log(insertData)

        // if (insertError) {
        //     toast({
        //         variant: "destructive",
        //         title: `Could not create user, Please try again later`,
        //         description: `Error Code: ${insertError.code}, Error Message ${error.message}. Please contact support for more information.`,
        //         duration: 8000
        //     })
        //     setLoading(false)
        //     return
        // }

        // setLoading(false)
    }

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
                        <p className="text-balance text-muted-foreground mt-4">
                            Please contact us at myclassaccess@gmail.com to get started
                        </p>
                    </div>
                    {/* <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="first-name">First Name</Label>
                                <Input
                                    id="first-name"
                                    type="text"
                                    placeholder="John"
                                    required
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="last-name">Last Name</Label>
                                <Input
                                    id="last-name"
                                    type="text"
                                    placeholder="Doe"
                                    required
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="jd@email.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                            </div>
                            <Input id="password" onChange={(e) => setPassword(e.target.value)} value={password} placeholder="&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;" type="password" required />
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
                        <Button type="submit" className={`w-full ${loading ? "cursor-progress" : ""}`} onClick={handleSignUp}>
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
                    </div> */}
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
