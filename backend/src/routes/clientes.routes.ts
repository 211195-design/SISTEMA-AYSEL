import { Router } from 'express';
import * as controller from '../controllers/clientes.controller';

const router = Router();

<<<<<<< HEAD
router.get('/',                    controller.listarClientes);
router.get('/dni/:dni',            controller.buscarDNI);
router.get('/:id',                 controller.obtenerCliente);
router.get('/:id/historial',       controller.historialCliente);
router.post('/',                   controller.crearCliente);
router.put('/:id',                 controller.editarCliente);
router.patch('/:id/estado',        controller.cambiarEstado);
=======
router.get('/',                controller.listarClientes);
router.get('/dni/:dni',        controller.buscarDNI);        // ← una sola vez
router.post('/rapido',         controller.crearClienteRapido);
router.get('/:id',             controller.obtenerCliente);
router.get('/:id/historial',   controller.historialCliente);
router.post('/',               controller.crearCliente);
router.put('/:id',             controller.editarCliente);
router.patch('/:id/estado',    controller.cambiarEstado);
>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de

export default router;
