// db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function addLike(imageId, deviceId, action) {
  return pool.query(
    `INSERT INTO image_likes (image_id, device_id, action)
     VALUES ($1, $2, $3)
     ON CONFLICT (image_id, device_id)
     DO UPDATE SET action = EXCLUDED.action`,
    [imageId, deviceId, action]
  );
}

async function getLikesForImage(imageId) {
  return pool.query(
    `SELECT action, COUNT(*) as count
     FROM image_likes
     WHERE image_id = $1
     GROUP BY action`,
    [imageId]
  );
}

async function addDownload(imageId, deviceId) {
  return pool.query(
    `INSERT INTO image_downloads (image_id, device_id, download_count)
     VALUES ($1, $2, 1)
     ON CONFLICT (image_id, device_id)
     DO UPDATE SET download_count = image_downloads.download_count + 1,
                   last_downloaded = CURRENT_TIMESTAMP
     RETURNING download_count`,
    [imageId, deviceId]
  );
}

async function getDownloadsForImage(imageId) {
  return pool.query(
    `SELECT 
       SUM(download_count) as total_downloads,
       COUNT(DISTINCT device_id) as unique_downloads
     FROM image_downloads
     WHERE image_id = $1`,
    [imageId]
  );
}

module.exports = { pool, addLike, getLikesForImage, addDownload, getDownloadsForImage };