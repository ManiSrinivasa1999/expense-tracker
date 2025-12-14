import { neon } from "@neondatabase/serverless";

import "dotenv/config";


const sql = neon(process.env.DB_URL);

export default sql;
