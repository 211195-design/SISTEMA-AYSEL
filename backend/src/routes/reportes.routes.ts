<<<<<<< HEAD
import { Router } from 'express';
=======
﻿import { Router } from 'express';
>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de
import * as controller from '../controllers/reportes.controller';

const router = Router();

<<<<<<< HEAD
router.get('/:tipo',          controller.getDatos);
router.get('/:tipo/excel',    controller.exportarExcel);
router.get('/:tipo/pdf',      controller.exportarExcel);


export default router;
=======
// GET /api/reportes/:tipo?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
router.get('/:tipo',       controller.getDatos);
router.get('/:tipo/excel', controller.exportarExcel);
router.get('/:tipo/pdf',   controller.exportarExcel);

export default router;
>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de
