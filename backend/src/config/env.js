module.exports = {
  PORT      : process.env.PORT       || 3001,
  DB_HOST   : process.env.DB_HOST    || 'localhost',
  DB_USER   : process.env.DB_USER    || 'root',
  DB_PASS   : process.env.DB_PASS    || '',
  DB_NAME   : process.env.DB_NAME    || 'BD_TIENDA_AYSEL',
  JWT_SECRET: process.env.JWT_SECRET || 'aysel_secret_2026'
};
