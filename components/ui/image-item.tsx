"use client";

import { DraggableItem } from "@/components/ui/draggable-item";
import { Image } from "../../lib/types";
import { Trash } from "lucide-react";

interface ImageItemProps {
	image: Image;
	onUpdatePosition: (id: string, position: { x: number; y: number }) => void;
	onDelete: (id: string) => void;
}

export function ImageItem({
	image,
	onUpdatePosition,
	onDelete,
}: ImageItemProps) {
	const handlePositionChange = (position: { x: number; y: number }) => {
		onUpdatePosition(image.id, position);
	};

	const handleDelete = () => {
		onDelete(image.id);
	};

	return (
		<DraggableItem
			id={image.id}
			initialPosition={image.position}
			onPositionChange={handlePositionChange}
			className="bg-white p-2 rounded-lg shadow-lg max-w-xs group cursor-pointer hover:shadow-xl transition-shadow duration-200"
		>
			<div className="relative">
				<img
					src={image.url}
					alt={image.originalName}
					className="w-full h-48 object-cover rounded-lg"
				/>

				{/* Delete button */}
				<button
					onClick={handleDelete}
					className="absolute top-2 right-2 opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity duration-200 bg-red-500 text-white rounded-full p-1 flex items-center justify-center text-sm cursor-pointer"
					role="button"
					tabIndex={0}
				>
					<Trash className="h-4 w-4" />
				</button>

				{/* Image info overlay */}
				<div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
					<div className="text-xs truncate">{image.originalName}</div>
					<div className="text-xs text-gray-300">
						{new Date(image.createdAt).toLocaleDateString()}{" "}
						{new Date(image.createdAt).toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</div>
				</div>
			</div>
		</DraggableItem>
	);
}
