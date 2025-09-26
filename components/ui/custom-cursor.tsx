"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface CustomCursorProps {
	children: React.ReactNode;
}

export function CustomCursor({ children }: CustomCursorProps) {
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const [isVisible, setIsVisible] = useState(false);
	const [isHoveringDraggable, setIsHoveringDraggable] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);

	useEffect(() => {
		const updateMousePosition = (e: MouseEvent) => {
			setMousePosition({ x: e.clientX, y: e.clientY });
		};

		const handleMouseEnter = () => setIsVisible(true);
		const handleMouseLeave = () => setIsVisible(false);

		// Detect when hovering over draggable elements
		const handleMouseOver = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			const draggableElement = target.closest('[data-draggable="true"]');
			setIsHoveringDraggable(!!draggableElement);

			// Check if hovering over interactive elements
			const interactiveElement = target.closest(
				'button, a, input, textarea, select, [role="button"], [tabindex]'
			);
			setIsHoveringInteractive(!!interactiveElement);
		};

		// Detect drag state using mouse events (for @dnd-kit)
		const handleMouseDown = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			const draggableElement = target.closest('[data-draggable="true"]');
			if (draggableElement) {
				setIsDragging(true);
			}
		};

		const handleMouseUp = () => {
			setIsDragging(false);
		};

		// Add event listeners
		document.addEventListener("mousemove", updateMousePosition);
		document.addEventListener("mouseover", handleMouseOver);
		document.addEventListener("mouseenter", handleMouseEnter);
		document.addEventListener("mouseleave", handleMouseLeave);
		document.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("mouseup", handleMouseUp);

		// Hide default cursor globally
		document.body.style.cursor = "none";
		document.documentElement.style.cursor = "none";

		// Also add a global CSS rule to ensure cursor is hidden everywhere
		const style = document.createElement("style");
		style.setAttribute("data-custom-cursor", "true");
		style.textContent = `
			* {
				cursor: none !important;
			}
			/* Allow interactive elements to have normal cursor behavior */
			button, a, input, textarea, select, [role="button"], [tabindex] {
				cursor: pointer !important;
			}
			/* Specifically for delete buttons and interactive elements */
			button:hover, a:hover, [role="button"]:hover, [tabindex]:hover {
				cursor: pointer !important;
			}
		`;
		document.head.appendChild(style);

		return () => {
			document.removeEventListener("mousemove", updateMousePosition);
			document.removeEventListener("mouseover", handleMouseOver);
			document.removeEventListener("mouseenter", handleMouseEnter);
			document.removeEventListener("mouseleave", handleMouseLeave);
			document.removeEventListener("mousedown", handleMouseDown);
			document.removeEventListener("mouseup", handleMouseUp);

			// Restore default cursor
			document.body.style.cursor = "auto";
			document.documentElement.style.cursor = "auto";

			// Remove the global CSS rule
			const existingStyle = document.querySelector("style[data-custom-cursor]");
			if (existingStyle) {
				existingStyle.remove();
			}
		};
	}, []);

	return (
		<div className="relative">
			{children}

			{/* Custom Cursor */}
			{isVisible && !isHoveringInteractive && (
				<div
					className="fixed pointer-events-none z-[10000] transition-all duration-100 ease-out overflow-visible"
					style={{
						left: mousePosition.x,
						top: mousePosition.y,
						transform: `translate(-50%, -50%) scale(${isDragging ? 1.2 : 1})`,
					}}
				>
					{/* Little Card */}
					<div
						className={`absolute -bottom-4 left-8 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3 min-w-[120px] transition-all duration-200 ${
							isHoveringDraggable ? "scale-105 shadow-xl" : ""
						}`}
					>
						<div className="flex items-center space-x-2">
							<Image
								src="/logos/closed-fridge.png"
								alt="Fridge"
								width={20}
								height={20}
								className="flex-shrink-0"
							/>
							<div className="text-xs text-gray-700 font-medium">
								{isDragging
									? "Dragging..."
									: isHoveringDraggable
									? "Drag me!"
									: "Hello mo!"}
							</div>
						</div>
					</div>

					{/* Custom Cursor SVG */}
					<div
						className={`relative transition-all duration-100 ${
							isDragging ? "rotate-12" : isHoveringDraggable ? "rotate-6" : ""
						}`}
					>
						<Image
							src="/cursors/custom-cursor.svg"
							alt="Custom Cursor"
							width={20}
							height={20}
							className={`drop-shadow-sm transition-all duration-100 ${
								isDragging ? "opacity-80" : "opacity-100"
							}`}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
