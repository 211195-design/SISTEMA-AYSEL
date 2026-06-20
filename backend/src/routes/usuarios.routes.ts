import { Router } from 'express';
import * as controller from '../controllers/usuarios.controller';

const router = Router();

router.get('/',                    controller.listarUsuarios);
router.get('/roles',               controller.listarRoles);
router.get('/:id',                 controller.obtenerUsuario);
router.post('/',                   controller.crearUsuario);
router.put('/:id',                 controller.editarUsuario);
router.patch('/cambiar-clave',     controller.cambiarClave);
router.patch('/:id/reset-clave',   controller.resetClave);
router.patch('/:id/estado',        controller.cambiarEstado);

export default router;
