import postgres from 'postgres';

const globalForSql = global as unknown as { sql: postgres.Sql<{}> };

const sql = globalForSql.sql || postgres(process.env.DATABASE_URL!, {
    ssl: 'require',
    max: 10,
    idle_timeout: 20,
    connect_timeout: 30,
});

if (process.env.NODE_ENV !== 'production') globalForSql.sql = sql;

export default sql;
