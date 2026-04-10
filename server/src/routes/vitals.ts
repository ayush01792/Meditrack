import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { listVitals, logVital, deleteVital, vitalSchema } from '../controllers/vitals.controller';

const router = Router();
router.use(authenticate);

router.get('/', listVitals);
router.post('/', validate(vitalSchema), logVital);
router.delete('/:id', deleteVital);

export default router;
