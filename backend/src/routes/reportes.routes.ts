import { Router } from 'express';
import * as controller from '../controllers/reportes.controller';

const router = Router();

router.get('/:tipo',          controller.getDatos);
router.get('/:tipo/excel',    controller.exportarExcel);
router.get('/:tipo/pdf',      controller.exportarExcel);


export default router;