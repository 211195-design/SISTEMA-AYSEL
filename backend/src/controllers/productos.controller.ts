import { Request, Response } from 'express';
import * as service from '../services/productos.service';

export const listarProductos = async (req: Request, res: Response) => {
  try {
    res.json({ ok: true, data: await service.listarProductos() });
  } catch (e: any) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
};

export const obtenerProducto = async (req: Request, res: Response) => {
  try {
    res.json({ ok: true, data: await service.obtenerProducto(Number(req.params.id)) });
  } catch (e: any) {
    res.status(404).json({ ok: false, mensaje: e.message });
  }
};

export const crearProducto = async (req: Request, res: Response) => {
  try {
    res.status(201).json({ ok: true, data: await service.crearProducto(req.body) });
  } catch (e: any) {
    res.status(400).json({ ok: false, mensaje: e.message });
  }
};

export const editarProducto = async (req: Request, res: Response) => {
  try {
    res.json({ ok: true, data: await service.editarProducto(Number(req.params.id), req.body) });
  } catch (e: any) {
    res.status(400).json({ ok: false, mensaje: e.message });
  }
};

export const cambiarEstado = async (req: Request, res: Response) => {
  try {
    res.json({ ok: true, data: await service.cambiarEstado(Number(req.params.id), Number(req.body.estado)) });
  } catch (e: any) {
    res.status(400).json({ ok: false, mensaje: e.message });
  }
};

export const listarCategorias = async (req: Request, res: Response) => {
  try {
    res.json({ ok: true, data: await service.listarCategorias() });
  } catch (e: any) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
<<<<<<< HEAD
=======
};

export const listarTallas = async (req: Request, res: Response) => {
  try {
    res.json({ ok: true, data: await service.listarTallas() });
  } catch (e: any) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
};

export const listarColores = async (req: Request, res: Response) => {
  try {
    res.json({ ok: true, data: await service.listarColores() });
  } catch (e: any) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
};

export const nextCodigo = async (req: Request, res: Response) => {
  try {
    res.json({ ok: true, data: await service.siguienteCodigo() });
  } catch (e: any) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de
};