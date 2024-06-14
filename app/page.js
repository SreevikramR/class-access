"use client"
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
	const router = useRouter();

	return (
		<div className="h-screen w-screen flex justify-center items-center">
			<div className="cursor-pointer p-3 border-2 rounded-lg border-black" onClick={() => router.push('/dashboard')}>
				Dashboard
			</div>
		</div>
	);
}
