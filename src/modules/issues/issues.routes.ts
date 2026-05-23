import { Router } from 'express';
import { create, getAll, getOne, update, remove } from './issues.controller';
import { authenticate } from '../../middleware/auth';
import { requireMaintainer } from '../../middleware/roleGuard';

const router = Router();


router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', authenticate, create);

// Authenticated routes 
router.patch('/:id', authenticate, update);

// Maintainer-only route
router.delete('/:id', authenticate, requireMaintainer, remove);

export default router;