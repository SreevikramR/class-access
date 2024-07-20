import React, {useState, useEffect} from 'react'
import Link from 'next/link'
import {
	DropdownMenu,
	DropdownMenuLabel,
	DropdownMenuItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuSeparator
} from '../ui/dropdown-menu'
import {Button} from '../ui/button'
import {supabaseClient} from '@/components/util_function/supabaseCilent'
import { useRouter } from 'next/navigation'

const Header = () => {
	const [teacherName, setTeacherName] = useState('')
	const router = useRouter()
	useEffect(() => {
		fetchTeacherName()
	}, [])
	
	async function fetchTeacherName() {
		try {
			const {data: {user}} = await supabaseClient.auth.getUser()
			if (user) {
				const {data, error} = await supabaseClient
					.from('teachers')
					.select('first_name, last_name')
					.eq('id', user.id)
					.single()
				
				if (error) throw error
				
				if (data) {
					setTeacherName(`${data.first_name} ${data.last_name}`)
				}
			}
		} catch (error) {
			console.error('Error fetching teacher name:', error)
		}
	}
	
	async function handleLogout() {
		try {
			const {error} = await supabaseClient.auth.signOut()
			if (error) throw error
			await router.push('/login') // Redirect to login page after logout
		} catch (error) {
			console.error('Error logging out:', error)
		}
	}
	
	return (<header className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
			<div className="flex items-center gap-4">
				<Link href="/" className="flex items-center gap-2" prefetch={false}>
					<span className="font-bold text-lg">Class Access</span>
				</Link>
			</div>
			<div className="flex items-center gap-4">
				<nav className="hidden md:flex items-center gap-4">
					<Link href="/dashboard" className="hover:underline" prefetch={false}>
						Dashboard
					</Link>
					<Link href="/students" className="hover:underline" prefetch={false}>
						Students
					</Link>
					<Link href="/attendance" className="hover:underline" prefetch={false}>
					Attendance
					</Link>
				</nav>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="icon" className="rounded-full">
							<span className="sr-only">User menu</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Logged in as {teacherName}</DropdownMenuLabel>
						<DropdownMenuSeparator/>
						<DropdownMenuSeparator/>
						<DropdownMenuItem onSelect={handleLogout}>Logout</DropdownMenuItem> </DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>)
}

export default Header