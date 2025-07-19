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

module.exports = { pool, addLike, getLikesForImage };
