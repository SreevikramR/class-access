"use client"
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
	const router = useRouter();

	async function handleZoomOAuth() {
		const redirect_uri = window.location.origin + "/oauth/zoom/callback";
		const client_id = process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID
		window.location.href = `https://zoom.us/oauth/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}`
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