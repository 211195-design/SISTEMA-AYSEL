import { Request, Response } from 'express';
import * as service from '../services/promociones.service';

export const listarPromociones = async (req: Request, res: Response) => {
  try { res.json({ ok: true, data: await service.listarPromociones() }); }
  catch (e: any) { res.status(500).json({ ok: false, mensaje: e.message }); }
};

export const obtenerPromocion = async (req: Request, res: Response) => {
  try { res.json({ ok: true, data: await service.obtenerPromocion(Number(req.params.id)) }); }
  catch (e: any) { res.status(404).json({ ok: false, mensaje: e.message }); }
};

export const crearPromocion = async (req: Request, res: Response) => {
  try { res.status(201).json({ ok: true, data: await service.crearPromocion(req.body) }); }
  catch (e: any) { res.status(400).json({ ok: false, mensaje: e.message }); }
};

export const editarPromocion = async (req: Request, res: Response) => {
  try { res.json({ ok: true, data: await service.editarPromocion(Number(req.params.id), req.body) }); }
  catch (e: any) { res.status(400).json({ ok: false, mensaje: e.message }); }
};

export const cambiarEstado = async (req: Request, res: Response) => {
  try { res.json({ ok: true, data: await service.cambiarEstado(Number(req.params.id), Number(req.body.estado)) }); }
  catch (e: any) { res.status(400).json({ ok: false, mensaje: e.message }); }
};

export const asignarCliente = async (req: Request, res: Response) => {
  try {
    await service.asignarCliente(Number(req.params.id), Number(req.body.IdCliente));
    res.json({ ok: true, mensaje: 'Cliente asignado correctamente' });
  } catch (e: any) { res.status(400).json({ ok: false, mensaje: e.message }); }
};

export const quitarCliente = async (req: Request, res: Response) => {
  try {
    await service.quitarCliente(Number(req.params.id), Number(req.params.idCliente));
    res.json({ ok: true, mensaje: 'Cliente removido correctamente' });
  } catch (e: any) { res.status(400).json({ ok: false, mensaje: e.message }); }
};

export const eliminarPromocion = async (req: Request, res: Response) => {
  try {
    await service.eliminarPromocion(Number(req.params.id));
    res.json({ ok: true, mensaje: 'Promoción eliminada' });
  } catch (e: any) { res.status(400).json({ ok: false, mensaje: e.message }); }
};

export const promocionesDeCliente = async (req: Request, res: Response) => {
  try { res.json({ ok: true, data: await service.promocionesDeCliente(Number(req.params.idCliente)) }); }
  catch (e: any) { res.status(500).json({ ok: false, mensaje: e.message }); }
};