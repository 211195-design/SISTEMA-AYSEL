// src/config/env.ts
import dotenv from 'dotenv';
dotenv.config();

const env = {
  PORT      : process.env.PORT               || '3001',
  DB_HOST   : process.env.MYSQL_ADDON_HOST   || 'localhost',
  DB_USER   : process.env.MYSQL_ADDON_USER   || 'root',
  DB_PASS   : process.env.MYSQL_ADDON_PASSWORD || '',
  DB_NAME   : process.env.MYSQL_ADDON_DB     || 'BD_TIENDA_AYSEL',
  JWT_SECRET: process.env.JWT_SECRET         || 'aysel_secret_2026'
};

export default env;
