"use client";

import React, { useState, useRef } from "react";
import {
	DndContext,
	DragEndEvent,
	DragOverlay,
	DragStartEvent,
	DragMoveEvent,
	useSensor,
	useSensors,
	PointerSensor,
	KeyboardSensor,
	closestCenter,
} from "@dnd-kit/core";

interface GlobalDragContainerProps {
	children: React.ReactNode;
	className?: string;
}

export function GlobalDragContainer({
	children,
	className = "",
}: GlobalDragContainerProps) {
	const [activeId, setActiveId] = useState<string | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor)
	);

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	};

	const handleDragMove = (event: DragMoveEvent) => {
		// This will be handled by individual draggable items
	};

	const handleDragEnd = (event: DragEndEvent) => {
		setActiveId(null);
	};

	return (
		<div
			ref={containerRef}
			className={`relative w-full h-full ${className}`}
			style={{
				height: "100vh",
				maxHeight: "100vh",
				overflow: "hidden",
			}}
		>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragStart={handleDragStart}
				onDragMove={handleDragMove}
				onDragEnd={handleDragEnd}
			>
				<div
					className="relative w-full h-full"
					style={{
						height: "100vh",
						maxHeight: "100vh",
					}}
				>
					{children}
				</div>

				<DragOverlay>
					{activeId ? (
						<div className="opacity-50">
							{/* We'll render the active item here */}
						</div>
					) : null}
				</DragOverlay>
			</DndContext>
		</div>
	);
}
