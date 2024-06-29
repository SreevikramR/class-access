"use client"
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
export default function Component() {
	const [credits, setCredits] = useState(1); // Replace 1 with your actual credit value
	const [willPay, setWillPay] = useState(false);

	return (
		<div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
			<main>
				<div className="w-full flex justify-center items-center">
					{credits == 0 && (
						<Card className="w-[36vw] border-2">
							<div className="text-center">
								<h1 className="font-bold text-foreground sm:text-2xl pt-6">Class Name</h1>
								<h2><p className="text-muted-foreground">Teacher: John Doe</p></h2>
							</div>
							<div className="rounded-lg bg-white p-3 pt-0">
								<div className="flex flex-col sm:flex-row"></div>
								<div className="mt-6 rounded-lg bg-red-500 px-4 py-3 text-red-50">
									<div className="flex items-center">
										<TriangleAlertIcon className="mr-2 h-5 w-5" />
										<p className="text-sm font-medium">
											We see that you have not paid yet. Please pay to join the class.
										</p>
									</div>
								</div>
							</div>
						</Card>
					)}
					{credits == 1 && (
						<Card className="w-[36vw] border-2">
							<div className="text-center">
								<h1 className="font-bold text-foreground sm:text-2xl pt-6">Class Name</h1>
								<h2><p className="text-muted-foreground">Teacher: John Doe</p></h2>
							</div>
							<div className="rounded-lg bg-white p-3 pt-0">
								<div className="flex flex-col sm:flex-row"></div>
								<div className="mt-6 rounded-lg bg-red-500 px-4 py-3 text-red-50">
									<div className="flex items-center">
										<TriangleAlertIcon className="mr-2 h-5 w-5" />
										<p className="text-sm font-medium">
											Kindly Pay before your next class
										</p>
									</div>
								</div>
								<div className="mt-6 flex justify-between items-center">
									<div className='p-1 py-2 flex flex-row justify-center'>
										<input
											type="checkbox"
											id="willPay"
											checked={willPay}
											onChange={() => setWillPay(!willPay)}
											className="mr-2 w-5 h-5 border-2 checked:accent-green-600"
										/>
										<label htmlFor="willPay" className="text-foreground text-md items-center">I will complete the payment</label>
									</div>
									{willPay && (
										<div className="flex justify-end">
											<Button className="w-full sm:w-auto bg-green-700 hover:bg-green-500">Join Class</Button>
										</div>
									)}
								</div>
							</div>
						</Card>
					)}
					{credits >= 2 && (
						<div>Redirecting you to your class...</div>
					)}
				</div>
			</main>
		</div>
	);
}

function TriangleAlertIcon(props) {
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
			<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
			<path d="M12 9v4" />
			<path d="M12 17h.01" />
		</svg>
	);
}
