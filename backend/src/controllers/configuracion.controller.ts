import { Request, Response } from 'express';
import * as service from '../services/configuracion.service';

const ok  = (res: Response, data: any)         => res.json({ ok: true, data });
const err = (res: Response, e: any, code = 400) => res.status(code).json({ ok: false, mensaje: e.message });

// ─── CATEGORÍAS ───────────────────────────────────────────────────────────────
export const getCategorias    = async (req: Request, res: Response) => { try { ok(res, await service.listarCategorias()); }   catch (e: any) { err(res, e, 500); } };
export const createCategoria  = async (req: Request, res: Response) => { try { ok(res, await service.crearCategoria(req.body)); } catch (e: any) { err(res, e); } };
export const updateCategoria  = async (req: Request, res: Response) => { try { await service.editarCategoria(Number(req.params.id), req.body); ok(res, null); } catch (e: any) { err(res, e); } };
export const deleteCategoria  = async (req: Request, res: Response) => { try { await service.eliminarCategoria(Number(req.params.id)); ok(res, null); } catch (e: any) { err(res, e); } };

// ─── TALLAS ───────────────────────────────────────────────────────────────────
export const getTallas    = async (req: Request, res: Response) => { try { ok(res, await service.listarTallas()); }  catch (e: any) { err(res, e, 500); } };
export const createTalla  = async (req: Request, res: Response) => { try { ok(res, await service.crearTalla(req.body.NombreTalla)); } catch (e: any) { err(res, e); } };
export const updateTalla  = async (req: Request, res: Response) => { try { await service.editarTalla(Number(req.params.id), req.body.NombreTalla); ok(res, null); } catch (e: any) { err(res, e); } };
export const deleteTalla  = async (req: Request, res: Response) => { try { await service.eliminarTalla(Number(req.params.id)); ok(res, null); } catch (e: any) { err(res, e); } };

// ─── COLORES ──────────────────────────────────────────────────────────────────
export const getColores    = async (req: Request, res: Response) => { try { ok(res, await service.listarColores()); }  catch (e: any) { err(res, e, 500); } };
export const createColor   = async (req: Request, res: Response) => { try { ok(res, await service.crearColor(req.body.NombreColor)); } catch (e: any) { err(res, e); } };
export const updateColor   = async (req: Request, res: Response) => { try { await service.editarColor(Number(req.params.id), req.body.NombreColor); ok(res, null); } catch (e: any) { err(res, e); } };
export const deleteColor   = async (req: Request, res: Response) => { try { await service.eliminarColor(Number(req.params.id)); ok(res, null); } catch (e: any) { err(res, e); } };

// ─── FORMAS DE PAGO ───────────────────────────────────────────────────────────
export const getFormasPago    = async (req: Request, res: Response) => { try { ok(res, await service.listarFormasPago()); }  catch (e: any) { err(res, e, 500); } };
export const createFormaPago  = async (req: Request, res: Response) => { try { ok(res, await service.crearFormaPago(req.body.NombreFormaPago)); } catch (e: any) { err(res, e); } };
export const updateFormaPago  = async (req: Request, res: Response) => { try { await service.editarFormaPago(Number(req.params.id), req.body.NombreFormaPago); ok(res, null); } catch (e: any) { err(res, e); } };
export const deleteFormaPago  = async (req: Request, res: Response) => { try { await service.eliminarFormaPago(Number(req.params.id)); ok(res, null); } catch (e: any) { err(res, e); } };

// ─── ROLES ────────────────────────────────────────────────────────────────────
export const getRoles    = async (req: Request, res: Response) => { try { ok(res, await service.listarRoles()); }  catch (e: any) { err(res, e, 500); } };
export const createRol   = async (req: Request, res: Response) => { try { ok(res, await service.crearRol(req.body.NombreRol)); } catch (e: any) { err(res, e); } };
export const updateRol   = async (req: Request, res: Response) => { try { await service.editarRol(Number(req.params.id), req.body.NombreRol); ok(res, null); } catch (e: any) { err(res, e); } };
export const deleteRol   = async (req: Request, res: Response) => { try { await service.eliminarRol(Number(req.params.id)); ok(res, null); } catch (e: any) { err(res, e); } };
