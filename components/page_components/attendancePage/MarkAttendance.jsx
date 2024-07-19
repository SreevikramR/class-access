// components/page_components/attendancePage/MarkAttendance.js

"use client"
import React, {useState, useEffect} from 'react'
import {supabaseClient} from '@/components/util_function/supabaseCilent'
import {Button} from '@/components/ui/button'
import {Checkbox} from '@/components/ui/checkbox'
import {
	Card, CardHeader, CardTitle, CardContent,
} from "@/components/ui/card"
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

const MarkAttendance = () => {
	const [attendanceRecords, setAttendanceRecords] = useState([])
	const [loading, setLoading] = useState(true)
	
	useEffect(() => {
		fetchAttendanceRecords()
	}, [])
	
	const fetchAttendanceRecords = async () => {
		try {
			const {data, error} = await supabaseClient
				.from('attendance_records')
				.select(`
                    id,
                    date,
                    isPresent,
                    class_id,
                    student_proxy_id,
                    classes(class_code),
                    student_proxies(first_name, last_name)
                `)
				.eq('date', new Date().toISOString().split('T')[0]) // Fetch records for today
			
			if (error) throw error
			
			setAttendanceRecords(data)
			setLoading(false)
		} catch (error) {
			console.error('Error fetching attendance records:', error)
			setLoading(false)
		}
	}
	
	const handleAttendanceChange = (index, checked) => {
		const updatedRecords = [...attendanceRecords]
		updatedRecords[index].isPresent = checked
		setAttendanceRecords(updatedRecords)
	}
	
	const saveAttendance = async () => {
		setLoading(true)
		try {
			const {error} = await supabaseClient
				.from('attendance_records')
				.upsert(attendanceRecords.map(({id, isPresent}) => ({id, isPresent})))
			
			if (error) throw error
			
			alert('Attendance saved successfully!')
			fetchAttendanceRecords() // Refresh the data
		} catch (error) {
			console.error('Error saving attendance:', error)
			alert('Failed to save attendance. Please try again.')
		}
		setLoading(false)
	}
	
	return (<Card>
			<CardHeader>
				<CardTitle className="p-3">Mark Attendance</CardTitle>
			</CardHeader>
			{attendanceRecords.length > 0 ? (<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Student Name</TableHead>
								<TableHead>Class Code</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Present</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{attendanceRecords.map((record, index) => (<TableRow key={record.id}>
									<TableCell>
										{record.student_proxies?.first_name && record.student_proxies?.last_name ? `${record.student_proxies.first_name} ${record.student_proxies.last_name}` : 'Student Invited'}
									</TableCell>
									<TableCell>{record.classes?.class_code}</TableCell>
									<TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
									<TableCell>
										<Checkbox
											checked={record.isPresent}
											onCheckedChange={(checked) => handleAttendanceChange(index, checked)}
										/>
									</TableCell>
								</TableRow>))}
						</TableBody>
					</Table>
					<Button onClick={saveAttendance} className="mt-4">Save Attendance</Button>
				</CardContent>) : (<CardContent className="p-8 pt-0 text-gray-500">
					{loading ? "Loading Attendance Records..." : "No attendance records for today."}
				</CardContent>)}
		</Card>)
}

export default MarkAttendance