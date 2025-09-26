"use client";
import { useState, useEffect } from "react";

export interface Note {
	id: string;
	content: string;
	createdAt: Date;
	position: { x: number; y: number };
}

const STORAGE_KEY = "fridge-notes";

export function useNotes() {
	const [notes, setNotes] = useState<Note[]>([]);

	// Load notes from localStorage on mount
	useEffect(() => {
		const savedNotes = localStorage.getItem(STORAGE_KEY);
		if (savedNotes) {
			try {
				const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
					...note,
					createdAt: new Date(note.createdAt),
				}));
				setNotes(parsedNotes);
			} catch (error) {
				console.error("Error loading notes from localStorage:", error);
			}
		}
	}, []);

	// Save notes to localStorage whenever notes change
	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
	}, [notes]);

	const addNote = (content: string) => {
		if (!content.trim()) return;

		const newNote: Note = {
			id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			content: content.trim(),
			createdAt: new Date(),
			position: {
				x: window.innerWidth / 2 - 150, // Center horizontally (assuming note width ~300px)
				y: window.innerHeight / 2 - 100, // Center vertically (assuming note height ~200px)
			},
		};

		setNotes((prevNotes) => [...prevNotes, newNote]);
	};

	const updateNotePosition = (
		id: string,
		position: { x: number; y: number }
	) => {
		setNotes((prevNotes) =>
			prevNotes.map((note) => (note.id === id ? { ...note, position } : note))
		);
	};

	const deleteNote = (id: string) => {
		setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
	};

	return {
		notes,
		addNote,
		updateNotePosition,
		deleteNote,
	};
}
