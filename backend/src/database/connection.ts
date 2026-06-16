import mysql, { Connection } from 'mysql2';
import env from '../config/env';

const db: Connection = mysql.createConnection({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASS,
  database: env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error(' Error MySQL:', err.message);
    process.exit(1);
  }
  console.log(' MySQL conectado → ' + env.DB_NAME);
});

export default db;
