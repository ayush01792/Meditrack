import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  listRecords,
  createRecord,
  updateRecord,
  deleteRecord,
  medicalRecordSchema,
} from '../controllers/medicalRecords.controller';

const router = Router();
router.use(authenticate);

// Store file in memory buffer (then stream to Supabase Storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP and PDF files are allowed'));
    }
  },
});

router.get('/', listRecords);
router.post('/', upload.single('prescription'), validate(medicalRecordSchema), createRecord);
router.patch('/:id', upload.single('prescription'), updateRecord);
router.delete('/:id', deleteRecord);

export default router;
