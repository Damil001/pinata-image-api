-- Run this once on your Render PostgreSQL database (e.g. in Render Shell or psql).
-- Creates tables required for likes and download counts.

CREATE TABLE IF NOT EXISTS image_likes (
  image_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  action TEXT NOT NULL,
  PRIMARY KEY (image_id, device_id)
);

CREATE TABLE IF NOT EXISTS image_downloads (
  image_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  download_count INTEGER NOT NULL DEFAULT 1,
  last_downloaded TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (image_id, device_id)
);
