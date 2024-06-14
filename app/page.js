"use client"
import Image from "next/image";
import { useRouter } from "next/navigation";
import fetchTimeout from "@/components/util_function/fetch";

export default function Home() {
	const router = useRouter();
	const controller = new AbortController()

	const { signal } = controller;

	async function handleZoomOAuth() {
		const url = new URL(`${process.env.NEXT_PUBLIC_SERVER_LINK}/api/oauth/zoom`)
		try {
			const response = await fetchTimeout(url, 3000, { signal });
			const data = await response.json();
			window.location.href = data.link
		} catch (error) {
			if (error.name === "AbortError") {
			  console.log("request timed out")
			} else {
			  console.log("request failed")
			}
		}
	}

	return (
		<div className="h-screen w-screen flex justify-center items-center">
			<div className="cursor-pointer p-3 border-2 rounded-lg border-black" onClick={() => router.push('/dashboard')}>
				Dashboard
			</div>
			<div className="cursor-pointer p-3 border-2 rounded-lg border-black" onClick={() => handleZoomOAuth()}>
				Zoom OAuth
			</div>
		</div>
	);
}