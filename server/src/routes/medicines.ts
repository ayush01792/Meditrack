import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  listMedicines, createMedicine, updateMedicine,
  toggleMedicine, deleteMedicine, medicineSchema, toggleSchema,
} from '../controllers/medicines.controller';

const router = Router();
router.use(authenticate);

router.get('/', listMedicines);
router.post('/', validate(medicineSchema), createMedicine);
router.patch('/:id', updateMedicine);
router.patch('/:id/toggle', validate(toggleSchema), toggleMedicine);
router.delete('/:id', deleteMedicine);

export default router;
