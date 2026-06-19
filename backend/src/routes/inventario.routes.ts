import { Router } from 'express';
import * as controller from '../controllers/inventario.controller';

const router = Router();

router.get('/',           controller.listarInventario);
router.get('/alertas',    controller.obtenerAlertas);
router.get('/:id',        controller.obtenerItem);
router.put('/:id/stock',  controller.actualizarStock);

export default router;