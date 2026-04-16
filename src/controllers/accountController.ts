import { Request, Response } from 'express';
import { createAccountService, getAccountBalanceService } from '../services/accountService';

export const createAccount = async (req: Request, res: Response) => {
  // Destructure the fields we expect from the request body
  const { personId, balance, dailyWithdrawalLimit, accountType } = req.body;

  const account = await createAccountService({ personId, balance, dailyWithdrawalLimit, accountType });

  // 201 = Created (resource was successfully created)
  res.status(201).json(account);
};

export const getAccountBalance = async (req: Request, res: Response) => {
  // req.params.id is always a string (it comes from the URL), so we convert it to a number
  const accountId = parseInt(req.params.id as string);

  const account = await getAccountBalanceService(accountId);

  // findUnique returns null if no record was found
  if (!account) {
    res.status(404).json({ error: 'Account not found' });
    return;
  }

  // Return only the fields relevant to balance, not the full account object
  res.status(200).json({ accountId: account.accountId, balance: account.balance });
};
