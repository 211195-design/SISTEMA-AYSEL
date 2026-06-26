import { Router } from 'express';
import * as controller from '../controllers/productos.controller';

const router = Router();

<<<<<<< HEAD
router.get('/',                controller.listarProductos);
router.get('/categorias',      controller.listarCategorias);
router.get('/:id',             controller.obtenerProducto);
router.post('/',               controller.crearProducto);
router.put('/:id',             controller.editarProducto);
router.patch('/:id/estado',    controller.cambiarEstado);
=======
router.get('/',              controller.listarProductos);
router.get('/categorias',    controller.listarCategorias);
router.get('/tallas',        controller.listarTallas);
router.get('/colores',       controller.listarColores);
router.get('/next-codigo',   controller.nextCodigo);
router.get('/:id',           controller.obtenerProducto);
router.post('/',             controller.crearProducto);
router.put('/:id',           controller.editarProducto);
router.patch('/:id/estado',  controller.cambiarEstado);
>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de

export default router;