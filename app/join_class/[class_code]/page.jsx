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
    const [classDetails, setClassDetails] = useState(null)
	const [teacherName, setTeacherName] = useState("")
    const { toast } = useToast()

    useEffect(() => {
        fetchUser()
        fetchClassDetails()
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
    const fetchClassDetails = async () => {
        const { data: classData, error: classError } = await supabaseClient
            .from('classes')
            .select('*')
            .eq('class_code', class_code)
            .single()

        if (classError) {
            console.log("Class does not exist")
            return
        }
        setClassDetails(classData)
        if (classData.teacher_id) {
            const { data: teacherData, error: teacherError } = await supabaseClient
                .from('teachers')
                .select('first_name, last_name')
                .eq('id', classData.teacher_id)
                .single()

            if (teacherError) {
                console.error("Error fetching teacher details:", teacherError)
            } else if (teacherData) {
                setTeacherName(`${teacherData.first_name} ${teacherData.last_name}`)
            }
        }
    }

	    const formatTime = (start, end) => {
        const formatTimeString = (timeString) => {
            const date = new Date(`2000-01-01T${timeString}`)
            return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
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

   const handleComplete = () => {
        setJoinedClass(true)
    }

    return (
        <main className="flex flex-col items-center justify-center h-screen">
            {joinedClass && _joinedClass()}
            {!classDetails && (
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
            {!joinedClass && classDetails && (
                <div className="lg:w-[46vw] sm:w-[60vw] w-[90vw]">
                    {!isLoggedIn && (
                        <StudentOnboardingPopup isOpen={isOpen} setIsOpen={setIsOpen} />
                    )}
                    <Card className="w-full p-6 space-y-4">
                        <div className="flex flex-col items-center space-y-2">
                            <div className="inline-block rounded-lg px-3 py-1 text-xs sm:text-sm font-medium text-pretty">
                                You have been invited to join
                            </div>
                            <h2 className="sm:text-2xl text-lg text-center font-bold text-pretty">{classDetails.name}</h2>
                            <p className="text-muted-foreground text-xs sm:text-base">
                                Taught by {teacherName}
                            </p>
                            <p className="text-muted-foreground sm:text-base text-xs text-pretty">
                                {formatDays(classDetails.days)}, {formatTime(classDetails.start_time, classDetails.end_time)}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="w-full">
                                Decline
                            </Button>
                            <Button className="w-full" onClick={() => setIsOpen(true)}>Join Class</Button>
                        </div>
                    </Card>
                </div>
            )}
        </main>
    )
}