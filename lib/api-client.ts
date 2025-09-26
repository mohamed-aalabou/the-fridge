import {
	Note,
	CreateNoteRequest,
	UpdateNoteRequest,
	Image,
	UpdateImageRequest,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

export class APIClient {
	private baseUrl: string;

	constructor(baseUrl: string = API_BASE_URL) {
		this.baseUrl = baseUrl;
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;

		try {
			const response = await fetch(url, {
				headers: {
					"Content-Type": "application/json",
					...options.headers,
				},
				...options,
			});

			if (!response.ok) {
				let errorMessage = `HTTP ${response.status}`;
				try {
					const error = await response.json();
					errorMessage = error.error || errorMessage;
				} catch {
					// If response is not JSON, use status text
					errorMessage = response.statusText || errorMessage;
				}
				throw new Error(errorMessage);
			}

			return response.json();
		} catch (error) {
			if (error instanceof Error) {
				// Check if it's a network error
				if (
					error.message.includes("Failed to fetch") ||
					error.name === "TypeError"
				) {
					throw new Error("Network error: Unable to connect to server");
				}
				throw error;
			}
			throw new Error("Network error: Failed to fetch");
		}
	}

	// Notes API
	async getNotes(): Promise<Note[]> {
		return this.request<Note[]>("/api/notes");
	}

	async getNote(id: string): Promise<Note> {
		return this.request<Note>(`/api/notes/${id}`);
	}

	async createNote(noteData: CreateNoteRequest): Promise<Note> {
		return this.request<Note>("/api/notes", {
			method: "POST",
			body: JSON.stringify(noteData),
		});
	}

	async updateNote(id: string, updateData: UpdateNoteRequest): Promise<Note> {
		return this.request<Note>(`/api/notes/${id}`, {
			method: "PUT",
			body: JSON.stringify(updateData),
		});
	}

	async updateNotePosition(
		id: string,
		position: { x: number; y: number }
	): Promise<Note> {
		return this.request<Note>(`/api/notes/${id}/position`, {
			method: "PATCH",
			body: JSON.stringify({ position }),
		});
	}

	async deleteNote(id: string): Promise<void> {
		await this.request(`/api/notes/${id}`, {
			method: "DELETE",
		});
	}

	// Images API
	async getImages(): Promise<Image[]> {
		return this.request<Image[]>("/api/images");
	}

	async uploadImage(formData: FormData): Promise<Image> {
		const url = `${this.baseUrl}/api/images`;

		try {
			const response = await fetch(url, {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				let errorMessage = `HTTP ${response.status}`;
				try {
					const error = await response.json();
					errorMessage = error.error || errorMessage;
				} catch {
					errorMessage = response.statusText || errorMessage;
				}
				throw new Error(errorMessage);
			}

			return response.json();
		} catch (error) {
			if (error instanceof Error) {
				if (
					error.message.includes("Failed to fetch") ||
					error.name === "TypeError"
				) {
					throw new Error("Network error: Unable to connect to server");
				}
				throw error;
			}
			throw new Error("Network error: Failed to fetch");
		}
	}

	async updateImage(
		id: string,
		updateData: UpdateImageRequest
	): Promise<Image> {
		return this.request<Image>(`/api/images/${id}`, {
			method: "PUT",
			body: JSON.stringify(updateData),
		});
	}

	async updateImagePosition(
		id: string,
		position: { x: number; y: number }
	): Promise<Image> {
		return this.request<Image>(`/api/images/${id}/position`, {
			method: "PATCH",
			body: JSON.stringify({ position }),
		});
	}

	async deleteImage(id: string): Promise<{ success: boolean }> {
		return this.request<{ success: boolean }>(`/api/images/${id}`, {
			method: "DELETE",
		});
	}

	// WebSocket connection
	connectWebSocket(): WebSocket {
		const wsUrl = this.baseUrl.replace("http", "ws") + "/ws";
		return new WebSocket(wsUrl);
	}
}

export const apiClient = new APIClient();
