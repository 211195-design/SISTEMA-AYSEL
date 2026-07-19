import { Router } from 'express';
import * as controller from '../controllers/cuentas.controller';

const router = Router();

router.get('/',           controller.listarCuentas);
router.get('/activas',    controller.listarActivas);
router.get('/:id',        controller.obtenerCuenta);
router.post('/',          controller.crearCuenta);
router.put('/:id',        controller.actualizarCuenta);
router.patch('/:id/estado', controller.cambiarEstado);
router.delete('/:id',     controller.eliminarCuenta);

export default router;