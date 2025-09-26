import {
	Dock,
	DockIcon,
	DockItem,
	DockLabel,
} from "@/components/motion-primitives/dock";
import Image from "next/image";
import StickieDialog from "@/components/ui/stickie-dialog";
import ImageUploadDialog from "@/components/ui/image-upload-dialog";

interface AppDockProps {
	onAddNote: (content: string) => void;
	onAddImage: (formData: FormData) => void;
}

export function AppDock({ onAddNote, onAddImage }: AppDockProps) {
	const data = [
		{
			title: "Notifications",
			icon: (
				<Image
					src="/icons/notification.svg"
					alt="Notifications"
					width={24}
					height={24}
				/>
			),
			href: "#",
		},
		{
			title: "Music",
			icon: <Image src="/icons/music.svg" alt="Music" width={24} height={24} />,
			href: "#",
		},
		{
			title: "Polaroid",
			icon: <ImageUploadDialog onImageUploaded={onAddImage} />,
			href: "#",
		},
		{
			title: "Stickies",
			icon: <StickieDialog onAddNote={onAddNote} />,
			href: "#",
		},
		{
			title: "Secrets",
			icon: (
				<Image src="/icons/secret.svg" alt="Music" width={24} height={24} />
			),
			href: "#",
		},
	];
	return (
		<div className="absolute bottom-2 left-1/2 max-w-full -translate-x-1/2 z-100">
			<Dock className="items-end pb-3 bg-main-pink/25">
				{data.map((item, idx) => (
					<DockItem
						key={idx}
						className="aspect-square rounded-full bg-main-purple"
					>
						<DockLabel className="font-jersey bg-main-purple text-white">
							{item.title}
						</DockLabel>
						<DockIcon>{item.icon}</DockIcon>
					</DockItem>
				))}
			</Dock>
		</div>
	);
}
