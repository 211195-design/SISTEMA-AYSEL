import { Request, Response } from 'express';
import { getDashboardData } from '../services/dashboard.service';

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const data = await getDashboardData();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error en dashboard:', error);
    res.status(500).json({ success: false, message: 'Error al obtener datos del dashboard' });
  }
};
