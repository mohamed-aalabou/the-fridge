-- Create images table
CREATE TABLE IF NOT EXISTS images (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    original_name TEXT NOT NULL,
    position_x INTEGER NOT NULL,
    position_y INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create index on updated_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_images_updated_at ON images (updated_at DESC);
