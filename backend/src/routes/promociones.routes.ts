import { Router } from 'express';
import * as controller from '../controllers/promociones.controller';

const router = Router();

router.get('/',                              controller.listarPromociones);
router.get('/cliente/:idCliente',            controller.promocionesDeCliente);
router.get('/:id',                           controller.obtenerPromocion);
router.post('/',                             controller.crearPromocion);
router.put('/:id',                           controller.editarPromocion);
router.patch('/:id/estado',                  controller.cambiarEstado);
router.post('/:id/clientes',                 controller.asignarCliente);
router.delete('/:id/clientes/:idCliente',    controller.quitarCliente);
router.delete('/:id',                        controller.eliminarPromocion);

export default router;