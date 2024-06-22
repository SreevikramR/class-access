import React from 'react'
import Link from 'next/link'
import { DropdownMenu, DropdownMenuLabel, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu'
import { Button } from '../ui/button'

const Header = () => {
    return (
        <header className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
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
						<Link href="#" className="hover:underline" prefetch={false}>
							Students
						</Link>
						<Link href="/classes" className="hover:underline" prefetch={false}>
							Classes
						</Link>
						<Link href="#" className="hover:underline" prefetch={false}>
							Payments
						</Link>
					</nav>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
						<Button variant="outline" size="icon" className="rounded-full">
							<img src="/placeholder.svg" width="32" height="32" className="rounded-full" alt="Avatar" />
							<span className="sr-only">User menu</span>
						</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Logged in as ABC</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem>Profile</DropdownMenuItem>
							<DropdownMenuItem>Settings</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem>Logout</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</header>
    )
}

export default Header