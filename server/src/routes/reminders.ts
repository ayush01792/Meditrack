import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { listReminders, updateReminderStatus, statusSchema } from '../controllers/reminders.controller';

const router = Router();
router.use(authenticate);

router.get('/', listReminders);
router.patch('/:id/status', validate(statusSchema), updateReminderStatus);

export default router;
