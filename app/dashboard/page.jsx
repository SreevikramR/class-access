"use client"
import React, {useEffect, useState} from 'react'
import {supabaseClient} from '@/components/util_function/supabaseCilent'
import Header from '@/components/page_components/header'
import Footer from '@/components/page_components/footer'
import {Button} from '@/components/ui/button'
import {Copy, PlusCircle, Share2} from 'lucide-react';
import CreateClassPopup from '@/components/page_components/Dialogs/createClassPopup'
import AuthWrapper from '@/components/page_components/authWrapper'
import {useRouter} from 'next/navigation';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from '@/components/ui/input';
import {toast} from "@/components/ui/use-toast";


const convertToLocalTime = (timeString) => {
	try {
		// Parse the time string
		const [time, offset] = timeString.split(/[+-]/);
		const [hours, minutes, seconds] = time.split(':').map(Number);

		// Parse the offset correctly
		const [offsetHours, offsetMinutes] = offset.split(':').map(Number);
		const totalOffsetMinutes = offsetHours * 60 + (offsetMinutes || 0);
		const offsetSign = timeString.includes('+') ? 1 : -1;

		// Create a Date object for the current date in UTC
		const utcDate = new Date();
		utcDate.setUTCHours(hours, minutes, seconds, 0);

		// Convert to GMT by adjusting for the input offset
		utcDate.setUTCMinutes(utcDate.getUTCMinutes() - offsetSign * totalOffsetMinutes);

		// Convert to local time
		const localDate = new Date(utcDate.toLocaleString('en-US', {timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone}));

		// Format the output
		const options = {
			hour: 'numeric',
			minute: 'numeric',
			hour12: true,
			timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
		};

		return new Intl.DateTimeFormat('en-US', options).format(localDate);
	} catch (error) {
		console.error('Error converting time:', error);
		return 'Invalid Time';
	}
};
const Dashboard = ({classInfo}) => {
	const [isOpen, setIsOpen] = useState(false)
	const [classes, setClasses] = useState([])
	const [loading, setLoading] = useState(false)
	const router = useRouter()
	const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
	const [copyData, setCopyData] = useState(null)

	useEffect(() => {
		fetchClasses()
	}, [])

	useEffect(() => {
		if (!isOpen) {
			fetchClasses();
		}
	}, [isOpen]);

	const fetchClasses = async () => {
		setLoading(true)
		const {data, error} = await supabaseClient
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

	const handleCopyLink = () => {
		const shareLink = `${window.location.origin}/join/${copyData.class_code}`;
		navigator.clipboard.writeText(copyData.classLink).then(() => {
			toast({
				title: "Link copied!",
				description: "The class link has been copied to your clipboard.",
			});
		});
		setIsShareDialogOpen(false);
	};

	const handleShareClick = (classData) => {
		console.log(classData)
		setCopyData(classData);
		setIsShareDialogOpen(true)
	}

	const _classCard = (classInfo) => {
		const classCode = classInfo.class_code
		const classLink = `${window.location.origin}/join/${classCode}`

		let classData = {}
		classData.classCode = classCode
		classData.classLink = classLink

		const handleStartClass = () => {
			if (classInfo.meeting_link) {
				window.open(classInfo.meeting_link, '_blank');
			} else {
				toast({
					title: "No Zoom link available",
					description: "The Zoom link for this class is not set.",
					variant: "destructive",
				});
			}
		};

		return (
			<div key={classInfo.id} className="bg-background rounded-lg border p-4 grid gap-2">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="font-medium pb-2">{classInfo.name}</h3>
						<div>
							<div className="flex items-center justify-center gap-2">
								{["M", "Tu", "W", "Th", "F", "Sa", "Su"].map((day) => (
									<span
										key={day}
										className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${classInfo.days.includes(day)
											? "bg-primary text-primary-foreground"
											: "bg-white border-2 border-muted-forground text-muted-foreground"
										}`}
									>
										{day}
									</span>
								))}
							</div>
							<div className="pt-2">
								<span> Class Schedule:</span><span
									className='font-light'> {convertToLocalTime(classInfo.start_time)} to {convertToLocalTime(classInfo.end_time)}</span>
							</div>
						</div>
					</div>
					<div className="flex gap-2">
						<Button size="sm" onClick={handleStartClass}>Start Class</Button>
						<Button variant="outline" size="sm"
						        onClick={() => router.push(`/manage/${classInfo.class_code}`)}>
							Manage Class
						</Button>
					</div>
				</div>
				<div className="flex items-center justify-between">
					<div className="text-muted-foreground text-sm">{classInfo.student_proxy_ids.length || 0} students
						enrolled
					</div>
					<span
						className="text-sm text-muted-foreground hover:text-blue-500 hover:cursor-pointer flex flex-row justify-center"
						onClick={() => handleShareClick(classData)}>
                        Share Link <Share2 className="h-4 w-4 ml-1"/>
					</span>
				</div>
			</div>
		)
	}

	return (
		<AuthWrapper>
			<div className="flex flex-col min-h-screen">
				<Header/>
				<Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen} className="bg-white">
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Share Class Link</DialogTitle>
							<DialogDescription>Copy the link below to share this class</DialogDescription>
						</DialogHeader>
						<div className="flex items-center space-x-2">
							<Input
								readOnly
								value={copyData?.classLink}
							/>
							<Button onClick={handleCopyLink} size="sm">
								<Copy className="h-4 w-4 mr-2"/>
								Copy
							</Button>
						</div>
					</DialogContent>
				</Dialog>
				<main className="flex-1 bg-gray-100 px-4 py-8 sm:px-6 grid gap-8">
					<section>
						<CreateClassPopup isOpen={isOpen} setIsOpen={setIsOpen}/>
						<div className="flex items-center justify-between my-2">
							<h2 className="text-2xl font-semibold px-2">My Classes</h2>
							<Button size="sm" className="h-7 gap-1 hover:bg-zinc-700">
								<PlusCircle className="h-3.5 w-3.5"/>
								<span className="sr-only sm:not-sr-only sm:whitespace-nowrap"
								      onClick={() => setIsOpen(true)}>
                                    Add Class
								</span>
							</Button>
						</div>
						<div className="grid gap-4">
							{classes.length === 0 &&
								<>
									{loading && <div
										className='flex flex-col bg-white border-2 m-2 rounded-xl w-full h-[65vh] items-center justify-center'>Loading...</div>}
									{!loading && <div
										className='flex flex-col bg-white border-2 m-2 rounded-xl w-full h-[65vh] items-center justify-center'>
										<div className='text-lg mb-3'>No Classes Found!</div>
										<div className='flex flex-row items-center text-muted-foreground'>Would you like
											to add a new class?
										</div>
										<div
											className='flex flex-row ml-2 hover:bg-black hover:text-white items-center border-2 border-black hover:cursor-pointer p-1 px-2 rounded-lg mt-2'
											onClick={() => setIsOpen(true)}><PlusCircle className='h-4 w-4 mr-1'/>Add
											Class
										</div>
									</div>}
								</>}
							{classes.map((classInfo) => _classCard(classInfo))}
						</div>
					</section>
				</main>
				<Footer/>
			</div>
		</AuthWrapper>
	)
}

export default Dashboard;
