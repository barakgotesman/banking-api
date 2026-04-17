import { Router } from 'express';
import { createAccount, getAccountBalance, deposit, withdraw, blockAccount, getTransactions } from '../controllers/accountController';

const router = Router();

/**
 * @swagger
 * /accounts:
 *   post:
 *     summary: Create a new account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personId:
 *                 type: integer
 *               balance:
 *                 type: number
 *               dailyWithdrawalLimit:
 *                 type: number
 *               accountType:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Account created successfully
 *       500:
 *         description: Internal server error
 */
router.post('/', createAccount);

/**
 * @swagger
 * /accounts/{id}/balance:
 *   get:
 *     summary: Get account balance
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Account balance
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/balance', getAccountBalance);

/**
 * @swagger
 * /accounts/{id}/deposit:
 *   post:
 *     summary: Deposit money into an account
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: number
 *     responses:
 *       200:
 *         description: Updated balance
 *       400:
 *         description: Invalid amount
 *       403:
 *         description: Account is blocked
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/deposit', deposit);

/**
 * @swagger
 * /accounts/{id}/withdraw:
 *   post:
 *     summary: Withdraw money from an account
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: number
 *     responses:
 *       200:
 *         description: Updated balance
 *       400:
 *         description: Insufficient balance / daily limit exceeded / invalid amount
 *       403:
 *         description: Account is blocked
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/withdraw', withdraw);

/**
 * @swagger
 * /accounts/{id}/block:
 *   patch:
 *     summary: Block an account
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Account blocked successfully
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/block', blockAccount);

/**
 * @swagger
 * /accounts/{id}/transactions:
 *   get:
 *     summary: Get all transactions for an account
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: from
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter (e.g. 2026-04-01)
 *       - in: query
 *         name: to
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter (e.g. 2026-04-30)
 *     responses:
 *       200:
 *         description: List of transactions
 *       400:
 *         description: Invalid date format or range
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/transactions', getTransactions);

export default router;
