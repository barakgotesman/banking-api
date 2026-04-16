import { Router } from 'express';
import { createAccount, getAccountBalance, deposit, withdraw } from '../controllers/accountController';

const router = Router();

router.post('/', createAccount);
router.get('/:id/balance', getAccountBalance);
router.post('/:id/deposit', deposit);
router.post('/:id/withdraw', withdraw);

export default router;
