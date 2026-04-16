import { Router } from 'express';
import { createAccount, getAccountBalance } from '../controllers/accountController';

const router = Router();

router.post('/', createAccount);
router.get('/:id/balance', getAccountBalance);

export default router;
