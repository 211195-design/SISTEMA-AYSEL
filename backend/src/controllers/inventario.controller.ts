import { Request, Response } from 'express';
import * as service from '../services/inventario.service';

export const listarInventario = async (req: Request, res: Response) => {
  try {
    const data = await service.listarInventario();
    res.json({ ok: true, data });
  } catch (error: any) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

export const obtenerItem = async (req: Request, res: Response) => {
  try {
    const data = await service.obtenerItem(Number(req.params.id));
    res.json({ ok: true, data });
  } catch (error: any) {
    res.status(404).json({ ok: false, mensaje: error.message });
  }
};

export const actualizarStock = async (req: Request, res: Response) => {
  try {
    const { stockActual } = req.body;
    if (stockActual === undefined) {
      res.status(400).json({ ok: false, mensaje: 'stockActual es requerido' });
      return;
    }
    const data = await service.actualizarStock(Number(req.params.id), Number(stockActual));
    res.json({ ok: true, mensaje: 'Stock actualizado', data });
  } catch (error: any) {
    res.status(400).json({ ok: false, mensaje: error.message });
  }
};

export const obtenerAlertas = async (req: Request, res: Response) => {
  try {
    const data = await service.obtenerAlertas();
    res.json({ ok: true, data });
  } catch (error: any) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

export const actualizarInventarioCompleto = async (req: Request, res: Response) => {
  try {
    const { stockActual, stockMinimo, precioVenta, idTalla, idColor } = req.body;
    if (stockActual === undefined || precioVenta === undefined) {
      res.status(400).json({ ok: false, mensaje: 'stockActual y precioVenta son requeridos' });
      return;
    }
    await service.actualizarInventarioCompleto(Number(req.params.id), {
      stockActual: Number(stockActual),
      stockMinimo: Number(stockMinimo),
      precioVenta: Number(precioVenta),
      idTalla: idTalla ? Number(idTalla) : null,
      idColor: idColor ? Number(idColor) : null,
    });
    res.json({ ok: true, mensaje: 'Inventario actualizado' });
  } catch (error: any) {
    res.status(400).json({ ok: false, mensaje: error.message });
  }
};
