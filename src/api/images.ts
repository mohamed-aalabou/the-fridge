import {
	Image,
	CreateImageRequest,
	UpdateImageRequest,
	DurableObjectEnv,
} from "../types";

export class ImagesAPI {
	constructor(private env: DurableObjectEnv) {}

	async getAllImages(): Promise<Image[]> {
		const result = await this.env.NOTES_DB.prepare(
			"SELECT id, url, original_name as originalName, position_x as positionX, position_y as positionY, created_at as createdAt, updated_at as updatedAt FROM images ORDER BY updated_at DESC"
		).all();

		return result.results.map((row: any) => ({
			id: row.id,
			url: row.url,
			originalName: row.originalName,
			position: {
				x: row.positionX,
				y: row.positionY,
			},
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
		}));
	}

	async getImageById(id: string): Promise<Image | null> {
		const result = await this.env.NOTES_DB.prepare(
			"SELECT id, url, original_name as originalName, position_x as positionX, position_y as positionY, created_at as createdAt, updated_at as updatedAt FROM images WHERE id = ?"
		)
			.bind(id)
			.first();

		if (!result) return null;

		return {
			id: result.id,
			url: result.url,
			originalName: result.originalName,
			position: {
				x: result.positionX,
				y: result.positionY,
			},
			createdAt: result.createdAt,
			updatedAt: result.updatedAt,
		};
	}

	async createImage(imageData: CreateImageRequest): Promise<Image> {
		const id = `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		const timestamp = new Date().toISOString();

		// Upload file to R2
		const fileKey = `images/${id}/${imageData.file.name}`;
		await this.env.IMAGES_BUCKET.put(fileKey, imageData.file, {
			httpMetadata: {
				contentType: imageData.file.type,
			},
		});

		// Generate public URL - use the correct R2 public URL
		const bucketName = this.env.IMAGES_BUCKET.name;
		const url = `https://pub-e43b0a0adcf6463b8e901ddeb3dfce05.r2.dev/${fileKey}`;

		// Save to database
		await this.env.NOTES_DB.prepare(
			"INSERT INTO images (id, url, original_name, position_x, position_y, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
		)
			.bind(
				id,
				url,
				imageData.file.name,
				imageData.position.x,
				imageData.position.y,
				timestamp,
				timestamp
			)
			.run();

		const image: Image = {
			id,
			url,
			originalName: imageData.file.name,
			position: imageData.position,
			createdAt: timestamp,
			updatedAt: timestamp,
		};

		// Broadcast to room
		await this.broadcastToRoom({
			type: "image_created",
			data: image,
		});

		return image;
	}

	async updateImage(
		id: string,
		updateData: UpdateImageRequest
	): Promise<Image | null> {
		const timestamp = new Date().toISOString();

		if (updateData.position) {
			await this.env.NOTES_DB.prepare(
				"UPDATE images SET position_x = ?, position_y = ?, updated_at = ? WHERE id = ?"
			)
				.bind(updateData.position.x, updateData.position.y, timestamp, id)
				.run();
		}

		const updatedImage = await this.getImageById(id);
		if (updatedImage) {
			// Broadcast to room
			await this.broadcastToRoom({
				type: "image_updated",
				data: updatedImage,
			});
		}

		return updatedImage;
	}

	async deleteImage(id: string): Promise<boolean> {
		// Get image info first to delete from R2
		const image = await this.getImageById(id);
		if (!image) return false;

		// Extract file key from URL (format: https://pub-<hash>.r2.dev/<bucket>/<key>)
		const urlParts = image.url.split("/");
		const fileKey = urlParts.slice(4).join("/"); // remove domain + bucket

		// Delete from R2
		await this.env.IMAGES_BUCKET.delete(fileKey);

		// Delete from database
		const result = await this.env.NOTES_DB.prepare(
			"DELETE FROM images WHERE id = ?"
		)
			.bind(id)
			.run();

		if (result.success) {
			// Broadcast to room
			await this.broadcastToRoom({
				type: "image_deleted",
				data: { id },
			});
		}

		return result.success;
	}

	async updateImagePosition(
		id: string,
		position: { x: number; y: number }
	): Promise<Image | null> {
		const timestamp = new Date().toISOString();

		await this.env.NOTES_DB.prepare(
			"UPDATE images SET position_x = ?, position_y = ?, updated_at = ? WHERE id = ?"
		)
			.bind(position.x, position.y, timestamp, id)
			.run();

		const updatedImage = await this.getImageById(id);
		if (updatedImage) {
			// Broadcast to room
			await this.broadcastToRoom({
				type: "image_position_updated",
				data: { id, position },
			});
		}

		return updatedImage;
	}

	private async broadcastToRoom(message: any) {
		try {
			const roomId = this.env.NOTES_ROOM.idFromName("main-room");
			const room = this.env.NOTES_ROOM.get(roomId);
			await room.broadcastToAll(message); // RPC call
		} catch (error) {
			console.error("Error broadcasting to room:", error);
		}
	}
}
