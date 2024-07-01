"use client"
import { useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import StudentOnboardingPopup from "@/components/page_components/Dialogs/studentOnboardingPopup"
import { useState } from "react"
import { supabaseClient } from "@/components/util_function/supabaseCilent"
import fetchTimeout from "@/components/util_function/fetch"
import { useToast } from "@/components/ui/use-toast"

export default function Component({ params: { class_code }}) {
    const [isOpen, setIsOpen] = useState(false)
    const [joinedClass, setJoinedClass] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        fetchUser()
    }, [])

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

    const _joinedClass = () => {
        return (
            <Card className="flex flex-col items-center justify-center bg-background">
                <div className="max-w-md p-6 rounded-lg bg-card">
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <CircleCheckIcon className="text-green-500 size-12" />
                        <h1 className="text-3xl font-bold">You&#39;re all set!</h1>
                        <p className="text-muted-foreground">
                            Great! You&#39;ve successfully joined the class. Be sure to join at the scheduled time to participate.
                        </p>
                        <p className="text-muted-foreground">
                            Look for a link from your instructor to join the class.
                        </p>
                    </div>
                </div>
            </Card>
        )
    }

    const handleComplete = () => {
        setJoinedClass(true)
    }

    return (
        <main className="flex flex-col items-center justify-center h-screen">
            { joinedClass && _joinedClass()}
            { !joinedClass &&
                <div>
                    {!isLoggedIn && (
                        <StudentOnboardingPopup isOpen={isOpen} setIsOpen={setIsOpen} onComplete={handleComplete} classCode={class_code} />
                    )}
                    <Card className="w-full max-w-md p-6 space-y-4">
                        <div className="flex flex-col items-center space-y-2">
                            <div className="inline-block rounded-lg px-3 py-1 text-sm font-medium">
                                You&#39;ve been invited to join
                            </div>
                            <h2 className="text-2xl font-bold">Introduction to Web Development</h2>
                            <p className="text-muted-foreground">Taught by John Doe</p>
                            <p className="text-muted-foreground">Tuesdays and Thursdays, 7pm - 9pm</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="w-full">
                                Decline
                            </Button>
                            <Button className="w-full" onClick={() => setIsOpen(true)}>Join Class</Button>
                        </div>
                    </Card>
                </div>
            }
        </main>
    )
}