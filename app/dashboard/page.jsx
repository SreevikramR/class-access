"use client"
import React, { useState, useEffect } from 'react'
import { supabaseClient } from '@/components/util_function/supabaseCilent'
import Header from '@/components/page_components/header'
import Footer from '@/components/page_components/footer'
import { Button } from '@/components/ui/button'
import { PlusCircle, Share2, Copy } from 'lucide-react';
import Link from 'next/link'
import CreateClassPopup from '@/components/page_components/Dialogs/createClassPopup'
import AuthWrapper from '@/components/page_components/authWrapper'

import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import {toast} from "@/components/ui/use-toast";
const convertTo12HourFormat = (time) => {
	const [hours, minutes] = time.split(':');
	const period = hours >= 12 ? 'PM' : 'AM';
	const adjustedHours = hours % 12 || 12; // Convert '0' to '12'
	return `${adjustedHours}:${minutes} ${period}`;
};

const Dashboard = ({ classInfo }) => {
	const [isOpen, setIsOpen] = useState(false)
	const [classes, setClasses] = useState([])
	const [loading, setLoading] = useState(false)
    const router = useRouter()
	const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
	const [selectedClassCode, setSelectedClassCode] = useState(null)
	useEffect(() => {
		fetchClasses()
	}, [])

	useEffect(() => {
		fetchClasses()
	}, [isOpen])

	const fetchClasses = async () => {
		setLoading(true)
		const { data, error } = await supabaseClient
			.from('classes')
			.select('*')
			.eq('teacher_id', (await supabaseClient.auth.getUser()).data.user.id)

		if (error) {
			console.error('Error fetching classes:', error)
		} else {
			setClasses(data)
		}
		console.log(data)
		setLoading(false)
	}

	const _classCard = (classInfo) => {


    const handleStartClass = () => {
        if (classInfo.zoom_link) {
            window.open(classInfo.zoom_link, '_blank');
        } else {
            toast({
                title: "No Zoom link available",
                description: "The Zoom link for this class is not set.",
                variant: "destructive",
            });
        }
    };
	const handleCopyLink = () => {
        const shareLink = `${window.location.origin}/join/${classInfo.class_code}`;
        navigator.clipboard.writeText(shareLink).then(() => {
            toast({

                title: "Link copied!",
                description: "The class link has been copied to your clipboard.",
            });
        });
    };
		return(
        <div key={classInfo.id} className="bg-background rounded-lg border p-4 grid gap-2">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-medium pb-2">{classInfo.name}</h3>
                    <div>
                        <div className="flex items-center justify-center gap-2">
                            {["M", "T", "W", "Th", "F", "Sa", "Su"].map((day) => (
                                <span
                                    key={day}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                        classInfo.days.includes(day)
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-white border-2 border-muted-forground text-muted-foreground"
                                    }`}
                                >
                                    {day}
                                </span>
                            ))}
                        </div>
                        <div className="pt-2">
                            <span> Class Schedule:</span><span className='font-light'> {convertTo12HourFormat(classInfo.start_time)} to {convertTo12HourFormat(classInfo.end_time)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" onClick={handleStartClass}>Start Class</Button>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/manage/${classInfo.class_code}`)}>
                        Manage Class
                    </Button>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <div className="text-muted-foreground text-sm">{classInfo.students.length} students enrolled</div>
                <span className="text-sm text-muted-foreground hover:text-blue-500 hover:cursor-pointer flex flex-row justify-center" onClick={() => setIsShareDialogOpen(true)}>
                    Share Link <Share2 className="h-4 w-4 ml-1" />
                </span>
            </div>

            <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Share Class Link</DialogTitle>
                        <DialogDescription>Copy the link below to share this class</DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2">
                        <Input
                            readOnly
                            value={classInfo.zoom_link}
                        />
                        <Button onClick={handleCopyLink} size="sm">
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
	}

	return (
		<AuthWrapper>
			<div className="flex flex-col min-h-screen">
				<Header />
				<main className="flex-1 bg-gray-100 px-4 py-8 sm:px-6 grid gap-8">
					<section>
						<CreateClassPopup isOpen={isOpen} setIsOpen={setIsOpen} />
						<div className="flex items-center justify-between my-2">
							<h2 className="text-2xl font-semibold px-2">My Classes</h2>
							<Button size="sm" className="h-7 gap-1 hover:bg-zinc-700">
								<PlusCircle className="h-3.5 w-3.5" />
								<span className="sr-only sm:not-sr-only sm:whitespace-nowrap" onClick={() => setIsOpen(true)}>
									Add Class
								</span>
							</Button>
						</div>
						<div className="grid gap-4">
							{classes.length === 0 &&
							<>
								{loading && <div className='flex flex-col bg-white border-2 m-2 rounded-xl w-full h-[65vh] items-center justify-center'>Loading...</div>}
								{!loading && <div className='flex flex-col bg-white border-2 m-2 rounded-xl w-full h-[65vh] items-center justify-center'>
									<div className='text-lg mb-3'>No Classes Found!</div>
									<div className='flex flex-row items-center text-muted-foreground'>Would you like to add a new class?</div>
									<div className='flex flex-row ml-2 hover:bg-black hover:text-white items-center border-2 border-black hover:cursor-pointer p-1 px-2 rounded-lg mt-2' onClick={() => setIsOpen(true)}><PlusCircle className='h-4 w-4 mr-1' />Add Class</div>
								</div>}
							</>}
							{classes.map((classInfo) => _classCard(classInfo))}
						</div>
					</section>
				</main>
				<Footer />
			</div>
		</AuthWrapper>
	)
}

export default Dashboard;
