import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";

export function Sidebar({ selectedClass, selectedStudent, onClassChange, onStudentChange }) {
	// Sample data - in a real app, this would come from an API
	const students = ["John Doe", "Jane Smith", "Bob Johnson"];

	return (
		<aside className="w-[30vw] bg-white rounded-lg shadow-sm p-6 space-y-6">
			<div className="space-y-2">
				<h2 className="text-sm font-semibold">Select Class</h2>
				<Select value={selectedClass} onValueChange={onClassChange}>
					<SelectTrigger>
						<SelectValue placeholder="Select a class" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="math">Mathematics</SelectItem>
						<SelectItem value="science">Science</SelectItem>
						<SelectItem value="english">English</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<h2 className="text-sm font-semibold">Select Student</h2>
				<div className="space-y-1">
					{students.map((student) => (
						<button
							key={student}
							onClick={() => onStudentChange(student)}
							className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                ${
						selectedStudent === student
							? "bg-blue-50 text-blue-700"
							: "hover:bg-gray-100"}`}
						>
							{student}
						</button>
					))}
				</div>
			</div>

			<div className="pt-4 mt-auto">
				<Button className="w-full" variant="default">
					<Download className="w-4 h-4 mr-2" />
					Export Attendance
				</Button>
			</div>
		</aside>
	);
}
