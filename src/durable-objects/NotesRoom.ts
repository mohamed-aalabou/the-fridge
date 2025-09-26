import { DurableObject } from "cloudflare:workers";
import { Note, WebSocketMessage } from "../types";

export class NotesRoom extends DurableObject {
	private connections: Set<WebSocket> = new Set();

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === "/websocket") {
			return this.handleWebSocket(request);
		}

		return new Response("Not found", { status: 404 });
	}

	private async handleWebSocket(request: Request): Promise<Response> {
		const { 0: client, 1: server } = new WebSocketPair();

		this.connections.add(server);

		server.accept();

		server.addEventListener("message", async (event) => {
			try {
				const message = JSON.parse(event.data as string);
				await this.handleMessage(message, server);
			} catch (error) {
				console.error("Error handling WebSocket message:", error);
				server.send(
					JSON.stringify({
						type: "error",
						message: "Invalid message format",
					})
				);
			}
		});

		server.addEventListener("close", () => {
			this.connections.delete(server);
		});

		// Send initial connection confirmation
		server.send(
			JSON.stringify({
				type: "connected",
				message: "Connected to notes room",
			})
		);

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	private async handleMessage(message: any, sender: WebSocket) {
		switch (message.type) {
			case "broadcast_position_update":
				this.broadcastToOthers(sender, {
					type: "position_updated",
					data: message.data,
				});
				break;

			case "broadcast_note_update":
				this.broadcastToOthers(sender, {
					type: "note_updated",
					data: message.data,
				});
				break;

			case "broadcast_note_created":
				this.broadcastToOthers(sender, {
					type: "note_created",
					data: message.data,
				});
				break;

			case "broadcast_note_deleted":
				this.broadcastToOthers(sender, {
					type: "note_deleted",
					data: message.data,
				});
				break;

			default:
				console.log("Unknown message type:", message.type);
		}
	}

	private broadcastToOthers(sender: WebSocket, message: WebSocketMessage) {
		const messageStr = JSON.stringify(message);

		this.connections.forEach((connection) => {
			if (connection !== sender && connection.readyState === WebSocket.OPEN) {
				connection.send(messageStr);
			}
		});
	}

	// Method to broadcast to all connections (including sender)
	async broadcastToAll(message: WebSocketMessage) {
		const messageStr = JSON.stringify(message);

		this.connections.forEach((connection) => {
			if (connection.readyState === WebSocket.OPEN) {
				connection.send(messageStr);
			}
		});
	}
}
