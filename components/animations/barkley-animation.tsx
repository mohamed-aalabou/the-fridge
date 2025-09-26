"use client";

import { useState, useEffect } from "react";

export default function BarkleyAnimation() {
	const [activeAnimation, setActiveAnimation] = useState<
		"panting" | "blinking" | null
	>("panting");
	const [isAnimating, setIsAnimating] = useState(true);

	useEffect(() => {
		const animationCycle = () => {
			// Run animation for different durations based on type
			setIsAnimating(true);

			// Determine duration based on current animation
			const animationDuration = activeAnimation === "panting" ? 12600 : 1600; // 12.6s for panting (9 cycles), 2.8s for blinking (2 cycles)

			setTimeout(() => {
				// Pause animation
				setIsAnimating(false);

				// After 8.4s pause, randomly select next animation
				setTimeout(() => {
					const animations: ("panting" | "blinking")[] = [
						"panting",
						"blinking",
					];
					const randomAnimation =
						animations[Math.floor(Math.random() * animations.length)];
					setActiveAnimation(randomAnimation);

					// Start the cycle again
					animationCycle();
				}, 8400); // 8.4s pause
			}, animationDuration);
		};

		// Start the animation cycle
		animationCycle();

		// Cleanup function to prevent memory leaks
		return () => {
			// Clear any pending timeouts when component unmounts
		};
	}, []);

	return (
		<>
			<div
				className={`blinking-sprite ${
					activeAnimation === "blinking" && isAnimating ? "" : "paused"
				}`}
				style={{
					display: activeAnimation === "blinking" ? "block" : "none",
				}}
			></div>
			<div
				className={`panting-sprite ${
					activeAnimation === "panting" && isAnimating ? "" : "paused"
				}`}
				style={{
					display: activeAnimation === "panting" ? "block" : "none",
				}}
			></div>
		</>
	);
}
