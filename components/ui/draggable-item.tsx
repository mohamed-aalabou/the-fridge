"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDraggable } from "@dnd-kit/core";

interface DraggableItemProps {
	id: string;
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
	dragHandle?: boolean;
	initialPosition?: { x: number; y: number };
	onPositionChange?: (position: { x: number; y: number }) => void;
}

export function DraggableItem({
	id,
	children,
	className = "",
	style = {},
	dragHandle = true,
	initialPosition = { x: 0, y: 0 },
	onPositionChange,
}: DraggableItemProps) {
	const [position, setPosition] = useState(initialPosition);
	const [isFirstLoad, setIsFirstLoad] = useState(true);
	const [lastTransform, setLastTransform] = useState<{
		x: number;
		y: number;
	} | null>(null);
	const { attributes, listeners, setNodeRef, transform, isDragging } =
		useDraggable({
			id: id,
		});

	// Load position from localStorage on mount
	useEffect(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem(`drag-position-${id}`);
			if (saved) {
				try {
					const parsedPosition = JSON.parse(saved);
					setPosition(parsedPosition);
				} catch (e) {
					// Keep initial position if parsing fails
				}
			}
		}
		setIsFirstLoad(false);
	}, [id]);

	// Capture transform when it exists
	useEffect(() => {
		if (transform) {
			setLastTransform({ x: transform.x, y: transform.y });
		}
	}, [transform]);

	// Update position when drag ends
	useEffect(() => {
		console.log(
			"Drag states : ",
			isDragging,
			position,
			isFirstLoad,
			transform,
			lastTransform
		);
		if (!isDragging && !isFirstLoad && lastTransform) {
			// Get viewport dimensions to constrain positioning
			const viewportWidth =
				typeof window !== "undefined" ? window.innerWidth : 1920;
			const viewportHeight =
				typeof window !== "undefined" ? window.innerHeight : 1080;

			// Estimate element dimensions (rough approximation)
			const elementWidth = 200; // Most elements are around this size
			const elementHeight = 100;

			const newPosition = {
				x: Math.max(
					0,
					Math.min(position.x + lastTransform.x, viewportWidth - elementWidth)
				),
				y: Math.max(
					0,
					Math.min(position.y + lastTransform.y, viewportHeight - elementHeight)
				),
			};

			console.log(
				"Updating position from",
				position,
				"to",
				newPosition,
				"with transform",
				lastTransform
			);

			setPosition(newPosition);
			setLastTransform(null); // Reset the captured transform

			// Call the position change callback if provided
			if (onPositionChange) {
				onPositionChange(newPosition);
			}

			// Save to localStorage
			if (typeof window !== "undefined") {
				localStorage.setItem(
					`drag-position-${id}`,
					JSON.stringify(newPosition)
				);
			}
		}
	}, [isDragging, position, id, isFirstLoad, lastTransform]);

	return (
		<div
			ref={setNodeRef}
			data-draggable="true"
			style={{
				...style,
				position: "absolute",
				left: position.x,
				top: position.y,
				transform: transform
					? `translate3d(${transform.x}px, ${transform.y}px, 0)`
					: undefined,
				cursor: "none",
				zIndex: isDragging ? 1000 : 1,
			}}
			className={`${className} ${isDragging ? "opacity-50" : ""}`}
			{...(dragHandle ? listeners : {})}
			{...(dragHandle ? attributes : {})}
		>
			{children}
		</div>
	);
}
