import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"
import { Toaster } from "@/components/ui/toaster";
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "Class Access",
	description: "Seamlessly Manage your classes",
};

export default function RootLayout({ children }) {

	return (
		<html lang="en">
			<Analytics />
			<head>
				<script dangerouslySetInnerHTML={{
					__html: `
          (function(c,l,a,r,i,t,y){
            c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "n59t2k2m6w");`
				}}/>
				<script defer src="https://analytics.classaccess.tech/script.js" data-website-id="8447d1f8-6a13-4992-aab5-095cdba64eeb" data-domains="classaccess.tech"></script>
			</head>
			<body className={inter.className}>
				<SpeedInsights />
				<div>
					<Toaster />
				</div>
				{children}
			</body>
		</html>
	);
}
