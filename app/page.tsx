"use client";
import Image from "next/image";
import { AppDock } from "@/components/ui/app-dock";
import { GlobalDragContainer } from "@/components/ui/global-drag-container";
import { DraggableItem } from "@/components/ui/draggable-item";
import { CustomCursor } from "@/components/ui/custom-cursor";
import BarkleyAnimation from "@/components/animations/barkley-animation";
import { useNotesBackend } from "@/hooks/useNotesBackend";
import { useSpotify } from "@/hooks/useSpotify";
import { NoteItem } from "@/components/ui/note-item";
import { ImageItem } from "@/components/ui/image-item";
import { MusicItem } from "@/components/ui/music-item";

export default function Home() {
	const {
		notes,
		images,
		addNote,
		updateNotePosition,
		deleteNote,
		addImage,
		updateImagePosition,
		deleteImage,
		isConnected,
		isLoading,
		error,
	} = useNotesBackend();

	const {
		isAuthenticated: isSpotifyAuthenticated,
		isLoading: isSpotifyLoading,
		error: spotifyError,
		currentlyPlaying,
		authenticate: authenticateSpotify,
	} = useSpotify();

	return (
		<CustomCursor>
			<div className="min-h-screen w-full bg-white relative overflow-hidden">
				{/* Connection Status */}
				<div className="fixed top-4 right-4 z-50 flex items-center gap-2">
					{isLoading && (
						<div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
							Loading...
						</div>
					)}
					{error && (
						<div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
							Error: {error}
						</div>
					)}
					{isConnected && !isLoading && (
						<div className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-1 font-jacquard">
							<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
							Connected
						</div>
					)}
					{!isConnected && !isLoading && !error && (
						<div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center gap-1 font-jacquard">
							<div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
							Connecting...
						</div>
					)}
				</div>
				{/* Pink Corner Dream Background - Fixed position */}
				<div
					className="fixed inset-0 z-0 pointer-events-none"
					style={{
						backgroundImage: `
        radial-gradient(circle 600px at 0% 200px, #fce7f3, transparent),
        radial-gradient(circle 600px at 100% 200px, #fce7f3, transparent)
      `,
					}}
				/>
				{/* Global Drag Container - Everything inside is draggable */}
				<GlobalDragContainer className="z-10 relative">
					<DraggableItem
						id="fridge-logo"
						initialPosition={{ x: 20, y: 20 }}
						className="group cursor-pointer bg-white/80 backdrop-blur-sm px-4 py-4 rounded-lg shadow-lg"
					>
						<div className="relative">
							<Image
								src="/logos/closed-fridge.png"
								alt="Closed Fridge"
								width={180}
								height={100}
								className="block group-hover:hidden transition-opacity duration-200"
							/>
							<Image
								src="/logos/opened-fridge.png"
								alt="Opened Fridge"
								width={180}
								height={100}
								className="hidden group-hover:block transition-opacity duration-200"
							/>
						</div>
					</DraggableItem>
					<DraggableItem
						id="barkley-animation"
						initialPosition={{ x: 20, y: 20 }}
						className="cursor-pointer bg-white/80 backdrop-blur-sm px-4 py-4 rounded-lg shadow-lg w-[400px] h-[360px] flex flex-col gap-[40px] justify-between"
					>
						<div className="w-full flex items-center justify-between">
							<div className="w-fit flex items-center gap-3 ">
								<div className="w-[8px] h-[8px] bg-main-pink animate-ping rounded-full" />
								<div className="text-2xl font-jersey">Barkley Cam</div>
							</div>
							<div className="w-fit flex items-center gap-6">
								<button className="group py-2 border-b border-black">
									<Image
										src="/icons/heart.svg"
										alt="button to give barkley hearts"
										height={12}
										width={12}
										className="group-hover:scale-120 transition-transform duration-600"
									/>
								</button>
								<button className="group py-2 border-b border-black">
									<Image
										src="/icons/close.svg"
										alt="button to close barkley cam"
										className="group-hover:opacity-60 group-hover:scale-120 transition-all duration-600"
										height={12}
										width={12}
									/>
								</button>
							</div>
						</div>
						<div className="grow w-full rounded-md bg-[url(/backgrounds/room.png)] bg-cover bg-center flex flex-col justify-end items-center pb-[4px]">
							<BarkleyAnimation />
						</div>
					</DraggableItem>
					<DraggableItem
						id="hello-text"
						initialPosition={{ x: 0, y: 0 }}
						className="text-4xl text-gray-800 font-jacquard bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg"
					>
						Hello! 👋
					</DraggableItem>

					{/* Render dynamic notes */}
					{notes.map((note) => (
						<NoteItem
							key={note.id}
							note={note}
							onUpdatePosition={updateNotePosition}
							onDelete={deleteNote}
						/>
					))}

					{/* Render dynamic images */}
					{images.map((image) => (
						<ImageItem
							key={image.id}
							image={image}
							onUpdatePosition={updateImagePosition}
							onDelete={deleteImage}
						/>
					))}

					{/* Dynamic Spotify Music Player */}
					<MusicItem
						playbackState={currentlyPlaying}
						isAuthenticated={isSpotifyAuthenticated}
						isLoading={isSpotifyLoading}
						error={spotifyError}
						onAuthenticate={authenticateSpotify}
						initialPosition={{ x: 120, y: 600 }}
					/>
				</GlobalDragContainer>

				{/* App Dock - positioned at bottom */}
				<AppDock onAddNote={addNote} onAddImage={addImage} />
			</div>
		</CustomCursor>
	);
}
