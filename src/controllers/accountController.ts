import { Request, Response } from 'express';
import { createAccountService, getAccountBalanceService, depositService, withdrawService, blockAccountService, getTransactionsService } from '../services/accountService';

export const createAccount = async (req: Request, res: Response) => {
  try {
    // Destructure the fields we expect from the request body
    const { personId, balance, dailyWithdrawalLimit, accountType } = req.body;

    const account = await createAccountService({ personId, balance, dailyWithdrawalLimit, accountType });

    // 201 = Created (resource was successfully created)
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAccountBalance = async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deposit = async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const withdraw = async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const blockAccount = async (req: Request, res: Response) => {
  try {
    const accountId = parseInt(req.params.id as string);

    const result = await blockAccountService(accountId);

    if ('error' in result) {
      res.status(result.status as number).json({ error: result.error });
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const accountId = parseInt(req.params.id as string);

    // Query params come as strings, so we convert them to Date objects if provided
    const from = req.query.from ? new Date(req.query.from as string) : undefined;
    const to = req.query.to ? new Date(req.query.to as string) : undefined;

    // isNaN on a Date object checks if it's a valid date
    if (from && isNaN(from.getTime())) {
      res.status(400).json({ error: 'Invalid from date' });
      return;
    }
    if (to && isNaN(to.getTime())) {
      res.status(400).json({ error: 'Invalid to date' });
      return;
    }
    if (from && to && from > to) {
      res.status(400).json({ error: 'from date must be before to date' });
      return;
    }

    const result = await getTransactionsService(accountId, from, to);

    if ('error' in result) {
      res.status(result.status as number).json({ error: result.error });
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
