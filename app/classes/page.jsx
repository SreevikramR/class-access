// ClassesPage.jsx
"use client"
import React, { useState, useEffect } from 'react'
import { supabaseClient } from '@/components/util_function/supabaseCilent'
import Header from '@/components/page_components/header'
import Footer from '@/components/page_components/footer'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import CreateClassPopup from '@/components/page_components/createClassPopup'

const ClassesPage = ({ teacherId }) => {
    const [selectedDays, setSelectedDays] = useState(["M", "W", "F"])
    const [isOpen, setIsOpen] = useState(false)
    const [classes, setClasses] = useState([])

    useEffect(() => {
        const fetchClasses = async () => {
            const { data, error } = await supabaseClient
                .from('classes')
                .select('*')
                .eq('teacher_id', (await supabaseClient.auth.getUser()).data.user.id)
                
            if (error) {
                console.error('Error fetching classes:', error)
            } else {
                setClasses(data)
            }
        }

        fetchClasses()
    }, [teacherId])

    const _classCard = (classInfo) => {
        return (
            <div key={classInfo.id} className="bg-background rounded-lg border p-4 grid gap-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium">{classInfo.name}</h3>
                        <div>
                            <div className="flex items-center justify-center gap-2">
                                {["M", "T", "W", "Th", "F", "Sa", "Su"].map((day) => (
                                    <span
                                        key={day}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${selectedDays.includes(day)
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-white border-2 border-muted-forground text-muted-foreground"
                                            }`}
                                    >
                                        {day}
                                    </span>
                                ))}
                            </div>
                            Class Schedule: {classInfo.start_time} to {classInfo.end_time}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm">Start Class</Button>
                        <Button variant="outline" size="sm">
                            Manage Class
                        </Button>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="text-muted-foreground text-sm">{classInfo.students.length} students enrolled</div>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-muted" prefetch={false}>
                        Copy Link
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 bg-gray-100 px-4 py-8 sm:px-6 grid gap-8">
                <section>
                    <CreateClassPopup isOpen={isOpen} setIsOpen={setIsOpen} />
                    <div className="flex items-center justify-between my-2">
                        <h2 className="text-2xl font-semibold px-2">My Classes</h2>
                        <Button size="sm" className="h-7 gap-1">
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap" onClick={() => setIsOpen(true)}>
                                Add Class
                            </span>
                        </Button>
                    </div>
                    <div className="grid gap-4">
                        {classes.map((classInfo) => _classCard(classInfo))}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}

export default ClassesPage
