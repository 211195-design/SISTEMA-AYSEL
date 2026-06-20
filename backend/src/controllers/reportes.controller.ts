import { Request, Response } from 'express';
import * as service from '../services/reportes.service';

export const getDatos = async (req: Request, res: Response) => {
  try {
    const tipo  = String(req.params.tipo);
    const desde = req.query.desde ? String(req.query.desde) : undefined;
    const hasta = req.query.hasta ? String(req.query.hasta) : undefined;
    const data  = await service.getDatos(tipo, desde, hasta);
    res.json({ ok: true, data });
  } catch (e: any) {
    res.status(400).json({ ok: false, mensaje: e.message });
  }
};

export const exportarExcel = async (req: Request, res: Response) => {
  try {
    const tipo  = String(req.params.tipo);
    const desde = req.query.desde ? String(req.query.desde) : undefined;
    const hasta = req.query.hasta ? String(req.query.hasta) : undefined;
    const buffer = await service.exportarExcel(tipo, desde, hasta);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=reporte_${tipo}.xlsx`);
    res.send(buffer);
  } catch (e: any) {
    res.status(400).json({ ok: false, mensaje: e.message });
  }
};