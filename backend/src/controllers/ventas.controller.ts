import { Request, Response } from 'express';
import * as service from '../services/ventas.service';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'aysel_secret_2026';

export const listarVentas = async (req: Request, res: Response) => {
  try {
    const { desde, hasta } = req.query as { desde?: string; hasta?: string };
    res.json({ ok: true, data: await service.listarVentas(desde, hasta) });
  } catch (e: any) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
};

export const obtenerVenta = async (req: Request, res: Response) => {
  try {
    res.json({ ok: true, data: await service.obtenerVenta(Number(req.params.id)) });
  } catch (e: any) {
    res.status(404).json({ ok: false, mensaje: e.message });
  }
};

export const registrarVenta = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.token ?? req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ ok: false, mensaje: 'No autenticado' });
      return;
    }
    const payload = jwt.verify(token, SECRET) as any;
    const data = await service.registrarVenta(req.body, payload.IdUsuario);
    res.status(201).json({ ok: true, data });
  } catch (e: any) {
    res.status(400).json({ ok: false, mensaje: e.message });
  }
};

export const anularVenta = async (req: Request, res: Response) => {
  try {
    await service.anularVenta(Number(req.params.id));
    res.json({ ok: true, mensaje: 'Venta anulada correctamente' });
  } catch (e: any) {
    res.status(400).json({ ok: false, mensaje: e.message });
  }
};

export const listarFormaspago = async (req: Request, res: Response) => {
  try {
    res.json({ ok: true, data: await service.listarFormaspago() });
  } catch (e: any) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
};

export const listarClientes = async (req: Request, res: Response) => {
  try {
    res.json({ ok: true, data: await service.listarClientes() });
  } catch (e: any) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
};

export const reporteTurno = async (req: Request, res: Response) => {
  try {
    const { idUsuario, fecha } = req.query;
    const data = await service.getReporteTurno(Number(idUsuario), String(fecha));
    res.json({ ok: true, data });
  } catch (e: any) { res.status(500).json({ ok: false, mensaje: e.message }); }
};

export const reporteGeneral = async (req: Request, res: Response) => {
  try {
    const { desde, hasta } = req.query;
    const data = await service.getReporteGeneral(String(desde), String(hasta));
    res.json({ ok: true, data });
  } catch (e: any) { res.status(500).json({ ok: false, mensaje: e.message }); }
};
