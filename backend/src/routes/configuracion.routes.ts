import { Router } from 'express';
import * as c from '../controllers/configuracion.controller';

const router = Router();

// Categorías
router.get('/categorias',         c.getCategorias);
router.post('/categorias',        c.createCategoria);
router.put('/categorias/:id',     c.updateCategoria);
router.delete('/categorias/:id',  c.deleteCategoria);

// Tallas
router.get('/tallas',             c.getTallas);
router.post('/tallas',            c.createTalla);
router.put('/tallas/:id',         c.updateTalla);
router.delete('/tallas/:id',      c.deleteTalla);

// Colores
router.get('/colores',            c.getColores);
router.post('/colores',           c.createColor);
router.put('/colores/:id',        c.updateColor);
router.delete('/colores/:id',     c.deleteColor);

// Formas de pago
router.get('/formaspago',         c.getFormasPago);
router.post('/formaspago',        c.createFormaPago);
router.put('/formaspago/:id',     c.updateFormaPago);
router.delete('/formaspago/:id',  c.deleteFormaPago);

// Roles
router.get('/roles',              c.getRoles);
router.post('/roles',             c.createRol);
router.put('/roles/:id',          c.updateRol);
router.delete('/roles/:id',       c.deleteRol);

export default router;
