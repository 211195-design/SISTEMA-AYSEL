import { Router } from 'express';
import * as controller from '../controllers/ventas.controller';

const router = Router();

router.get('/',              controller.listarVentas);
router.get('/formaspago',    controller.listarFormaspago);
router.get('/clientes',      controller.listarClientes);
<<<<<<< HEAD
router.get('/:id',           controller.obtenerVenta);
router.post('/',             controller.registrarVenta);
router.patch('/:id/anular',  controller.anularVenta);
=======
router.get('/dashboard',     controller.dashboard);
router.get('/:id',           controller.obtenerVenta);
router.post('/',             controller.registrarVenta);
router.patch('/:id/anular',  controller.anularVenta);
router.get('/reporte/turno',    controller.reporteTurno);
router.get('/reporte/general',  controller.reporteGeneral);

>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de

export default router;