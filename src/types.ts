export interface Note {
	id: string;
	content: string;
	position: {
		x: number;
		y: number;
	};
	createdAt: string;
	updatedAt: string;
}

export interface CreateNoteRequest {
	content: string;
	position: {
		x: number;
		y: number;
	};
}

export interface UpdateNoteRequest {
	content?: string;
	position?: {
		x: number;
		y: number;
	};
}

export interface Image {
	id: string;
	url: string;
	originalName: string;
	position: {
		x: number;
		y: number;
	};
	createdAt: string;
	updatedAt: string;
}

export interface CreateImageRequest {
	file: File;
	position: {
		x: number;
		y: number;
	};
}

export interface UpdateImageRequest {
	position?: {
		x: number;
		y: number;
	};
}

export interface WebSocketMessage {
	type:
		| "note_created"
		| "note_updated"
		| "note_deleted"
		| "position_updated"
		| "image_created"
		| "image_updated"
		| "image_deleted"
		| "image_position_updated";
	data: Note | Image | { id: string; position: { x: number; y: number } };
}

export interface DurableObjectEnv {
	NOTES_DB: D1Database;
	NOTES_KV: KVNamespace;
	NOTES_ROOM: DurableObjectNamespace;
	IMAGES_BUCKET: R2Bucket;
}

// Spotify-related types
export interface SpotifyTrack {
	id: string;
	name: string;
	artists: Array<{
		id: string;
		name: string;
	}>;
	album: {
		id: string;
		name: string;
		images: Array<{
			url: string;
			height: number;
			width: number;
		}>;
	};
	duration_ms: number;
	external_urls: {
		spotify: string;
	};
	preview_url: string | null;
}

export interface SpotifyPlaybackState {
	device: {
		id: string;
		is_active: boolean;
		is_private_session: boolean;
		is_restricted: boolean;
		name: string;
		type: string;
		volume_percent: number;
	};
	repeat_state: string;
	shuffle_state: boolean;
	context: {
		type: string;
		href: string;
		external_urls: {
			spotify: string;
		};
		uri: string;
	} | null;
	timestamp: number;
	progress_ms: number;
	is_playing: boolean;
	item: SpotifyTrack | null;
	currently_playing_type: string;
	actions: {
		interrupting_playback?: boolean;
		pausing?: boolean;
		resuming?: boolean;
		seeking?: boolean;
		skipping_next?: boolean;
		skipping_prev?: boolean;
		toggling_repeat_context?: boolean;
		toggling_shuffle?: boolean;
		toggling_repeat_track?: boolean;
		transferring_playback?: boolean;
	};
}

export interface MusicItem {
	id: string;
	track: SpotifyTrack | null;
	isPlaying: boolean;
	progress: number;
	position: {
		x: number;
		y: number;
	};
	createdAt: string;
	updatedAt: string;
}
