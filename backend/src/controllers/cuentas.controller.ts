import { Request, Response } from 'express';
import * as service from '../services/cuentas.service';

export const listarCuentas = async (req: Request, res: Response) => {
  try {
    res.json({ ok: true, data: await service.listarCuentas() });
  } catch (e: any) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
};

export const listarActivas = async (req: Request, res: Response) => {
  try {
    res.json({ ok: true, data: await service.listarCuentasActivas() });
  } catch (e: any) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
};

export const obtenerCuenta = async (req: Request, res: Response) => {
  try {
    res.json({ ok: true, data: await service.obtenerCuenta(Number(req.params.id)) });
  } catch (e: any) {
    res.status(404).json({ ok: false, mensaje: e.message });
  }
};

export const crearCuenta = async (req: Request, res: Response) => {
  try {
    const id = await service.crearCuenta(req.body);
    res.status(201).json({ ok: true, data: { IdCuenta: id } });
  } catch (e: any) {
    res.status(400).json({ ok: false, mensaje: e.message });
  }
};

export const actualizarCuenta = async (req: Request, res: Response) => {
  try {
    const data = await service.actualizarCuenta(Number(req.params.id), req.body);
    res.json({ ok: true, data });
  } catch (e: any) {
    res.status(400).json({ ok: false, mensaje: e.message });
  }
};

export const cambiarEstado = async (req: Request, res: Response) => {
  try {
    const { Estado } = req.body;
    const data = await service.cambiarEstadoCuenta(Number(req.params.id), !!Estado);
    res.json({ ok: true, data });
  } catch (e: any) {
    res.status(400).json({ ok: false, mensaje: e.message });
  }
};

export const eliminarCuenta = async (req: Request, res: Response) => {
  try {
    await service.eliminarCuenta(Number(req.params.id));
    res.json({ ok: true, mensaje: 'Cuenta eliminada correctamente' });
  } catch (e: any) {
    res.status(400).json({ ok: false, mensaje: e.message });
  }
};