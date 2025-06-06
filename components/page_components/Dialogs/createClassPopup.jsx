"use client"
import React, {useEffect, useState} from 'react'
import {Label} from '@/components/ui/label'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Checkbox} from '@/components/ui/checkbox'
import {Input} from '@/components/ui/input'
import {Button} from '@/components/ui/button'
import {Textarea} from '@/components/ui/textarea'
import {CheckCircle, CircleArrowRight} from 'lucide-react'
import {Avatar, AvatarFallback} from '@/components/ui/avatar'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {supabaseClient} from '@/components/util_function/supabaseCilent'
import {useToast} from "@/components/ui/use-toast";
import fetchTimeout from "@/components/util_function/fetch";
import isEmail from 'validator/lib/isEmail'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const CreateClassPopup = ({isOpen, setIsOpen}) => {
	const [classCreationStep, setClassCreationStep] = useState(0)
	const [className, setClassName] = useState("")
	const [classDescription, setClassDescription] = useState("")
	const [selectedDays, setSelectedDays] = useState([])
	const [startTime, setStartTime] = useState({hour: "05", minute: "00", ampm: "PM"})
	const [endTime, setEndTime] = useState({hour: "06", minute: "00", ampm: "PM"})
	const [selectedStudents, setSelectedStudents] = useState([])
	const [loading, setLoading] = useState(false)
	const {toast} = useToast()
	const [students, setStudents] = useState([])
	const [newStudentEmail, setNewStudentEmail] = useState('')
	const [newStudentNotes, setNewStudentNotes] = useState('')
	const [meetingLink, setMeetingLink] = useState("")
	const [tempNewStudents, setTempNewStudents] = useState([]);
	const [meetingMedium, setMeetingMedium] = useState('Google Meet')

	const resetAllStates = () => {
		setClassName("")
		setClassDescription("")
		setSelectedDays([])
		setStartTime({hour: "05", minute: "00", ampm: "PM"})
		setEndTime({hour: "06", minute: "00", ampm: "PM"})
		setSelectedStudents([])
		setNewStudentEmail('')
		setNewStudentNotes('')
		setMeetingLink('')
		setClassCreationStep(0)
		setTempNewStudents([]);
		setMeetingMedium('Google Meet')
	}

	useEffect(() => {
		console.log(meetingMedium)
	}, [meetingMedium])

	const updateTeacherClassIds = async (teacherUUID) => {
		// Fetch all class IDs for the teacher
		const {data: classData, error: classError} = await supabaseClient
			.from('classes')
			.select('id')
			.eq('teacher_id', teacherUUID);

		if (classError) {
			console.log("Error fetching class data:", classError);
			return "Error";
		}

		// Extract class IDs into an array
		const classIds = classData.map(cls => cls.id);
		console.log(classIds);
		// Update the teacher's class_ids in the teachers table
		const {data: updateData, error: updateError} = await supabaseClient
			.from('teachers')
			.update({class_ids: classIds})
			.eq('id', teacherUUID)
			.select();

		if (updateError) {
			console.log("Error updating teacher's class_ids:", updateError);
			return "Error";
		}

		return "Success";
	};
	const generateRandomString = (length) => {
		const getRandomCharacter = () => {
			const characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
			return characters[Math.floor(Math.random() * characters.length)];
		}
		let result = '';
		for (let i = 0; i < length; i++) {
			result += getRandomCharacter();
		}
		return result;
	}


	const createGMeetLink = async () => {
		const { data } = await supabaseClient.auth.getSession()
		const signal2 = new AbortController().signal
		const response2 = await fetchTimeout("/api/google/retrieve_tokens", 5000, {
			signal: signal2,
			"method": "GET",
			"headers": {
				"Content-Type": "application/json",
				"jwt": data.session.access_token,
				"supabase_refresh": data.session.refresh_token
			},
		})
		const responseJson = await response2.json()
		const signal = new AbortController().signal
		const response = await fetchTimeout("/api/meetings/create/gmeet", 5000, {
			signal,
			"method": "POST",
			"headers": {
				"Content-Type": "application/json",
				"jwt": data.session.access_token,
				"provider_access_token": responseJson.data[0].access_token,
				"provider_refresh_token": responseJson.data[0].refresh_token
			},
		})
		const result = await response.json()
		return result.meetingLink
	}

	function getTimezoneOffset() {
		const offset = new Date().getTimezoneOffset();
		const absoluteOffset = Math.abs(offset);
		const hours = Math.floor(absoluteOffset / 60).toString().padStart(2, '0');
		const minutes = (absoluteOffset % 60).toString().padStart(2, '0');
		return `${offset > 0 ? '-' : '+'}${hours}:${minutes}`;
	}

	function createTimetzString(hours, minutes, ampm) {
		// Convert hours to 24-hour format
		let hour24 = parseInt(hours);
		if (ampm.toLowerCase() === 'pm' && hour24 !== 12) {
			hour24 += 12;
		} else if (ampm.toLowerCase() === 'am' && hour24 === 12) {
			hour24 = 0;
		}

		// Pad hours and minutes with zeros if needed
		const paddedHours = hour24.toString().padStart(2, '0');
		const paddedMinutes = minutes.toString().padStart(2, '0');

		// Get the timezone offset
		const timezoneOffset = getTimezoneOffset();

		// Create the time string in the format HH:MM:00±HH:MM
		const timeString = `${paddedHours}:${paddedMinutes}:00${timezoneOffset}`;

		return timeString;
	}

	const checkClassCode = async (code) => {
		const {data: classData, error: classError} = await supabaseClient.from('classes').select('id').eq('class_code', code);
		if (classError) {
			console.error('Error checking class code:', classError);
			return false;
		}
		if (classData.length === 0){
			return code;
		} else {
			const newCode = generateRandomString(6);
			return checkClassCode(newCode);
		}
	}

	const handleCreateClass = async () => {
		if (loading) return;
		setLoading(true)
		try {
			let updatedMeetingLink = meetingLink;
			const code = generateRandomString(6);

			if(meetingMedium == 'Google Meet'){
				const gMeetLink = await createGMeetLink()
				updatedMeetingLink = gMeetLink
			} else if (meetingMedium == 'In-Person') {
				updatedMeetingLink = 'In-Person'
			}


			const {data: {user}, error: authError} = await supabaseClient.auth.getUser();
			if (authError || !user) {
				console.error('Authentication error:', authError);
				toast({
					variant: 'destructive',
					title: "Failed to create class",
					description: "Authentication error. Please log in again.",
					duration: 3000
				});
				setLoading(false)
				return;
			}

			let startTimeTz = createTimetzString(startTime.hour, startTime.minute, startTime.ampm)
			let endTimeTz = createTimetzString(endTime.hour, endTime.minute, endTime.ampm)

			// Check if class code is unique
			const uniqueCode = await checkClassCode(code);
			if (!uniqueCode) {
				setLoading(false)
				return;
			}

			const classData = {
				name: className,
				description: classDescription,
				days: selectedDays,
				teacher_id: user.id,
				start_time: `${startTimeTz}`,
				end_time: `${endTimeTz}`,
				student_proxy_ids: selectedStudents.filter(s => !s.isNew).map(s => s.id),
				meeting_link: updatedMeetingLink,
				class_code: uniqueCode,
			};

			// Insert class data
			const {data: classInsertData, error: classError} = await supabaseClient
				.from('classes')
				.insert([classData])
				.select('id');

			if (classError) throw classError;

			// Handle students
			const {data: teacherData, error: teacherError} = await supabaseClient
				.from('teachers')
				.select('first_name, last_name')
				.eq('id', classData.teacher_id)
				.single()

			if (teacherError) throw teacherError;

			const jwt = (await supabaseClient.auth.getSession()).data.session.access_token;
			const refreshToken = (await supabaseClient.auth.getSession()).data.session.refresh_token;

			let addedAllStudents = true;
			for (const student of selectedStudents) {
				const headers = {
					"jwt": jwt,
					"refresh_token": refreshToken,
					"teacher_name": `${teacherData.first_name} ${teacherData.last_name}`,
					"email": student.email,
					"notes": student.notes || '',
					"classes_left": 0,
					"class_id": classInsertData[0].id,
					"class_code": code,
					"class_name": className
				};

				console.log('Sending request with headers:', headers);

				const response = await fetchTimeout(`/api/students/new_student`, 10000, {
					method: 'POST', headers: headers,
				});

				if (response.status !== 200) {
					addedAllStudents = false;
					const errorText = await response.text();
					console.error('Error response:', response.status, errorText);
					toast({
						variant: 'destructive',
						title: "Failed to add student to class",
						description: `Error adding ${student.email}: ${errorText}`,
						duration: 3000
					});
				} else {
					umami.track('Student Added to Class');
				}
			}

			console.log("Class created successfully and students updated!");
			const updateTeacherClassIdsStatus = await updateTeacherClassIds((await supabaseClient.auth.getUser()).data.user.id)
			if (updateTeacherClassIdsStatus === "Error") {
				console.log("Error updating teacher's class IDs");
			}
			if (addedAllStudents) {
				toast({
					className: "bg-green-500 border-black border-2",
					title: "Class Successfully Added",
					description: "The new class has been added and students have been updated",
					duration: 3000
				});
				resetAllStates();
				setIsOpen(false);
			}
			setLoading(false)
		} catch (error) {
			console.error("Error creating class or updating students");
			console.log(error)
			toast({
				variant: 'destructive',
				title: "Failed to create class or update students",
				description: "Please try again.",
				duration: 3000
			});
			setLoading(false)
		}
		umami.track('Class Created');
		setLoading(false)
	};

	const _classNameAndDescription = () => {
		return (<div>
			<DialogHeader>
				<DialogTitle>Create Class</DialogTitle>
				<DialogDescription>Enter a name, description, and Meeting Link for your class</DialogDescription>
			</DialogHeader>
			<form className="space-y-4 pt-3">
				<div>
					<Label htmlFor="Name">Name</Label>
					<Input id="name" type="name" value={className} placeholder="Class Name"
						       onChange={(e) => setClassName(e.target.value)} required/>
				</div>
				<div>
					<Label htmlFor="description">Description</Label>
					<Textarea id="description" value={classDescription}
						          onChange={(e) => setClassDescription(e.target.value)}/>
				</div>
				<RadioGroup defaultValue={meetingMedium} className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
					<div>
						<RadioGroupItem value="Google Meet" onClick={() => setMeetingMedium('Google Meet')} id="Google Meet" className="peer sr-only" />
						<Label
							htmlFor="Google Meet"
							className="flex flex-col items-center justify-between rounded-md border-2 bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
						>
							<div className="text-center">
								<h3 className="font-semibold">Google Meet</h3>
							</div>
						</Label>
					</div>
					<div>
						<RadioGroupItem value="Zoom" id="zoom" onClick={() => setMeetingMedium('Zoom')} className="peer sr-only" />
						<Label
							htmlFor="zoom"
							className="flex flex-col items-center justify-between rounded-md border-2 bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
						>
							<div className="text-center">
								<h3 className="font-semibold">Zoom</h3>
							</div>
						</Label>
					</div>
					<div>
						<RadioGroupItem value="In-Person" id="In-Person" onClick={() => setMeetingMedium('In-Person')} className="peer sr-only" />
						<Label
							htmlFor="In-Person"
							className="flex flex-col items-center justify-between rounded-md border-2 bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
						>
							<div className="text-center">
								<h3 className="font-semibold">In-Person</h3>
							</div>
						</Label>
					</div>
				</RadioGroup>
				{meetingMedium == "Zoom" && <div>
					<Label htmlFor="meetingLink">Meeting Link</Label>
					<Input id="meetingLink" type="url" value={meetingLink} placeholder="https://zoom.us/j/example"
						onChange={(e) => setMeetingLink(e.target.value)} required />
				</div>}
				<DialogFooter>
					<div className='flex justify-between flex-wrap w-full'>
						<Button className="border-slate-400 hover:border-black" variant="outline"
							        onClick={() => setIsOpen(false)}>Cancel</Button>
						<Button type="button" onClick={() => {
							if (!className || (!meetingLink && meetingMedium == "Zoom")) {
								toast({
									title: 'Incomplete Fields',
									description: 'Class name and Meeting link are required.',
									variant: "destructive",
								})
								return
							}
							setClassCreationStep(1);
						}} className="gap-2">Pick Days<CircleArrowRight className="h-5 w-5"/></Button>
					</div>
				</DialogFooter>
			</form>

		</div>)
	}

	const _classDays = () => {
		const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
		return (<div>
			<DialogHeader>
				<DialogTitle>Create Class</DialogTitle>
				<DialogDescription>Select the days for your new class.</DialogDescription>
			</DialogHeader>
			<div className="grid gap-4 pt-8 py-4">
				<div className="grid grid-cols-2 gap-4">
					{days.map(day => (<div key={day} className="flex items-center gap-2">
						<Checkbox
							id={day}
							checked={selectedDays.includes(day)}
							onCheckedChange={(checked) => {
								if (checked) {
									setSelectedDays([...selectedDays, day])
								} else {
									setSelectedDays(selectedDays.filter(d => d !== day))
								}
							}}
						/>
						<Label htmlFor={day}>{day}</Label>
					</div>))}
				</div>
			</div>
			<DialogFooter>
				<div className='flex pt-6 justify-between flex-wrap w-full'>
					<Button className="border-slate-400 hover:border-black" variant="outline"
						        onClick={() => setClassCreationStep(0)}>Back</Button>
					<Button type="button" onClick={() => {
						if (selectedDays.length === 0) {

							toast({
								title: 'Incomplete Fields',
								description: 'Please select at least one day',
								variant: "destructive"
							})
							return
						}

						setClassCreationStep(2);
					}} className="gap-2">Choose Timings<CircleArrowRight className="h-5 w-5"/></Button>
				</div>
			</DialogFooter>
		</div>)
	}

	const _classTimings = () => {
		return (<div className='flex w-full flex-col'>
			<DialogHeader>
				<DialogTitle>Create Class</DialogTitle>
				<DialogDescription>Pick the timing for your class</DialogDescription>
			</DialogHeader>

			<div className="flex w-full flex-row items-center justify-between">
				<div className='flex flex-col'>
					<Label htmlFor="startTime" className="pt-4 pb-2">Start Time</Label>
					<div className="flex items-center gap-1">
						<Input
							className="w-12 text-center"
							value={startTime.hour}
							onChange={(e) => setStartTime({...startTime, hour: e.target.value})}
						/>
						<span>:</span>
						<Input
							className="w-12 text-center"
							value={startTime.minute}
							onChange={(e) => setStartTime({...startTime, minute: e.target.value})}
						/>
						<Select
							value={startTime.ampm}
							onValueChange={(value) => setStartTime({...startTime, ampm: value})}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="AM"/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem className="hover:cursor-pointer hover:bg-gray-200" value="AM">AM</SelectItem>
								<SelectItem className="hover:cursor-pointer hover:bg-gray-200" value="PM">PM</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<div className='flex flex-col'>
					<Label htmlFor="endTime" className="pt-4 pb-2">Finish Time</Label>
					<div className="flex items-center gap-1">
						<Input
							className="w-12 text-center"
							value={endTime.hour}
							onChange={(e) => setEndTime({...endTime, hour: e.target.value})}
						/>
						<span>:</span>
						<Input
							className="w-12 text-center"
							value={endTime.minute}
							onChange={(e) => setEndTime({...endTime, minute: e.target.value})}
						/>
						<Select
							value={endTime.ampm}
							onValueChange={(value) => setEndTime({...endTime, ampm: value})}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="AM"/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem className="hover:cursor-pointer hover:bg-gray-200" value="AM">AM</SelectItem>
								<SelectItem className="hover:cursor-pointer hover:bg-gray-200" value="PM">PM</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>
			<DialogFooter>
				<div className='flex justify-between flex-wrap w-full pt-6'>
					<Button className="border-slate-400 hover:border-black" variant="outline"
						        onClick={() => setClassCreationStep(1)}>Back</Button>
					<Button type="button" onClick={() => setClassCreationStep(3)} className="gap-2">Add
							Students<CircleArrowRight className="h-5 w-5"/></Button>
				</div>
			</DialogFooter>
		</div>)
	}//

	const _studentTileForStudentList = (student) => {
		const isSelected = selectedStudents.some(s => s.id === student.id);
		let studentName = student.name;
		let studentEmail = student.email
		if (studentName == 'null null') {
			studentName = student.email;
			studentEmail = '';
		}

		return (
			<div className="flex items-center justify-between" key={student.id}>
				<div className="flex items-center gap-2">
					<Avatar>
						<AvatarFallback className="bg-white">{student.initials}</AvatarFallback>
					</Avatar>
					<div>
						<p className="font-medium">{studentName}</p>
						<p className="text-muted-foreground text-sm">{studentEmail}</p>
					</div>
				</div>
				<Checkbox
					checked={isSelected}
					onCheckedChange={(checked) => {
						if (checked) {
							setSelectedStudents([...selectedStudents, {
								id: student.id, email: student.email, name: student.name
							}]);
						} else {
							setSelectedStudents(selectedStudents.filter(s => s.id !== student.id));
						}
					}}
				/>
			</div>
		)
	}

	const handleAddStudent = async () => {
		if (!newStudentEmail) {
			toast({title: 'Incomplete Fields', description: 'Student email is required.', variant: "destructive",});
			return;
		}
		if (!isEmail(newStudentEmail)) {
			toast({title: 'Invalid Email', description: 'Please enter a valid email address', variant: 'destructive'})
			return;
		}

		const timeStamp = Date.now();

		const newTempStudent = {
			id: timeStamp, name: newStudentEmail.split('@')[0], email: newStudentEmail, isNew: true, notes: newStudentNotes // Add this line
		};

		setTempNewStudents([...tempNewStudents, newTempStudent]);
		setSelectedStudents([...selectedStudents, newTempStudent]);
		setNewStudentEmail('');
		setNewStudentNotes('');
	};

	const fetchStudents = async () => {
		try {
			const {data, error} = await supabaseClient
				.from('student_proxies')
				.select('*')
				.eq('teacher_id', `{${(await supabaseClient.auth.getUser()).data.user.id}}`);

			if (error) throw error;

			// Transform the data to match the expected format
			const formattedStudents = data.map(student => ({
				id: student.id, name: student.first_name + ' ' + student.last_name, email: student.email,

			}));

			setStudents(formattedStudents);
		} catch (error) {
			console.error('Error fetching students:', error);
			toast({
				variant: 'destructive',
				title: "Failed to fetch students",
				description: "Please try again.",
				duration: 3000
			});
		}
	};

	useEffect(() => {
		if (classCreationStep === 3) {
			const fetchStudentsData = async () => {
				const {data: {user}} = await supabaseClient.auth.getUser();
				if (user) {
					await fetchStudents(user.id);
				} else {
					console.error('No authenticated user found');
					toast({
						variant: 'destructive',
						title: "Authentication Error",
						description: "Please login again.",
						duration: 3000
					});
				}
			};
			fetchStudentsData();
		}
	}, [classCreationStep]);

	const _studentList = () => {
		return (<div>
			<DialogHeader>
				<DialogTitle className="text-center">Create Class</DialogTitle>
				<DialogDescription className="text-center">Select the students you would like to add to your
						class<br/>You will be able to add more students later.</DialogDescription>
			</DialogHeader>
			<div className='flex w-full flex-row mt-6'>
				<div className='flex flex-col w-1/2 pr-4 border-r-2'>
					<div className='text-center font-semibold mb-2'>Existing Student</div>
					<div
						className="bg-muted border-2 rounded-md p-4 my-4 h-[40vh] max-h-[40vh] overflow-y-auto grid gap-2">
						{students.length === 0 && tempNewStudents.length === 0 &&
								<span className='text-sm'>You have not added any students yet</span>}
						{students.map(student => _studentTileForStudentList(student))}
						{tempNewStudents.map(student => _studentTileForStudentList(student))}
					</div>
				</div>
				<div className='flex flex-col w-1/2 pl-4 justify-center'>
					<div className='text-center font-semibold mb-2'>New Student</div>
					<div>
						<Label htmlFor="email" className="font-normal">Email</Label>
						<Input
							id="student-email"
							type="email"
							value={newStudentEmail}
							onChange={(e) => setNewStudentEmail(e.target.value)}
							placeholder="Student Email"
							required
						/>
					</div>
					<div className='mt-2'>
						<Label htmlFor="email" className="font-normal">Notes</Label>
						<Textarea
							id="student-notes"
							value={newStudentNotes}
							onChange={(e) => setNewStudentNotes(e.target.value)}
							placeholder="Additional Notes"
						/>
					</div>
					<div className='mt-4 w-full'>
						<Button type="button" onClick={handleAddStudent} className="gap-2">Add Student<CircleArrowRight className="h-5 w-5"/></Button>
					</div>
				</div>
			</div>

			<DialogFooter>
				<div className='flex justify-between flex-wrap w-full'>
					<Button className="border-slate-400 hover:border-black" variant="outline"
						        onClick={() => setClassCreationStep(2)}>Back</Button>
					<Button type="button" onClick={() => {
						setClassCreationStep(4);
					}} className="gap-2">Verify<CircleArrowRight className="h-5 w-5"/></Button>
				</div>
			</DialogFooter>
		</div>)
	}

	const _reviewDetails = () => {
		const classData = {
			name: className,
			description: classDescription,
			days: selectedDays,
			startTime: `${startTime.hour}:${startTime.minute} ${startTime.ampm}`,
			endTime: `${endTime.hour}:${endTime.minute} ${endTime.ampm}`,
			capacity: selectedStudents.length,
			meetingLink: meetingLink, // Add this line
		};

		return (<>
			<DialogHeader>
				<DialogTitle>Confirm Class Details</DialogTitle>
				<DialogDescription>Review the details of the new class before creating it.</DialogDescription>
			</DialogHeader>
			<div className="grid gap-6 py-6">
				<div className="grid grid-cols-[120px_1fr] items-center gap-4">
					<Label htmlFor="class-name">Class Name</Label>
					<div>{classData.name}</div>
				</div>
				<div className="grid grid-cols-[120px_1fr] items-start gap-4">
					<Label htmlFor="meeting-link">Meeting Link</Label>
					<div className="break-all text-pretty">{classData.meetingLink ? classData.meetingLink : meetingMedium}</div>
				</div>
				{classDescription && <div className="grid grid-cols-[120px_1fr] items-center gap-4">
					<Label htmlFor="class-description">Description</Label>
					<div>{classData.description}</div>
				</div>}

				<div className="grid grid-cols-[120px_1fr] items-center gap-4">
					<Label htmlFor="class-days">Days</Label>
					<div>{classData.days.join(", ")}</div>
				</div>
				<div className="grid grid-cols-[120px_1fr] items-center gap-4">
					<Label htmlFor="class-time">Time</Label>
					<div>{`${classData.startTime} - ${classData.endTime}`}</div>
				</div>
				<div className="grid grid-cols-[120px_1fr] items-center gap-4">
					<Label htmlFor="students">Students</Label>
					<div>{classData.capacity}</div>
				</div>
			</div>
			<DialogFooter>
				<div className='flex justify-between flex-wrap w-full'>
					<Button className="border-slate-400 hover:border-black" variant="outline"
						        onClick={() => setClassCreationStep(3)}>Back</Button>
					<Button type="button" onClick={handleCreateClass}
						        className={"gap-2" + (loading ? " cursor-progress" : "")}>Confirm<CheckCircle
							className="h-5 w-5"/></Button>
				</div>
			</DialogFooter>
		</>)
	}

	return (<>
		<Dialog open={isOpen} onOpenChange={setIsOpen} defaultOpen>
			<DialogContent
				className={"sm:max-w-[425px] " + (classCreationStep === 3 ? "lg:max-w-[55vw]" : "lg:max-w-[32vw]")}>
				{classCreationStep === 0 && _classNameAndDescription()}
				{classCreationStep === 1 && _classDays()}
				{classCreationStep === 2 && _classTimings()}
				{classCreationStep === 3 && _studentList()}
				{classCreationStep === 4 && _reviewDetails()}
			</DialogContent>
		</Dialog>
	</>)
}

export default CreateClassPopup
