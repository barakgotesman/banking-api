import { Router } from 'express';
import { createAccount, getAccountBalance, deposit, withdraw, blockAccount, getTransactions } from '../controllers/accountController';

const router = Router();

router.post('/', createAccount);
router.get('/:id/balance', getAccountBalance);
router.post('/:id/deposit', deposit);
router.post('/:id/withdraw', withdraw);
router.patch('/:id/block', blockAccount);
router.get('/:id/transactions', getTransactions);

export default router;
