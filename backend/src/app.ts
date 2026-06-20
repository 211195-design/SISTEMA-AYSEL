import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import dashoardRoutes from './routes/dashboard.routes';
import inventarioRoutes from './routes/inventario.routes';
import productosRoutes from './routes/productos.routes';
import ventasRoutes from './routes/ventas.routes';
import cookieParser from 'cookie-parser';
import reportesRoutes from './routes/reportes.routes';
import clientesRoutes from './routes/clientes.routes';
import usuariosRoutes from './routes/usuarios.routes';

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashoardRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/usuarios', usuariosRoutes);

app.get('/api/health', (req, res) => {
  res.json({ message: 'BACKEND FUNCIONADO ' });
});

export default app;
