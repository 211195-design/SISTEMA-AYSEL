import { Router } from 'express';
import * as controller from '../controllers/productos.controller';

const router = Router();

router.get('/',              controller.listarProductos);
router.get('/categorias',    controller.listarCategorias);
router.get('/tallas',        controller.listarTallas);
router.get('/colores',       controller.listarColores);
router.get('/next-codigo',   controller.nextCodigo);
router.get('/:id',           controller.obtenerProducto);
router.post('/',             controller.crearProducto);
router.put('/:id',           controller.editarProducto);
router.patch('/:id/estado',  controller.cambiarEstado);

export default router;