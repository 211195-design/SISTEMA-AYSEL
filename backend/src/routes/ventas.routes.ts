import { Router } from 'express';
import * as controller from '../controllers/ventas.controller';

const router = Router();

router.get('/formaspago',   controller.listarFormaspago);
router.get('/clientes',     controller.listarClientes);
router.get('/dashboard',    controller.dashboard);
router.get('/:id/boleta',   controller.generarBoleta);
router.get('/:id',          controller.obtenerVenta);
router.get('/',             controller.listarVentas);
router.post('/',            controller.registrarVenta);
router.patch('/:id/anular', controller.anularVenta);

export default router;
