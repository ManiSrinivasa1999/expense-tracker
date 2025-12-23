import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DB_URL);

const initDB = async () => {
  try {
    await sql`CREATE TABLE IF NOT EXISTS transactions(
			id SERIAL PRIMARY KEY,
			user_id VARCHAR(255) NOT NULL,
			title VARCHAR(255) NOT NULL,
			amount DECIMAL(10, 2) NOT NULL,
			category VARCHAR(255) NOT NULL,
			created_at DATE NOT NULL DEFAULT CURRENT_DATE)`;
    console.log('Database connected and table ensured.');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

export { sql, initDB };
export default sql;
