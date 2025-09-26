"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { Note, Image } from "../lib/types";

export function useNotesBackend() {
	const [notes, setNotes] = useState<Note[]>([]);
	const [images, setImages] = useState<Image[]>([]);
	const [isConnected, setIsConnected] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const wsRef = useRef<WebSocket | null>(null);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const positionUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const isMountedRef = useRef(true);

	// Load notes from backend
	const loadNotes = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const fetchedNotes = await apiClient.getNotes();
			setNotes(fetchedNotes);
		} catch (err) {
			console.error("Error loading notes:", err);
			setError(err instanceof Error ? err.message : "Failed to load notes");
		} finally {
			setIsLoading(false);
		}
	}, []);

	const loadImages = useCallback(async () => {
		try {
			setError(null);
			const fetchedImages = await apiClient.getImages();
			setImages(fetchedImages);
		} catch (err) {
			console.error("Error loading images:", err);
			setError(err instanceof Error ? err.message : "Failed to load images");
		}
	}, []);

	// WebSocket connection management
	const connectWebSocket = useCallback(() => {
		if (wsRef.current?.readyState === WebSocket.OPEN) {
			return;
		}

		try {
			const ws = apiClient.connectWebSocket();
			wsRef.current = ws;

			ws.onopen = () => {
				console.log("WebSocket connected");
				setIsConnected(true);
				setError(null);
			};

			ws.onmessage = (event) => {
				try {
					const message = JSON.parse(event.data);
					handleWebSocketMessage(message);
				} catch (err) {
					console.error("Error parsing WebSocket message:", err);
				}
			};

			ws.onclose = () => {
				console.log("WebSocket disconnected");
				setIsConnected(false);

				// Attempt to reconnect after 3 seconds
				reconnectTimeoutRef.current = setTimeout(() => {
					connectWebSocket();
				}, 3000);
			};

			ws.onerror = (error) => {
				console.error("WebSocket error:", error);
				setError("WebSocket connection error");
			};
		} catch (err) {
			console.error("Error connecting WebSocket:", err);
			setError("Failed to connect to real-time updates");
		}
	}, []);

	const disconnectWebSocket = useCallback(() => {
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current);
			reconnectTimeoutRef.current = null;
		}

		if (wsRef.current) {
			wsRef.current.close();
			wsRef.current = null;
		}
		setIsConnected(false);
	}, []);

	// Handle WebSocket messages
	const handleWebSocketMessage = useCallback((message: any) => {
		switch (message.type) {
			case "connected":
				console.log("Connected to notes room");
				break;

			case "note_created":
				setNotes((prev) => [message.data, ...prev]);
				break;

			case "note_updated":
				setNotes((prev) =>
					prev.map((note) =>
						note.id === message.data.id ? message.data : note
					)
				);
				break;

			case "note_deleted":
				setNotes((prev) => prev.filter((note) => note.id !== message.data.id));
				break;

			case "position_updated":
				setNotes((prev) =>
					prev.map((note) =>
						note.id === message.data.id
							? { ...note, position: message.data.position }
							: note
					)
				);
				break;

			case "image_created":
				setImages((prev) => [message.data, ...prev]);
				break;

			case "image_updated":
				setImages((prev) =>
					prev.map((image) =>
						image.id === message.data.id ? message.data : image
					)
				);
				break;

			case "image_deleted":
				setImages((prev) =>
					prev.filter((image) => image.id !== message.data.id)
				);
				break;

			case "image_position_updated":
				setImages((prev) =>
					prev.map((image) =>
						image.id === message.data.id
							? { ...image, position: message.data.position }
							: image
					)
				);
				break;

			default:
				console.log("Unknown message type:", message.type);
		}
	}, []);

	// CRUD operations
	const addNote = useCallback(async (content: string) => {
		if (!content.trim()) return;

		try {
			setError(null);
			const newNote = await apiClient.createNote({
				content: content.trim(),
				position: {
					x: window.innerWidth / 2 - 150,
					y: window.innerHeight / 2 - 100,
				},
			});

			// Note will be added via WebSocket, but we can add it optimistically
			setNotes((prev) => [newNote, ...prev]);
		} catch (err) {
			console.error("Error creating note:", err);
			setError(err instanceof Error ? err.message : "Failed to create note");
		}
	}, []);

	const updateNotePosition = useCallback(
		async (id: string, position: { x: number; y: number }) => {
			// Always update UI optimistically
			setNotes((prev) =>
				prev.map((note) => (note.id === id ? { ...note, position } : note))
			);

			// Clear existing timeout
			if (positionUpdateTimeoutRef.current) {
				clearTimeout(positionUpdateTimeoutRef.current);
			}

			// Debounce the API call by 300ms
			positionUpdateTimeoutRef.current = setTimeout(async () => {
				// Check if component is still mounted
				if (!isMountedRef.current) return;

				try {
					setError(null);
					await apiClient.updateNotePosition(id, position);
				} catch (err) {
					// Only handle errors if component is still mounted
					if (!isMountedRef.current) return;

					// Don't show network errors as they're usually temporary
					if (err instanceof Error && err.message.includes("Network error")) {
						console.warn(
							"Network error during position update, will retry on next change"
						);
						return;
					}

					console.error("Error updating note position:", err);
					setError(
						err instanceof Error ? err.message : "Failed to update position"
					);
					// Revert optimistic update
					loadNotes();
				}
			}, 300);
		},
		[loadNotes]
	);

	const updateNoteContent = useCallback(async (id: string, content: string) => {
		try {
			setError(null);
			await apiClient.updateNote(id, { content });
		} catch (err) {
			console.error("Error updating note content:", err);
			setError(err instanceof Error ? err.message : "Failed to update note");
		}
	}, []);

	const deleteNote = useCallback(
		async (id: string) => {
			try {
				setError(null);

				// Optimistic update
				setNotes((prev) => prev.filter((note) => note.id !== id));

				// Send to backend
				await apiClient.deleteNote(id);
			} catch (err) {
				console.error("Error deleting note:", err);
				setError(err instanceof Error ? err.message : "Failed to delete note");

				// Revert optimistic update
				loadNotes();
			}
		},
		[loadNotes]
	);

	// Image CRUD operations
	const addImage = useCallback(async (formData: FormData) => {
		try {
			setError(null);
			const image = await apiClient.uploadImage(formData);
			// Image will be added via WebSocket message
		} catch (err) {
			console.error("Error uploading image:", err);
			setError(err instanceof Error ? err.message : "Failed to upload image");
		}
	}, []);

	const updateImagePosition = useCallback(
		async (id: string, position: { x: number; y: number }) => {
			// Always update UI optimistically
			setImages((prev) =>
				prev.map((image) => (image.id === id ? { ...image, position } : image))
			);

			// Clear existing timeout
			if (positionUpdateTimeoutRef.current) {
				clearTimeout(positionUpdateTimeoutRef.current);
			}

			// Debounce the API call by 300ms
			positionUpdateTimeoutRef.current = setTimeout(async () => {
				// Check if component is still mounted
				if (!isMountedRef.current) return;

				try {
					setError(null);
					await apiClient.updateImagePosition(id, position);
				} catch (err) {
					// Only handle errors if component is still mounted
					if (!isMountedRef.current) return;

					// Don't show network errors as they're usually temporary
					if (err instanceof Error && err.message.includes("Network error")) {
						console.warn(
							"Network error during image position update, will retry on next change"
						);
						return;
					}

					console.error("Error updating image position:", err);
					setError(
						err instanceof Error ? err.message : "Failed to update position"
					);
					// Revert optimistic update
					loadImages();
				}
			}, 300);
		},
		[loadImages]
	);

	const deleteImage = useCallback(
		async (id: string) => {
			// Optimistic update
			setImages((prev) => prev.filter((image) => image.id !== id));

			try {
				// Send to backend
				await apiClient.deleteImage(id);
			} catch (err) {
				console.error("Error deleting image:", err);
				setError(err instanceof Error ? err.message : "Failed to delete image");

				// Revert optimistic update
				loadImages();
			}
		},
		[loadImages]
	);

	// Initialize
	useEffect(() => {
		isMountedRef.current = true;
		loadNotes();
		loadImages();
		connectWebSocket();

		return () => {
			isMountedRef.current = false;
			disconnectWebSocket();
			// Clear any pending position updates
			if (positionUpdateTimeoutRef.current) {
				clearTimeout(positionUpdateTimeoutRef.current);
			}
		};
	}, [loadNotes, loadImages, connectWebSocket, disconnectWebSocket]);

	return {
		notes,
		images,
		isConnected,
		isLoading,
		error,
		addNote,
		updateNotePosition,
		updateNoteContent,
		deleteNote,
		addImage,
		updateImagePosition,
		deleteImage,
		retry: loadNotes,
	};
}
