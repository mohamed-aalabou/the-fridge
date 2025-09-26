import {
	Note,
	CreateNoteRequest,
	UpdateNoteRequest,
	DurableObjectEnv,
} from "../types";

export class NotesAPI {
	constructor(private env: DurableObjectEnv) {}

	async getAllNotes(): Promise<Note[]> {
		try {
			// Try to get from KV cache first (if available)
			if (this.env.NOTES_KV) {
				try {
					const cached = await this.env.NOTES_KV.get("notes:all");
					if (cached) {
						return JSON.parse(cached);
					}
				} catch (kvError) {
					console.warn(
						"KV cache not available, falling back to database:",
						kvError
					);
				}
			}

			// Get from D1 database
			const result = await this.env.NOTES_DB.prepare(
				"SELECT * FROM notes ORDER BY created_at DESC"
			).all();

			const notes: Note[] = result.results.map((row: any) => ({
				id: row.id,
				content: row.content,
				position: {
					x: row.position_x,
					y: row.position_y,
				},
				createdAt: row.created_at,
				updatedAt: row.updated_at,
			}));

			// Cache the result (if KV is available)
			if (this.env.NOTES_KV) {
				try {
					await this.env.NOTES_KV.put("notes:all", JSON.stringify(notes), {
						expirationTtl: 60, // Cache for 1 minute
					});
				} catch (kvError) {
					console.warn("Failed to cache notes:", kvError);
				}
			}

			return notes;
		} catch (error) {
			console.error("Error fetching notes:", error);
			throw new Error("Failed to fetch notes");
		}
	}

	async getNoteById(id: string): Promise<Note | null> {
		try {
			const result = await this.env.NOTES_DB.prepare(
				"SELECT * FROM notes WHERE id = ?"
			)
				.bind(id)
				.first();

			if (!result) {
				return null;
			}

			return {
				id: result.id,
				content: result.content,
				position: {
					x: result.position_x,
					y: result.position_y,
				},
				createdAt: result.created_at,
				updatedAt: result.updated_at,
			};
		} catch (error) {
			console.error("Error fetching note:", error);
			throw new Error("Failed to fetch note");
		}
	}

	async createNote(noteData: CreateNoteRequest): Promise<Note> {
		try {
			const id = `note-${Date.now()}-${Math.random()
				.toString(36)
				.substr(2, 9)}`;
			const now = new Date().toISOString();

			await this.env.NOTES_DB.prepare(
				`
          INSERT INTO notes (id, content, position_x, position_y, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `
			)
				.bind(
					id,
					noteData.content,
					noteData.position.x,
					noteData.position.y,
					now,
					now
				)
				.run();

			// Invalidate cache (if KV is available)
			if (this.env.NOTES_KV) {
				try {
					await this.env.NOTES_KV.delete("notes:all");
				} catch (kvError) {
					console.warn("Failed to invalidate cache:", kvError);
				}
			}

			const newNote: Note = {
				id,
				content: noteData.content,
				position: noteData.position,
				createdAt: now,
				updatedAt: now,
			};

			// Broadcast to all connected clients
			await this.broadcastToRoom({
				type: "note_created",
				data: newNote,
			});

			return newNote;
		} catch (error) {
			console.error("Error creating note:", error);
			throw new Error("Failed to create note");
		}
	}

	async updateNote(
		id: string,
		updateData: UpdateNoteRequest
	): Promise<Note | null> {
		try {
			const existingNote = await this.getNoteById(id);
			if (!existingNote) {
				return null;
			}

			const now = new Date().toISOString();
			const content = updateData.content ?? existingNote.content;
			const position = updateData.position ?? existingNote.position;

			await this.env.NOTES_DB.prepare(
				`
          UPDATE notes 
          SET content = ?, position_x = ?, position_y = ?, updated_at = ?
          WHERE id = ?
        `
			)
				.bind(content, position.x, position.y, now, id)
				.run();

			// Invalidate cache (if KV is available)
			if (this.env.NOTES_KV) {
				try {
					await this.env.NOTES_KV.delete("notes:all");
				} catch (kvError) {
					console.warn("Failed to invalidate cache:", kvError);
				}
			}

			const updatedNote: Note = {
				...existingNote,
				content,
				position,
				updatedAt: now,
			};

			// Broadcast to all connected clients
			await this.broadcastToRoom({
				type: "note_updated",
				data: updatedNote,
			});

			return updatedNote;
		} catch (error) {
			console.error("Error updating note:", error);
			throw new Error("Failed to update note");
		}
	}

	async deleteNote(id: string): Promise<boolean> {
		try {
			const result = await this.env.NOTES_DB.prepare(
				"DELETE FROM notes WHERE id = ?"
			)
				.bind(id)
				.run();

			if (result.changes === 0) {
				return false;
			}

			// Invalidate cache (if KV is available)
			if (this.env.NOTES_KV) {
				try {
					await this.env.NOTES_KV.delete("notes:all");
				} catch (kvError) {
					console.warn("Failed to invalidate cache:", kvError);
				}
			}

			// Broadcast to all connected clients
			await this.broadcastToRoom({
				type: "note_deleted",
				data: { id },
			});

			return true;
		} catch (error) {
			console.error("Error deleting note:", error);
			throw new Error("Failed to delete note");
		}
	}

	async updateNotePosition(
		id: string,
		position: { x: number; y: number }
	): Promise<Note | null> {
		try {
			const existingNote = await this.getNoteById(id);
			if (!existingNote) {
				return null;
			}

			const now = new Date().toISOString();

			await this.env.NOTES_DB.prepare(
				`
          UPDATE notes 
          SET position_x = ?, position_y = ?, updated_at = ?
          WHERE id = ?
        `
			)
				.bind(position.x, position.y, now, id)
				.run();

			// Invalidate cache (if KV is available)
			if (this.env.NOTES_KV) {
				try {
					await this.env.NOTES_KV.delete("notes:all");
				} catch (kvError) {
					console.warn("Failed to invalidate cache:", kvError);
				}
			}

			const updatedNote: Note = {
				...existingNote,
				position,
				updatedAt: now,
			};

			// Broadcast position update to all connected clients
			await this.broadcastToRoom({
				type: "position_updated",
				data: { id, position },
			});

			return updatedNote;
		} catch (error) {
			console.error("Error updating note position:", error);
			throw new Error("Failed to update note position");
		}
	}

	private async broadcastToRoom(message: any) {
		try {
			const roomId = this.env.NOTES_ROOM.idFromName("main-room");
			const room = this.env.NOTES_ROOM.get(roomId);
			await room.broadcastToAll(message);
		} catch (error) {
			console.error("Error broadcasting to room:", error);
		}
	}
}
