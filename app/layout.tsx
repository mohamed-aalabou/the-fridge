import type { Metadata } from "next";
import { Geist, Geist_Mono, Jacquard_12, Jersey_15 } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const jacquard12 = Jacquard_12({
	variable: "--font-jacquard-12",
	subsets: ["latin"],
	weight: "400",
});

const jersey15 = Jersey_15({
	variable: "--font-jersey-15",
	subsets: ["latin"],
	weight: "400",
});

export const metadata: Metadata = {
	title: "Mini's and Mo's fridge",
	description: "A place for lovers to keep in touch",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" style={{ height: "100%" }}>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${jacquard12.variable} ${jersey15.variable} antialiased`}
				style={{ height: "100%" }}
			>
				{children}
			</body>
		</html>
	);
}
