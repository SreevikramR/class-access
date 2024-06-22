"use client"
import React, { useState } from 'react'
import Header from '@/components/page_components/header'
import Footer from '@/components/page_components/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const ClassesPage = () => {
    const [selectedDays, setSelectedDays] = useState(["M", "W", "F"])

    const _classCard = () => {
        return (
            <div className="bg-background rounded-lg border p-4 grid gap-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium">Web Development 101</h3>
                        <p>
                            <div className="flex items-center justify-center gap-2">
                                {["M", "T", "W", "Th", "F", "Sa", "Su"].map((day) => (
                                    <span
                                        key={day}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${selectedDays.includes(day)
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-white border-2 border-muted-forground text-muted-foreground"
                                            }`}
                                    // onClick={() => {
                                    //     if (selectedDays.includes(day)) {
                                    //         setSelectedDays(selectedDays.filter((d) => d !== day))
                                    //     } else {
                                    //         setSelectedDays([...selectedDays, day])
                                    //     }
                                    // }}
                                    >
                                        {day}
                                    </span>
                                ))}
                            </div>
                            Class Schedule: 6:00 PM - 8:00 PM
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm">Start Class</Button>
                        <Button variant="outline" size="sm">
                            Manage Class
                        </Button>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="text-muted-foreground text-sm">25 students enrolled</div>
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
            <main className="flex-1 px-4 py-8 sm:px-6 grid gap-8">
                <section>
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold mb-4">Classes</h2>
                        <Button size="sm">Create New Class</Button>
                    </div>
                    <div className="grid gap-4">
                        <_classCard />
                        <_classCard />
                        <_classCard />
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}

export default ClassesPage