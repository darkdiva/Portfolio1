const { Pool } = require('pg');

// Create connection pool using DATABASE_URL from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Supabase
});

// Create the messages table if it doesn't exist yet
const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(200) NOT NULL,
      subject VARCHAR(200) NOT NULL,
      message TEXT NOT NULL,
      email_sent BOOLEAN DEFAULT FALSE,
      ip_address VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('✅ Messages table ready');
};

// Save a message to the database
const saveMessage = async ({ name, email, subject, message, ipAddress }) => {
  const result = await pool.query(
    `INSERT INTO messages (name, email, subject, message, ip_address)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [name, email, subject, message, ipAddress]
  );
  return result.rows[0].id;
};

// Mark email as sent
const markEmailSent = async (id) => {
  await pool.query('UPDATE messages SET email_sent = TRUE WHERE id = $1', [id]);
};

module.exports = { initDB, saveMessage, markEmailSent };
