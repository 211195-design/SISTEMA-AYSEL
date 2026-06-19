import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import dashoardRoutes from './routes/dashboard.routes';
import inventarioRoutes from './routes/inventario.routes';
import productosRoutes from './routes/productos.routes';



dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashoardRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/productos', productosRoutes);

app.get('/api/health', (req, res) => {
  res.json({ message: 'BACKEND FUNCIONADO ' });
});

export default app;
