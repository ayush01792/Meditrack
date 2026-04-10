import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { downloadReport, generateShareToken, getSharedReport } from '../controllers/reports.controller';

const router = Router();

// Public route — no auth needed
router.get('/shared/:token', getSharedReport);

// Protected routes
router.use(authenticate);
router.get('/pdf', downloadReport);
router.post('/share-token', generateShareToken);

export default router;
