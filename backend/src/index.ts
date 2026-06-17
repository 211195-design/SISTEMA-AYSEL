import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import db from './config/database';
import dashboardRoutes from './routes/dashboard.routes';

const PORT = process.env.PORT || 3001;

async function main() {
  try {
    await db.getConnection();
    console.log('CONEXION A BD_TIENDA_AYSEL EXITOSA ');

    app.listen(PORT, () => {
      console.log(`SERVIDOR CORRIENDO EN  http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('ERROR AL CONECTAR A LA BASE DE DATOS: ', error);
    process.exit(1);
  }
}

main();
