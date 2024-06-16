"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/page_components/header'
import Footer from '@/components/page_components/footer'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { ListFilter } from 'lucide-react'
import { SortDescIcon } from 'lucide-react'
import { PlusCircle } from 'lucide-react'
import { File } from 'lucide-react'

const page = () => {
	return (
		<div className="flex flex-col min-h-screen">
			<Header />
			<main className="flex-1 bg-gray-100 dark:bg-gray-800 p-6 md:p-10">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{/* <Card>
				<CardHeader>
				<CardTitle>Payment Summary</CardTitle>
				</CardHeader>
				<CardContent>
				<div className="grid gap-4">
					<div className="flex items-center justify-between">
					<div>Total Revenue</div>
					<div className="font-bold">$25,000</div>
					</div>
					<div className="flex items-center justify-between">
					<div>Pending Payments</div>
					<div className="font-bold">$3,500</div>
					</div>
					<div className="flex items-center justify-between">
					<div>Paid Invoices</div>
					<div className="font-bold">$21,500</div>
					</div>
				</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
				<CardTitle>Zoom Access Control</CardTitle>
				</CardHeader>
				<CardContent>
				<div className="grid gap-4">
					<div className="flex items-center justify-between">
					<div>Paying Students</div>
					<div className="font-bold">120</div>
					</div>
					<div className="flex items-center justify-between">
					<div>Non-Paying Students</div>
					<div className="font-bold">15</div>
					</div>
					<Button variant="secondary" size="sm">
					Block Non-Paying Students
					</Button>
				</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
				<CardTitle>Platform Performance</CardTitle>
				</CardHeader>
				<CardContent>
				<div className="grid gap-4">
					<div className="flex items-center justify-between">
					<div>Total Enrollments</div>
					<div className="font-bold">1,250</div>
					</div>
					<div className="flex items-center justify-between">
					<div>Active Students</div>
					<div className="font-bold">950</div>
					</div>
					<div className="flex items-center justify-between">
					<div>Retention Rate</div>
					<div className="font-bold">76%</div>
					</div>
				</div>
				</CardContent>
			</Card> */}
				</div>
				<div className="mt-6">
					<div className="flex w-full">
						<Tabs defaultValue="all" className='flex flex-row content-between w-full'>
							<TabsList>
								<TabsTrigger value="all">All</TabsTrigger>
								<TabsTrigger value="paid">Paid</TabsTrigger>
								<TabsTrigger value="unpaid">Unpaid</TabsTrigger>
								<TabsTrigger value="pending">Pending</TabsTrigger>
							</TabsList>
							<div className="ml-auto flex items-center gap-2">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline" size="sm" className="h-7 gap-1">
											<SortDescIcon className="h-3.5 w-3.5" />
											<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
												Sort
											</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuLabel>Sort by</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuCheckboxItem checked>
											Name
										</DropdownMenuCheckboxItem>
										<DropdownMenuCheckboxItem>Classes Remaining</DropdownMenuCheckboxItem>
										<DropdownMenuCheckboxItem>
											Payment Status
										</DropdownMenuCheckboxItem>
									</DropdownMenuContent>
								</DropdownMenu>
								<Button size="sm" className="h-7 gap-1">
									<PlusCircle className="h-3.5 w-3.5" />
									<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
										Add Student
									</span>
								</Button>
							</div>
						</Tabs>
					</div>
					<Card>
						<CardHeader>
							<CardTitle className="p-3">My Students</CardTitle>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Student</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Classes Left</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									<UserRow />
									<UserRow2 />
									<UserRow3 />
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</div>
			</main>
			<Footer />
		</div>
	)
}

const UserRow = () => {
	const router = useRouter();
	return (
		<TableRow onClick={() => { router.push(`/student`) }} className="cursor-pointer">
			<TableCell>
				<div className="flex items-center gap-2">
					<Avatar className="w-8 h-8">
						<AvatarImage src="/placeholder-user.jpg" />
						<AvatarFallback>JS</AvatarFallback>
					</Avatar>
					<div>John Smith</div>
				</div>
			</TableCell>
			<TableCell>
				example@example.com
			</TableCell>
			<TableCell>
				<Badge variant="success" className="bg-green-500 px-5">Paid</Badge>
			</TableCell>
			<TableCell>3</TableCell>
		</TableRow>
	)
}

const UserRow2 = () => {
	const router = useRouter();
	return (
		<TableRow onClick={() => { router.push(`/student`) }} className="cursor-pointer">
			<TableCell>
				<div className="flex items-center gap-2">
					<Avatar className="w-8 h-8">
						<AvatarImage src="/placeholder-user.jpg" />
						<AvatarFallback>JS</AvatarFallback>
					</Avatar>
					<div>John Smith</div>
				</div>
			</TableCell>
			<TableCell>
				example@example.com
			</TableCell>
			<TableCell>
				<Badge variant="success" className="bg-orange-400 px-3">Unpaid</Badge>
			</TableCell>
			<TableCell>3</TableCell>
		</TableRow>
	)
}

const UserRow3 = () => {
	const router = useRouter();
	return (
		<TableRow onClick={() => { router.push(`/student`) }} className="cursor-pointer">
			<TableCell>
				<div className="flex items-center gap-2">
					<Avatar className="w-8 h-8">
						<AvatarImage src="/placeholder-user.jpg" />
						<AvatarFallback>JS</AvatarFallback>
					</Avatar>
					<div>John Smith</div>
				</div>
			</TableCell>
			<TableCell>
				example@example.com
			</TableCell>
			<TableCell>
				<Badge variant="success" className="text-black border-black">Pending</Badge>
			</TableCell>
			<TableCell>3</TableCell>
		</TableRow>
	)
}

export default page