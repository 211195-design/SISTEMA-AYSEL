import { Router } from 'express';
import * as controller from '../controllers/productos.controller';

const router = Router();

router.get('/',                controller.listarProductos);
router.get('/categorias',      controller.listarCategorias);
router.get('/:id',             controller.obtenerProducto);
router.post('/',               controller.crearProducto);
router.put('/:id',             controller.editarProducto);
router.patch('/:id/estado',    controller.cambiarEstado);

export default router;