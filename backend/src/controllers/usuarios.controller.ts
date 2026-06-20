import { Request, Response } from 'express';
import * as service from '../services/usuarios.service';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'aysel_secret_2026';

const getIdFromToken = (req: Request): number => {
  const token = req.cookies?.token ?? req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('No autenticado');
  const payload = jwt.verify(token, SECRET) as any;
  return payload.IdUsuario;
};

export const listarUsuarios = async (req: Request, res: Response) => {
  try {
    res.json({ ok: true, data: await service.listarUsuarios() });
  } catch (e: any) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
};

export const obtenerUsuario = async (req: Request, res: Response) => {
  try {
    res.json({ ok: true, data: await service.obtenerUsuario(Number(req.params.id)) });
  } catch (e: any) {
    res.status(404).json({ ok: false, mensaje: e.message });
  }
};

export const crearUsuario = async (req: Request, res: Response) => {
  try {
    res.status(201).json({ ok: true, data: await service.crearUsuario(req.body) });
  } catch (e: any) {
    res.status(400).json({ ok: false, mensaje: e.message });
  }
};

export const editarUsuario = async (req: Request, res: Response) => {
  try {
    const idSolicitante = getIdFromToken(req);
    res.json({ ok: true, data: await service.editarUsuario(Number(req.params.id), req.body, idSolicitante) });
  } catch (e: any) {
    res.status(400).json({ ok: false, mensaje: e.message });
  }
};

export const cambiarClave = async (req: Request, res: Response) => {
  try {
    const idSolicitante = getIdFromToken(req);
    const { claveActual, claveNueva } = req.body;
    await service.cambiarClave(idSolicitante, claveActual, claveNueva);
    res.json({ ok: true, mensaje: 'Contraseña actualizada correctamente' });
  } catch (e: any) {
    res.status(400).json({ ok: false, mensaje: e.message });
  }
};

export const resetClave = async (req: Request, res: Response) => {
  try {
    const { claveNueva } = req.body;
    await service.resetClave(Number(req.params.id), claveNueva);
    res.json({ ok: true, mensaje: 'Contraseña restablecida correctamente' });
  } catch (e: any) {
    res.status(400).json({ ok: false, mensaje: e.message });
  }
};

export const cambiarEstado = async (req: Request, res: Response) => {
  try {
    const idSolicitante = getIdFromToken(req);
    res.json({ ok: true, data: await service.cambiarEstado(Number(req.params.id), Number(req.body.estado), idSolicitante) });
  } catch (e: any) {
    res.status(400).json({ ok: false, mensaje: e.message });
  }
};

export const listarRoles = async (req: Request, res: Response) => {
  try {
    res.json({ ok: true, data: await service.listarRoles() });
  } catch (e: any) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
};
