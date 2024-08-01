import Link from "next/link"

export default function HowToPage() {
	return (
		<div>
			<header className="flex items-center justify-between h-16 px-4 md:px-6 border-b">
				<div className="flex items-center gap-2">
					<span className="text-lg font-semibold">Class Access</span>
				</div>
			</header>
			<div className="w-full max-w-3xl mx-auto py-12 md:py-16 px-4 sm:px-6 lg:px-8">
				<div className="space-y-4 flex flex-col">
					<div className="text-center">
						<h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
							How to Create an Account and Join a Class
						</h1>
						<p className="mt-4 text-muted-foreground">Follow these simple steps to get started.</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<Link href="#activate" className="flex flex-col items-center gap-4 p-6 rounded-md hover:bg-slate-100 cursor-pointer">
							<UserIcon className="size-8 text-primary" />
							<div>
								<h3 className="text-lg font-semibold">1. Activate Account</h3>
								<p className="text-muted-foreground">
									Activate your account through a link received in your email.
								</p>
							</div>
						</Link>
						<Link href="#accept" className="flex flex-col items-center gap-4 p-6 rounded-md hover:bg-slate-100 cursor-pointer">
							<MailIcon className="size-8 text-primary" />
							<div>
								<h3 className="text-lg font-semibold">2. Accept Invite</h3>
								<p className="text-muted-foreground">
									Check your inbox for class invite and click the link to join the class.
								</p>
							</div>
						</Link>
					</div>
					<div className="flex flex-col items-center gap-4 p-6 w-full sm:w-1/2 sm:self-center rounded-md hover:bg-slate-100 cursor-pointer">
						<CheckIcon className="size-8 text-primary" />
						<div>
							<h3 className="text-lg font-semibold">3. You&apos;re All Set!</h3>
							<p className="text-muted-foreground">
								You&apos;ve successfully created an account and enrolled in a class. Enjoy your learning experience!
							</p>
						</div>
					</div>
				</div>
			</div>
			<div className="mt-6 space-y-6 m-6">
				<div id="activate">
					<h2 className="text-xl font-semibold">1. Activate Account</h2>
					<ol className="mt-2 list-decimal space-y-2 pl-6">
						<li>Find a welcome email in your inbox</li>
						<li>Click on the activate account button</li>
						<li>
							Fill out the registration form with your information, including your name, phone number, and a
							secure password.
						</li>
					</ol>
				</div>
				<div id="accept">
					<h2 className="text-xl font-semibold">2. Accept Invite</h2>
					<ul className="mt-2 list-disc space-y-2 pl-6">
						<li>Once you&apos;ve created your account, look for a second email that contians an invite to the class</li>
						<li>
							Confirm the details of the class you are trying to join and then accept the invite
						</li>
					</ul>
				</div>
				<div>
					<h2 className="text-xl font-semibold">3. You&apos;re All Set!</h2>
					<ol className="mt-2 list-decimal space-y-2 pl-6">
						<li>Once you have accepted your invite to the class, look for a link from your teacher to join the meeting</li>
						<li>You may reuse this same link for every class. You may have to login before joining your class</li>
						<li>
							Congratulations! You may now start learning with your teacher and classmates. Enjoy your class!
						</li>
					</ol>
				</div>
				<div>
					<h2 className="text-xl font-semibold">Errors or Difficulty</h2>
					<ul className="mt-2 list-decimal space-y-2 pl-6">
						<li>If you encounter any difficulties during this process, please contact your instructor for help.</li>
					</ul>
				</div>
			</div>
		</div>
	)
}

function CheckIcon(props) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M20 6 9 17l-5-5" />
		</svg>
	)
}


function MailIcon(props) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect width="20" height="16" x="2" y="4" rx="2" />
			<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
		</svg>
	)
}


function UserIcon(props) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
			<circle cx="12" cy="7" r="4" />
		</svg>
	)
}
