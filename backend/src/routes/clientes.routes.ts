import { Router } from 'express';
import * as controller from '../controllers/clientes.controller';

const router = Router();

router.get('/',                    controller.listarClientes);
router.get('/dni/:dni',            controller.buscarDNI);
router.get('/:id',                 controller.obtenerCliente);
router.get('/:id/historial',       controller.historialCliente);
router.post('/',                   controller.crearCliente);
router.put('/:id',                 controller.editarCliente);
router.patch('/:id/estado',        controller.cambiarEstado);

export default router;
