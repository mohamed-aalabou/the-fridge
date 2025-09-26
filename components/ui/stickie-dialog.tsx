import {
	MorphingDialog,
	MorphingDialogTrigger,
	MorphingDialogContent,
	MorphingDialogTitle,
	MorphingDialogSubtitle,
	MorphingDialogClose,
	MorphingDialogContainer,
	useMorphingDialog,
} from "@/components/motion-primitives/morphing-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface StickieDialogProps {
	onAddNote: (content: string) => void;
}

function StickieDialogContent({ onAddNote }: StickieDialogProps) {
	const [noteContent, setNoteContent] = useState("");
	const { setIsOpen } = useMorphingDialog();

	const handleSubmit = () => {
		if (noteContent.trim()) {
			onAddNote(noteContent);
			setNoteContent("");
			// Close the dialog after adding the note
			setIsOpen(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
			handleSubmit();
		}
	};

	return (
		<MorphingDialogContainer>
			<MorphingDialogContent
				style={{
					borderRadius: "12px",
				}}
				className="relative h-auto w-[500px] border border-gray-100 bg-white rounded-md shadow-xl"
			>
				<div className="relative p-6 h-full">
					<div className="h-[400px]">
						<MorphingDialogTitle className="text-main-dark mb-2 text-xl">
							<div className="font-medium text-gray-800 ">
								📝 Leave Quick Note
							</div>
						</MorphingDialogTitle>
						<MorphingDialogSubtitle className="font-light text-gray-400">
							So that the babies doesn't forget !
						</MorphingDialogSubtitle>
						<div className="py-4 flex flex-col gap-y-4 w-full h-full grow">
							<Textarea
								className="w-full min-h-[120px]"
								value={noteContent}
								onChange={(e) => setNoteContent(e.target.value)}
								onKeyDown={handleKeyPress}
								placeholder="Write your note here... (Ctrl/Cmd + Enter to submit)"
							/>
							<Button
								className="w-full bg-main-purple text-white font-jersey text-lg"
								onClick={handleSubmit}
								disabled={!noteContent.trim()}
							>
								Post it !
							</Button>
						</div>
					</div>
				</div>
				<MorphingDialogClose className="text-zinc-500" />
			</MorphingDialogContent>
		</MorphingDialogContainer>
	);
}

export default function StickieDialog({ onAddNote }: StickieDialogProps) {
	return (
		<MorphingDialog
			transition={{
				type: "spring",
				stiffness: 200,
				damping: 24,
			}}
		>
			<MorphingDialogTrigger>
				<Image src="/icons/note.svg" alt="Music" width={24} height={24} />
			</MorphingDialogTrigger>
			<StickieDialogContent onAddNote={onAddNote} />
		</MorphingDialog>
	);
}
