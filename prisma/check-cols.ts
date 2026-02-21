import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });

async function main() {
    const result = await pool.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position"
    );
    console.log('Columns in users table:');
    result.rows.forEach((r: any) => console.log(' -', r.column_name));
}

main()
    .catch(console.error)
    .finally(() => pool.end());
