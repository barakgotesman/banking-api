import { Request, Response } from 'express';
import { createAccountService } from '../services/accountService';

export const createAccount = async (req: Request, res: Response) => {
  const { personId, balance, dailyWithdrawalLimit, accountType } = req.body;

  const account = await createAccountService({ personId, balance, dailyWithdrawalLimit, accountType });

  res.status(201).json(account);
};
