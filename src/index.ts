import { NotesAPI } from "./api/notes";
import { ImagesAPI } from "./api/images";
import { NotesRoom } from "./durable-objects/NotesRoom";
import { DurableObjectEnv } from "./types";

export { NotesRoom };

export default {
	async fetch(
		request: Request,
		env: DurableObjectEnv,
		ctx: ExecutionContext
	): Promise<Response> {
		const url = new URL(request.url);
		const notesAPI = new NotesAPI(env);
		const imagesAPI = new ImagesAPI(env);

		// CORS headers
		const corsHeaders = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		};

		// Handle preflight requests
		if (request.method === "OPTIONS") {
			return new Response(null, { status: 204, headers: corsHeaders });
		}

		try {
			// API Routes
			if (url.pathname.startsWith("/api/notes")) {
				return handleNotesAPI(request, notesAPI, corsHeaders);
			}

			if (url.pathname.startsWith("/api/images")) {
				return handleImagesAPI(request, imagesAPI, corsHeaders);
			}

			// WebSocket route for real-time updates
			if (url.pathname === "/ws") {
				return handleWebSocket(request, env, corsHeaders);
			}

			// Health check
			if (url.pathname === "/health") {
				return new Response(
					JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }),
					{
						status: 200,
						headers: { ...corsHeaders, "Content-Type": "application/json" },
					}
				);
			}

			return new Response("Not found", { status: 404, headers: corsHeaders });
		} catch (error) {
			console.error("Error handling request:", error);
			return new Response(JSON.stringify({ error: "Internal server error" }), {
				status: 500,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}
	},
};

async function handleNotesAPI(
	request: Request,
	notesAPI: NotesAPI,
	corsHeaders: Record<string, string>
): Promise<Response> {
	const url = new URL(request.url);
	const method = request.method;

	try {
		// GET /api/notes - Get all notes
		if (method === "GET" && url.pathname === "/api/notes") {
			const notes = await notesAPI.getAllNotes();
			return new Response(JSON.stringify(notes), {
				status: 200,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		// GET /api/notes/:id - Get specific note
		if (method === "GET" && url.pathname.startsWith("/api/notes/")) {
			const id = url.pathname.split("/")[3];
			const note = await notesAPI.getNoteById(id);

			if (!note) {
				return new Response(JSON.stringify({ error: "Note not found" }), {
					status: 404,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				});
			}

			return new Response(JSON.stringify(note), {
				status: 200,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		// POST /api/notes - Create new note
		if (method === "POST" && url.pathname === "/api/notes") {
			const noteData = await request.json();
			const note = await notesAPI.createNote(noteData);

			return new Response(JSON.stringify(note), {
				status: 201,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		// PUT /api/notes/:id - Update note
		if (method === "PUT" && url.pathname.startsWith("/api/notes/")) {
			const id = url.pathname.split("/")[3];
			const updateData = await request.json();
			const note = await notesAPI.updateNote(id, updateData);

			if (!note) {
				return new Response(JSON.stringify({ error: "Note not found" }), {
					status: 404,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				});
			}

			return new Response(JSON.stringify(note), {
				status: 200,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		// PATCH /api/notes/:id/position - Update note position
		if (method === "PATCH" && url.pathname.endsWith("/position")) {
			const id = url.pathname.split("/")[3];
			const { position } = await request.json();
			const note = await notesAPI.updateNotePosition(id, position);

			if (!note) {
				return new Response(JSON.stringify({ error: "Note not found" }), {
					status: 404,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				});
			}

			return new Response(JSON.stringify(note), {
				status: 200,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		// DELETE /api/notes/:id - Delete note
		if (method === "DELETE" && url.pathname.startsWith("/api/notes/")) {
			const id = url.pathname.split("/")[3];
			const deleted = await notesAPI.deleteNote(id);

			if (!deleted) {
				return new Response(JSON.stringify({ error: "Note not found" }), {
					status: 404,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				});
			}

			return new Response(JSON.stringify({ success: true }), {
				status: 200,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		return new Response("Method not allowed", {
			status: 405,
			headers: corsHeaders,
		});
	} catch (error) {
		console.error("Error in notes API:", error);
		return new Response(JSON.stringify({ error: "Internal server error" }), {
			status: 500,
			headers: { ...corsHeaders, "Content-Type": "application/json" },
		});
	}
}

async function handleWebSocket(
	request: Request,
	env: DurableObjectEnv,
	corsHeaders: Record<string, string>
): Promise<Response> {
	try {
		const roomId = env.NOTES_ROOM.idFromName("main-room");
		const room = env.NOTES_ROOM.get(roomId);

		return room.fetch(
			new Request("https://example.com/websocket", {
				method: "GET",
				headers: request.headers,
			})
		);
	} catch (error) {
		console.error("Error handling WebSocket:", error);
		return new Response("WebSocket connection failed", {
			status: 500,
			headers: corsHeaders,
		});
	}
}

async function handleImagesAPI(
	request: Request,
	imagesAPI: ImagesAPI,
	corsHeaders: Record<string, string>
): Promise<Response> {
	const url = new URL(request.url);

	try {
		// GET /api/images - Get all images
		if (request.method === "GET" && url.pathname === "/api/images") {
			const images = await imagesAPI.getAllImages();
			return new Response(JSON.stringify(images), {
				status: 200,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		// POST /api/images - Create new image
		if (request.method === "POST" && url.pathname === "/api/images") {
			const formData = await request.formData();
			const file = formData.get("file") as File;
			const positionX = parseInt(formData.get("positionX") as string);
			const positionY = parseInt(formData.get("positionY") as string);

			if (!file) {
				return new Response(JSON.stringify({ error: "No file provided" }), {
					status: 400,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				});
			}

			const image = await imagesAPI.createImage({
				file,
				position: { x: positionX, y: positionY },
			});

			return new Response(JSON.stringify(image), {
				status: 201,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		// GET /api/images/:id - Get specific image
		if (request.method === "GET" && url.pathname.startsWith("/api/images/")) {
			const id = url.pathname.split("/")[3];
			const image = await imagesAPI.getImageById(id);

			if (!image) {
				return new Response(JSON.stringify({ error: "Image not found" }), {
					status: 404,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				});
			}

			return new Response(JSON.stringify(image), {
				status: 200,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		// PUT /api/images/:id - Update image
		if (request.method === "PUT" && url.pathname.startsWith("/api/images/")) {
			const id = url.pathname.split("/")[3];
			const updateData = await request.json();

			const image = await imagesAPI.updateImage(id, updateData);

			if (!image) {
				return new Response(JSON.stringify({ error: "Image not found" }), {
					status: 404,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				});
			}

			return new Response(JSON.stringify(image), {
				status: 200,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		// PATCH /api/images/:id/position - Update image position
		if (request.method === "PATCH" && url.pathname.endsWith("/position")) {
			const id = url.pathname.split("/")[3];
			const { position } = await request.json();

			const image = await imagesAPI.updateImagePosition(id, position);

			if (!image) {
				return new Response(JSON.stringify({ error: "Image not found" }), {
					status: 404,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				});
			}

			return new Response(JSON.stringify(image), {
				status: 200,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		// DELETE /api/images/:id - Delete image
		if (
			request.method === "DELETE" &&
			url.pathname.startsWith("/api/images/")
		) {
			const id = url.pathname.split("/")[3];
			const success = await imagesAPI.deleteImage(id);

			if (!success) {
				return new Response(JSON.stringify({ error: "Image not found" }), {
					status: 404,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				});
			}

			return new Response(JSON.stringify({ success: true }), {
				status: 200,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		return new Response("Not found", { status: 404, headers: corsHeaders });
	} catch (error) {
		console.error("Error handling images API:", error);
		return new Response(JSON.stringify({ error: "Internal server error" }), {
			status: 500,
			headers: { ...corsHeaders, "Content-Type": "application/json" },
		});
	}
}
