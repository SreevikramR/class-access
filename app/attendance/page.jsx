// Page.js

"use client"
import React from 'react'
import Header from '@/components/page_components/header'
import Footer from '@/components/page_components/footer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CircleCheckBig, ClipboardList } from 'lucide-react'
import MarkAttendance from '@/components/page_components/attendancePage/MarkAttendance'
import AuthWrapper from '@/components/page_components/authWrapper'

const Page = () => {
    return (
        <AuthWrapper>
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className='flex-1 bg-gray-100 p-10 pt-8'>
                    <Tabs defaultValue="mark">
                        <TabsList>
                            <TabsTrigger value="mark" className="">Mark Attendance<CircleCheckBig className='ml-2 w-4 h-4' /></TabsTrigger>
                            <TabsTrigger value="view" className="ml-4">View Attendance<ClipboardList className='ml-2 w-4 h-4'/></TabsTrigger>
                        </TabsList>
                        <TabsContent value="mark" className="w-full p-1 pt-2">
                            <MarkAttendance />
                        </TabsContent>
                        <TabsContent value="view">
                            {/* Placeholder for future View Attendance component */}
                            <div>View Attendance functionality will be implemented here.</div>
                        </TabsContent>
                    </Tabs>
                </main>
                <Footer />
            </div>
        </AuthWrapper>
    )
}

export default Page