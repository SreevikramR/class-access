"use client";
import React, { useState, useEffect } from "react";
import { Calendar, CreditCard, Users, Mail, BarChart, BookUser, Check, MousePointerClick, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import logo2 from "@/public/logo2.png";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const LandingPage = () => {
	const [activeFeature, setActiveFeature] = useState("payments");
	const [hasInteracted, setHasInteracted] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	const features = {
		payments: {
			title: "Smart Payment Management",
			description:
				"Seamlessly handle payments with integrated UPI support. Automatically track dues, send reminders, and maintain payment records.",
			benefits: [
				"Instant UPI payment collection",
				"Automated payment tracking",
				"Professional invoice generation",
				"Payment history and analytics",
				"Automatic receipt generation",
			],
			image: "/upi.png",
			icon: <CreditCard className="w-8 h-8" />,
		},
		attendance: {
			title: "Comprehensive Attendance Tracking",
			description:
				"Keep detailed records of student attendance, generate reports, and share updates with parents automatically.",
			benefits: [
				"Digital attendance marking",
				"Automated attendance reports",
				"Parent notification system",
				"Attendance analytics",
				"Custom report generation",
			],
			image: "/attendance.png",
			icon: <Calendar className="w-8 h-8" />,
		},
		access: {
			title: "Class Access Control and Permissions",
			description:
				"Manage student enrollments efficiently and control access to classes based on payment status.",
			benefits: [
				"Payment-based access control",
				"Manage student permissions to join class",
				"Flexible restrictions by group",
				"No awkward conversations for tuition fee collection",
				"Dynamic and Automated Access Control",
			],
			image: "/enrollment.png",
			icon: <Users className="w-8 h-8" />,
		},
		communication: {
			title: "Automated Communication System",
			description:
				"Send invoices, attendance reports, and important updates to students, parents and teachers automatically.",
			benefits: [
				"Automated email notifications",
				"Bulk messaging capability",
				"Payment reminder notifications",
				"Next-day schedule reminders for teachers",
			],
			image: "/invoice.png",
			icon: <Mail className="w-8 h-8" />,
		},
	};

	const features2 = {
		enrollment: {
			title: "Student Enrollment Management",
			description:
				"Streamline the student enrollment and onboarding process with automated workflows and batch management.",
			benefits: [
				"Easy online enrollment process",
				"Batch and class management",
				"Payment-linked enrollment status",
				"Comprehensive student profiles",
				"Enrollment analytics",
			],
			image: "/class.png",
			icon: <BookUser className="w-8 h-8" />,
		},
		insights: {
			title: "Centralized Insights & Analytics",
			description:
				"Track all critical data in one place to make informed decisions and optimize your operations.",
			benefits: [
				"Attendance analysis",
				"Payment and revenue insights",
				"Communication engagement tracking",
				"Automated report generation",
				"Track student payment status",
			],
			image: "/batches.png",
			icon: <BarChart className="w-8 h-8" />,
		},
		customize: {
			title: "Customizable Features",
			description:
				"Adapt the platform to match your requirements and preferences.",
			benefits: [
				"Custom class schedules",
				"Personalized student management",
				"Flexible student payment deadlines",
				"Scalable to any institution size",
				"Tailored analytics and reporting",
			],
			image: "/edit.png",
			icon: <Settings className="w-8 h-8" />,
		},
	};

	return (
		<div className="min-h-screen bg-gray-900">
			{/* Hero Section */}
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent className="max-w-[80%] sm:max-w-[40%]">
					<DialogHeader>
						<DialogTitle className="text-2xl">
							Let&apos;s Connect!
						</DialogTitle>
						<DialogDescription className="space-y-4 pt-4">
							<p>
								We&apos;re thrilled that you&apos;re interested
								in Class Access, the all-in-one platform for
								teaching academies. While we currently
								don&apos;t offer a demo booking feature online,
								we&apos;d love to connect with you and discuss
								how we can support your academy&apos;s needs.
							</p>

							<p>
								Simply send us an email at{" "}
								<a
									href="mailto:email@email.com"
									className="text-primary font-medium hover:underline inline-flex items-center gap-1"
								>
									<Mail className="w-4 h-4" />
									myclassaccess@gmail.com
								</a>
								, and our team will:
							</p>

							<ul className="list-disc list-inside space-y-2 pl-4">
								<li>
									Provide personalized insights into how Class
									Access works.
								</li>
								<li>
									Share details about features that align with
									your academy&apos;s goals.
								</li>
								<li>
									Answer any questions you may have about
									managing payments, attendance,
									communication, and more.
								</li>
							</ul>

							<p>
								Don&apos;t hesitate to include any specific
								challenges or goals in your email so we can
								tailor our response just for you.
							</p>

							<p className="font-medium">
								We&apos;re excited to help you take your
								teaching academy to the next level. Let&apos;s
								start the conversation – email us today!
							</p>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button onClick={() => setIsOpen(false)}>Close</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
				className="bg-white text-black"
			>
				<div className="container mx-auto px-6 pt-12 py-24">
					{/* <Image src={logo} className="mx-auto"/> */}
					<div className="max-w-4xl mx-auto text-center">
						<Image
							src={logo2}
							alt="logo"
							className="mx-auto w-[10%]"
						/>
						<h1 className="text-xl md:text-3xl font-bold mb-6 md:mb-12">
							Class Access
						</h1>
						<h1 className="text-3xl md:text-5xl font-bold mb-6">
							Transform Your Teaching Academy
						</h1>
						<p className="text-sm md:text-xl mb-8">
							The complete digital solution for teaching
							academies. Manage students, payments, attendance,
							and communications - all in one place.
						</p>
						<div className="flex justify-center space-x-4">
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => { setIsOpen(true) }}
								className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold text-sm md:text-lg hover:bg-gray-700 transition-colors"
							>
								Book Demo
							</motion.button>
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => {
									window.location.href = "/login";
								}}
								className="border-2 border-gray-900 px-8 py-3 rounded-lg font-semibold text-sm md:text-lg hover:bg-gray-100 hover:text-[#1a202c] transition-colors"
							>
								Login
							</motion.button>
						</div>
					</div>
				</div>
			</motion.div>

			{/* Features Deep Dive */}
			<div className="py-12 md:py-24 bg-gray-900">
				<div className="md:hidden">
					<div className="container mx-auto px-6 lg:max-w-6xl">
						<motion.h2
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
							className="text-3xl font-bold text-center mb-6 text-white"
						>
							Powerful Features for Modern Music Schools
						</motion.h2>

						{/* Interactive Hint */}
						<AnimatePresence>
							{!hasInteracted && (
								<motion.div
									initial={{ opacity: 0, y: -20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									transition={{ duration: 0.5 }}
									className="text-center mb-8 flex items-center justify-center text-gray-200"
								>
									<MousePointerClick className="mr-1" />
									<p>
										Click on any feature below to learn more
									</p>
								</motion.div>
							)}
						</AnimatePresence>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
							{Object.keys(features).map((key, index) => (
								<motion.div
									key={key}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									onClick={() => {
										setActiveFeature(key);
										setHasInteracted(true);
									}}
									className={`p-6 border-2 border-white rounded-lg transition-all ${
										activeFeature == key
											? "bg-gray-800 text-white shadow-lg"
											: "bg-white text-gray-800 hover:bg-gray-100 shadow-md"
									} ${index > 3 ? "lg:col-start-2 lg:col-span-1" : ""}`}
								>
									<div className="flex items-center mb-4">
										<div
											className={`p-2 rounded-full ${activeFeature == key ? "bg-white" : "bg-[#1a202c]"}`}
										>
											{React.cloneElement(
												features[key].icon,
												{
													className: `w-6 h-6 ${activeFeature == key ? "text-[#1a202c]" : "text-white"}`,
												},
											)}
										</div>
										<h3 className="font-semibold ml-3">
											{features[key].title}
										</h3>
									</div>
									<p className="text-sm mb-4">
										{features[key].description}
									</p>
									<AnimatePresence>
										{activeFeature == key && (
											<motion.div
												initial={{
													opacity: 0,
													height: 0,
												}}
												animate={{
													opacity: 1,
													height: "auto",
												}}
												exit={{ opacity: 0, height: 0 }}
												transition={{ duration: 0.3 }}
											>
												<h4 className="font-semibold mb-2">
													Key Benefits:
												</h4>
												<ul className="space-y-2">
													{features[key].benefits.map(
														(benefit, index) => (
															<motion.li
																key={index}
																initial={{
																	opacity: 0,
																	x: -20,
																}}
																animate={{
																	opacity: 1,
																	x: 0,
																}}
																transition={{
																	duration: 0.3,
																	delay:
																		index *
																		0.1,
																}}
																className="flex items-center"
															>
																<Check
																	className="text-green-500 mr-2"
																	size={16}
																/>
																<span className="text-sm">
																	{benefit}
																</span>
															</motion.li>
														),
													)}
												</ul>
											</motion.div>
										)}
									</AnimatePresence>
								</motion.div>
							))}
							{Object.keys(features2).map((key, index) => (
								<motion.div
									key={key}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									onClick={() => {
										setActiveFeature(key);
										setHasInteracted(true);
									}}
									className={`p-6 border-2 border-white rounded-lg transition-all ${
										activeFeature == key
											? "bg-gray-800 text-white shadow-lg"
											: "bg-white text-gray-800 hover:bg-gray-100 shadow-md"
									} ${index > 3 ? "lg:col-start-2 lg:col-span-1" : ""}`}
								>
									<div className="flex items-center mb-4">
										<div
											className={`p-2 rounded-full ${activeFeature == key ? "bg-white" : "bg-[#1a202c]"}`}
										>
											{React.cloneElement(
												features2[key].icon,
												{
													className: `w-6 h-6 ${activeFeature == key ? "text-[#1a202c]" : "text-white"}`,
												},
											)}
										</div>
										<h3 className="font-semibold ml-3">
											{features2[key].title}
										</h3>
									</div>
									<p className="text-sm mb-4">
										{features2[key].description}
									</p>
									<AnimatePresence>
										{activeFeature == key && (
											<motion.div
												initial={{
													opacity: 0,
													height: 0,
												}}
												animate={{
													opacity: 1,
													height: "auto",
												}}
												exit={{ opacity: 0, height: 0 }}
												transition={{ duration: 0.3 }}
											>
												<h4 className="font-semibold mb-2">
													Key Benefits:
												</h4>
												<ul className="space-y-2">
													{features2[
														key
													].benefits.map(
														(benefit, index) => (
															<motion.li
																key={index}
																initial={{
																	opacity: 0,
																	x: -20,
																}}
																animate={{
																	opacity: 1,
																	x: 0,
																}}
																transition={{
																	duration: 0.3,
																	delay:
																		index *
																		0.1,
																}}
																className="flex items-center"
															>
																<Check
																	className="text-green-500 mr-2"
																	size={16}
																/>
																<span className="text-sm">
																	{benefit}
																</span>
															</motion.li>
														),
													)}
												</ul>
											</motion.div>
										)}
									</AnimatePresence>
								</motion.div>
							))}
						</div>
					</div>
				</div>

				<div className="container mx-auto px-6 hidden md:block">
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="text-2xl md:text-3xl font-bold text-center mb-2 text-white"
					>
						Powerful Features for Modern Teaching Academies
					</motion.h2>

					{/* Interactive Hint */}
					<AnimatePresence>
						{!hasInteracted && (
							<motion.div
								initial={{ opacity: 0, y: -20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.5 }}
								className="text-center mb-8 flex items-center justify-center text-white animate-pulse"
							>
								<MousePointerClick className="mr-2" />
								<p>Click on any feature below to learn more</p>
							</motion.div>
						)}
					</AnimatePresence>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 mb-6 lg:mb-12">
						{Object.keys(features).map((key) => (
							<motion.button
								key={key}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => {
									setActiveFeature(key);
									setHasInteracted(true);
								}}
								className={`p-6 rounded-lg border-white border-2 text-left transition-all ${
									activeFeature === key
										? "bg-gray-800 text-white shadow-lg"
										: "bg-white text-gray-800 hover:bg-gray-100 shadow-md"
								}`}
							>
								<div className="flex items-center mb-4">
									<div
										className={`p-2 rounded-full ${activeFeature === key ? "bg-white" : "bg-[#1a202c]"}`}
									>
										{React.cloneElement(
											features[key].icon,
											{
												className: `w-6 h-6 ${activeFeature === key ? "text-[#1a202c]" : "text-white"}`,
											},
										)}
									</div>
									<h3 className="font-semibold ml-3">
										{features[key].title}
									</h3>
								</div>
								<p className="text-sm">
									{features[key].description.split(".")[0]}.
								</p>
							</motion.button>
						))}
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto mb-12">
						{Object.keys(features2).map((key) => (
							<motion.button
								key={key}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => {
									setActiveFeature(key);
									setHasInteracted(true);
								}}
								className={`p-6 rounded-lg border-2 border-white text-left transition-all ${
									activeFeature === key
										? "bg-gray-800 text-white shadow-lg"
										: "bg-white text-gray-800 hover:bg-gray-100 shadow-md"
								}`}
							>
								<div className="flex items-center mb-4">
									<div
										className={`p-2 rounded-full ${activeFeature === key ? "bg-white" : "bg-[#1a202c]"}`}
									>
										{React.cloneElement(
											features2[key].icon,
											{
												className: `w-6 h-6 ${activeFeature === key ? "text-[#1a202c]" : "text-white"}`,
											},
										)}
									</div>
									<h3 className="font-semibold ml-3">
										{features2[key].title}
									</h3>
								</div>
								<p className="text-sm">
									{features2[key].description.split(".")[0]}.
								</p>
							</motion.button>
						))}
					</div>

					<AnimatePresence mode="wait">
						<motion.div
							key={activeFeature}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.5 }}
							className="bg-white rounded-xl shadow-lg p-8 border border-gray-200"
						>
							<div className="grid md:grid-cols-2 gap-12 items-center">
								<div>
									<h3 className="text-2xl font-bold mb-4">
										{features[activeFeature] &&
											features[activeFeature].title}
										{features2[activeFeature] &&
											features2[activeFeature].title}
									</h3>
									<p className="text-gray-600 mb-6">
										{features[activeFeature] &&
											features[activeFeature].description}
										{features2[activeFeature] &&
											features2[activeFeature]
												.description}
									</p>
									<div className="space-y-3">
										{features[activeFeature] &&
											features[
												activeFeature
											].benefits.map((benefit, index) => (
												<motion.div
													key={index}
													initial={{
														opacity: 0,
														x: -20,
													}}
													animate={{
														opacity: 1,
														x: 0,
													}}
													transition={{
														duration: 0.5,
														delay: index * 0.1,
													}}
													className="flex items-center"
												>
													<Check
														className="text-green-500 mr-2"
														size={20}
													/>
													<span>{benefit}</span>
												</motion.div>
											))}
										{features2[activeFeature] &&
											features2[
												activeFeature
											].benefits.map((benefit, index) => (
												<motion.div
													key={index}
													initial={{
														opacity: 0,
														x: -20,
													}}
													animate={{
														opacity: 1,
														x: 0,
													}}
													transition={{
														duration: 0.5,
														delay: index * 0.1,
													}}
													className="flex items-center"
												>
													<Check
														className="text-green-500 mr-2"
														size={20}
													/>
													<span>{benefit}</span>
												</motion.div>
											))}
									</div>
								</div>
								<div>
									{features[activeFeature] && (
										<motion.img
											initial={{ opacity: 0, scale: 0.8 }}
											animate={{ opacity: 1, scale: 1 }}
											transition={{ duration: 0.5 }}
											src={features[activeFeature].image}
											alt={features[activeFeature].title}
											className="rounded-lg shadow-lg"
										/>
									)}
									{features2[activeFeature] && (
										<motion.img
											initial={{ opacity: 0, scale: 0.8 }}
											animate={{ opacity: 1, scale: 1 }}
											transition={{ duration: 0.5 }}
											src={features2[activeFeature].image}
											alt={features2[activeFeature].title}
											className="rounded-lg shadow-lg"
										/>
									)}
								</div>
							</div>
						</motion.div>
					</AnimatePresence>
				</div>
			</div>

			{/* CTA */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.8 }}
				className="bg-white text-black py-24"
			>
				<div className="container mx-auto px-6 text-center">
					<h2 className="text-3xl font-bold mb-4">
						Ready to Get Started?
					</h2>
					<p className="text-xl mb-8">
						Streamline your operations and save time today
					</p>
					<div className="flex justify-center space-x-4">
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => { setIsOpen(true) }}
							className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
						>
							Book Demo
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => {
								window.location.href = "/login";
							}}
							className="border-2 border-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
						>
							Login
						</motion.button>
					</div>
				</div>
			</motion.div>
		</div>
	);
};

export default LandingPage;
