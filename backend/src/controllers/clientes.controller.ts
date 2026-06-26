import { Request, Response } from 'express';
import * as service from '../services/clientes.service';

export const listarClientes = async (req: Request, res: Response) => {
  try {
    res.json({ ok: true, data: await service.listarClientes() });
  } catch (e: any) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
};

export const obtenerCliente = async (req: Request, res: Response) => {
  try {
    res.json({ ok: true, data: await service.obtenerCliente(Number(req.params.id)) });
  } catch (e: any) {
    res.status(404).json({ ok: false, mensaje: e.message });
  }
};

export const historialCliente = async (req: Request, res: Response) => {
  try {
    res.json({ ok: true, data: await service.historialCliente(Number(req.params.id)) });
  } catch (e: any) {
    res.status(404).json({ ok: false, mensaje: e.message });
  }
};

export const crearCliente = async (req: Request, res: Response) => {
  try {
    res.status(201).json({ ok: true, data: await service.crearCliente(req.body) });
  } catch (e: any) {
    res.status(400).json({ ok: false, mensaje: e.message });
  }
};

export const editarCliente = async (req: Request, res: Response) => {
  try {
    res.json({ ok: true, data: await service.editarCliente(Number(req.params.id), req.body) });
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

export const buscarDNI = async (req: Request, res: Response) => {
  try {
    res.json({ ok: true, data: await service.buscarDNI(String(req.params.dni)) });
  } catch (e: any) {
    res.status(404).json({ ok: false, mensaje: e.message });
  }
};
<<<<<<< HEAD
=======


export const crearClienteRapido = async (req: Request, res: Response) => {
  try {
    res.status(201).json({ ok: true, data: await service.crearClienteRapido(req.body) });
  } catch (e: any) { res.status(400).json({ ok: false, mensaje: e.message }); }
};

export const buscarPorDNI = async (req: Request, res: Response) => {
  try {
    const dni = Array.isArray(req.params.dni) ? req.params.dni[0] : req.params.dni;
    const c = await service.buscarPorDNI(dni);
    if (!c) return res.status(404).json({ ok: false, mensaje: 'No encontrado' });
    res.json({ ok: true, data: c });
  } catch (e: any) { res.status(500).json({ ok: false, mensaje: e.message }); }
};

>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de
