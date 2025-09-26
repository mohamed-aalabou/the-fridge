"use client";

import React from "react";
import { DraggableItem } from "@/components/ui/draggable-item";
import { SpotifyTrack, SpotifyPlaybackState } from "../../lib/types";
import { Play, Pause, ExternalLink, Music } from "lucide-react";

interface MusicItemProps {
	playbackState: SpotifyPlaybackState | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	onAuthenticate: () => void;
	onUpdatePosition?: (position: { x: number; y: number }) => void;
	initialPosition?: { x: number; y: number };
}

export function MusicItem({
	playbackState,
	isAuthenticated,
	isLoading,
	error,
	onAuthenticate,
	onUpdatePosition,
	initialPosition = { x: 120, y: 600 },
}: MusicItemProps) {
	const formatDuration = (ms: number): string => {
		const minutes = Math.floor(ms / 60000);
		const seconds = Math.floor((ms % 60000) / 1000);
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	};

	const formatProgress = (progress: number, duration: number): string => {
		const progressMs = Math.floor((progress / 100) * duration);
		return formatDuration(progressMs);
	};

	const handlePositionChange = (position: { x: number; y: number }) => {
		onUpdatePosition?.(position);
	};

	const renderTrackInfo = (track: SpotifyTrack) => {
		const albumImage =
			track.album.images.find((img) => img.height >= 300) ||
			track.album.images[0];
		const artistNames = track.artists.map((artist) => artist.name).join(", ");

		return (
			<div className="flex items-center space-x-3">
				{/* Album Art */}
				{albumImage && (
					<div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
						<img
							src={albumImage.url}
							alt={`${track.album.name} cover`}
							className="w-full h-full object-cover"
						/>
					</div>
				)}

				{/* Track Info */}
				<div className="flex-1 min-w-0">
					<div className="font-medium text-gray-800 truncate">{track.name}</div>
					<div className="text-sm text-gray-600 truncate">{artistNames}</div>
					<div className="text-xs text-gray-500 truncate">
						{track.album.name}
					</div>
				</div>

				{/* External Link */}
				<a
					href={track.external_urls.spotify}
					target="_blank"
					rel="noopener noreferrer"
					className="text-gray-400 hover:text-gray-600 transition-colors"
					title="Open in Spotify"
				>
					<ExternalLink className="w-4 h-4" />
				</a>
			</div>
		);
	};

	const renderProgressBar = (progress: number, duration: number) => {
		return (
			<div className="w-full mt-2">
				<div className="flex justify-between text-xs text-gray-500 mb-1">
					<span>{formatProgress(progress, duration)}</span>
					<span>{formatDuration(duration)}</span>
				</div>
				<div className="w-full bg-gray-200 rounded-full h-1">
					<div
						className="bg-green-500 h-1 rounded-full transition-all duration-300"
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>
		);
	};

	if (!isAuthenticated) {
		return (
			<DraggableItem
				id="music-player"
				initialPosition={initialPosition}
				onPositionChange={handlePositionChange}
				className="bg-purple-100 p-4 rounded-lg shadow-lg max-w-xs group cursor-pointer hover:shadow-xl transition-shadow duration-200"
			>
				<div className="flex items-center space-x-3">
					<div className="text-2xl">🎵</div>
					<div className="flex-1">
						<div className="font-medium text-main-black font-jersey">
							Spotify Player
						</div>
						<div className="text-sm text-gray-600 mb-2 font-jersey">
							Connect to see what you're playing
						</div>
						{error && <div className="text-xs text-red-600 mb-2">{error}</div>}
						<button
							onClick={onAuthenticate}
							disabled={isLoading}
							className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white text-sm px-3 py-1 rounded-full transition-colors duration-200 font-jersey"
						>
							{isLoading ? "Connecting..." : "Connect Spotify"}
						</button>
					</div>
				</div>
			</DraggableItem>
		);
	}

	if (isLoading) {
		return (
			<DraggableItem
				id="music-player"
				initialPosition={initialPosition}
				onPositionChange={handlePositionChange}
				className="bg-purple-100 p-4 rounded-lg shadow-lg max-w-xs"
			>
				<div className="flex items-center space-x-3">
					<div className="text-2xl">🎵</div>
					<div className="font-medium text-gray-800">Loading...</div>
				</div>
			</DraggableItem>
		);
	}

	if (error) {
		return (
			<DraggableItem
				id="music-player"
				initialPosition={initialPosition}
				onPositionChange={handlePositionChange}
				className="bg-red-100 p-4 rounded-lg shadow-lg max-w-xs"
			>
				<div className="flex items-center space-x-3">
					<div className="text-2xl">❌</div>
					<div>
						<div className="font-medium text-red-800">Error</div>
						<div className="text-sm text-red-600">{error}</div>
						<button
							onClick={onAuthenticate}
							className="mt-2 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-full transition-colors duration-200"
						>
							Retry
						</button>
					</div>
				</div>
			</DraggableItem>
		);
	}

	if (!playbackState || !playbackState.item) {
		return (
			<DraggableItem
				id="music-player"
				initialPosition={initialPosition}
				onPositionChange={handlePositionChange}
				className="bg-purple-100 p-4 rounded-lg shadow-lg max-w-xs"
			>
				<div className="flex items-center space-x-3">
					<div className="text-2xl">🎵</div>
					<div>
						<div className="font-medium text-gray-800">Spotify Player</div>
						<div className="text-sm text-gray-600">No music playing</div>
					</div>
				</div>
			</DraggableItem>
		);
	}

	const track = playbackState.item;
	const progress =
		track.duration_ms > 0
			? (playbackState.progress_ms / track.duration_ms) * 100
			: 0;

	return (
		<DraggableItem
			id="music-player"
			initialPosition={initialPosition}
			onPositionChange={handlePositionChange}
			className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-lg shadow-lg max-w-sm group cursor-pointer hover:shadow-xl transition-shadow duration-200 font-jersey"
		>
			<div className="flex items-center gap-2 justify-between mb-2">
				<div className="flex items-center space-x-2">
					<div className="text-xl">
						{playbackState.is_playing ? (
							<div className="flex items-center space-x-1">
								<Play className="w-4 h-4 text-green-500" />
								<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
							</div>
						) : (
							<div className="flex items-center space-x-1">
								<Pause className="w-4 h-4 text-gray-500" />
								<div className="w-2 h-2 bg-gray-500 rounded-full" />
							</div>
						)}
					</div>
					<span className="text-sm font-medium text-gray-700">
						{playbackState.is_playing ? "Now Playing" : "Paused"}
					</span>
				</div>
				<div className="text-sm text-gray-500">{playbackState.device.name}</div>
			</div>

			{renderTrackInfo(track)}
			{renderProgressBar(progress, track.duration_ms)}

			{/* Device info */}
			<div className="mt-2 text-xs text-gray-500 flex items-center space-x-1">
				<Music className="w-3 h-3" />
				<span>via {playbackState.device.type}</span>
			</div>
		</DraggableItem>
	);
}
