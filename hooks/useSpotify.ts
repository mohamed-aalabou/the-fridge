"use client";

import { useState, useEffect, useCallback } from "react";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { SpotifyPlaybackState, SpotifyTrack } from "../src/types";

interface UseSpotifyReturn {
	sdk: SpotifyApi | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	currentlyPlaying: SpotifyPlaybackState | null;
	authenticate: () => Promise<void>;
	refreshPlaybackState: () => Promise<void>;
}

export function useSpotify(): UseSpotifyReturn {
	const [sdk, setSdk] = useState<SpotifyApi | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [currentlyPlaying, setCurrentlyPlaying] =
		useState<SpotifyPlaybackState | null>(null);

	const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
	const redirectUri =
		typeof window !== "undefined" ? `${window.location.origin}` : "";

	const authenticate = useCallback(async () => {
		if (!clientId) {
			setError(
				"Spotify Client ID not configured. Please set NEXT_PUBLIC_SPOTIFY_CLIENT_ID environment variable."
			);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			// Perform user authorization which will redirect to Spotify
			await SpotifyApi.performUserAuthorization(clientId, redirectUri, [
				"user-read-currently-playing",
				"user-read-playback-state",
				"user-read-private",
			]);
		} catch (err) {
			console.error("Spotify authentication failed:", err);
			setError(err instanceof Error ? err.message : "Authentication failed");
			setIsLoading(false);
		}
	}, [clientId, redirectUri]);

	const refreshPlaybackState = useCallback(async () => {
		if (!sdk) return;

		try {
			const playbackState = await sdk.player.getPlaybackState();
			setCurrentlyPlaying(playbackState as SpotifyPlaybackState);
		} catch (err) {
			console.error("Failed to get playback state:", err);
			// Don't set error for this, as it might just mean no music is playing
			setCurrentlyPlaying(null);
		}
	}, [sdk]);

	// Auto-refresh playback state every 5 seconds
	useEffect(() => {
		if (!isAuthenticated) return;

		const interval = setInterval(refreshPlaybackState, 5000);
		return () => clearInterval(interval);
	}, [isAuthenticated, refreshPlaybackState]);

	// Handle authentication on mount and after redirect
	useEffect(() => {
		const initializeSpotify = async () => {
			if (!clientId) {
				setError(
					"Spotify Client ID not configured. Please set NEXT_PUBLIC_SPOTIFY_CLIENT_ID environment variable."
				);
				return;
			}

			try {
				// Create SDK instance
				const spotifySdk = SpotifyApi.withUserAuthorization(
					clientId,
					redirectUri,
					[
						"user-read-currently-playing",
						"user-read-playback-state",
						"user-read-private",
					]
				);

				// Check if we have a valid token (either from storage or redirect)
				const token = await spotifySdk.getAccessToken();
				if (token) {
					setSdk(spotifySdk);
					setIsAuthenticated(true);
					setIsLoading(false);
					// Fetch initial playback state
					try {
						const playbackState = await spotifySdk.player.getPlaybackState();
						setCurrentlyPlaying(playbackState as SpotifyPlaybackState);
					} catch (playbackErr) {
						console.log(
							"No music currently playing or error fetching playback state"
						);
						setCurrentlyPlaying(null);
					}
				}
			} catch (err) {
				console.log("Not authenticated with Spotify yet");
				setIsLoading(false);
			}
		};

		initializeSpotify();
	}, [clientId, redirectUri]);

	return {
		sdk,
		isAuthenticated,
		isLoading,
		error,
		currentlyPlaying,
		authenticate,
		refreshPlaybackState,
	};
}
