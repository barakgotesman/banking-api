import { Router } from 'express';
import { createAccount, getAccountBalance, deposit } from '../controllers/accountController';

const router = Router();

router.post('/', createAccount);
router.get('/:id/balance', getAccountBalance);
router.post('/:id/deposit', deposit);

export default router;
