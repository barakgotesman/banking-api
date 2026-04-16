import { Request, Response } from 'express';
import { createAccountService, getAccountBalanceService, depositService, withdrawService, blockAccountService } from '../services/accountService';

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

export const deposit = async (req: Request, res: Response) => {
  const accountId = parseInt(req.params.id as string);
  const value: number = req.body.value;

  // Reject zero or negative deposit amounts
  if (!value || value <= 0) {
    res.status(400).json({ error: 'Invalid amount' });
    return;
  }

  const result = await depositService(accountId, value);

  // The service returns an error object if something went wrong
  if ('error' in result) {
    res.status(result.status as number).json({ error: result.error });
    return;
  }

  res.status(200).json(result);
};

export const withdraw = async (req: Request, res: Response) => {
  const accountId = parseInt(req.params.id as string);
  const value: number = req.body.value;

  if (!value || value <= 0) {
    res.status(400).json({ error: 'Invalid amount' });
    return;
  }

  const result = await withdrawService(accountId, value);

  if ('error' in result) {
    res.status(result.status as number).json({ error: result.error });
    return;
  }

  res.status(200).json(result);
};

export const blockAccount = async (req: Request, res: Response) => {
  const accountId = parseInt(req.params.id as string);

  const result = await blockAccountService(accountId);

  if ('error' in result) {
    res.status(result.status as number).json({ error: result.error });
    return;
  }

  res.status(200).json(result);
};
