"use client";
import { DraggableItem } from "@/components/ui/draggable-item";
import { Note } from "../../lib/types";

interface NoteItemProps {
	note: Note;
	onUpdatePosition: (id: string, position: { x: number; y: number }) => void;
	onDelete: (id: string) => void;
}

export function NoteItem({ note, onUpdatePosition, onDelete }: NoteItemProps) {
	const handlePositionChange = (position: { x: number; y: number }) => {
		onUpdatePosition(note.id, position);
	};

	const handleDelete = () => {
		onDelete(note.id);
	};

	return (
		<DraggableItem
			id={note.id}
			initialPosition={note.position}
			onPositionChange={handlePositionChange}
			className="bg-yellow-200 p-4 rounded-lg shadow-lg max-w-xs group cursor-pointer hover:shadow-xl transition-shadow duration-200 min-w-[240px]"
		>
			<div className="flex justify-between items-start mb-2">
				<div className="font-medium text-gray-800 flex items-center gap-2">
					<span>📝</span>
					<span>Quick Note</span>
				</div>
				<button
					onClick={handleDelete}
					className="opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity duration-200 text-gray-500 hover:text-red-500 text-sm cursor-pointer"
					role="button"
					tabIndex={0}
				>
					×
				</button>
			</div>
			<div className="text-sm text-gray-600 mb-2">{note.content}</div>
			<div className="text-xs text-gray-400">
				{new Date(note.createdAt).toLocaleDateString()}{" "}
				{new Date(note.createdAt).toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				})}
			</div>
		</DraggableItem>
	);
}
