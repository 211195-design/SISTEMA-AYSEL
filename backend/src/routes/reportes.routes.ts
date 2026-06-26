import { Router } from 'express';
import * as controller from '../controllers/reportes.controller';

const router = Router();

// GET /api/reportes/:tipo?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
router.get('/:tipo',       controller.getDatos);
router.get('/:tipo/excel', controller.exportarExcel);
router.get('/:tipo/pdf',   controller.exportarExcel);

export default router;
