import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateAccountInput {
  personId: number;
  balance: number;
  dailyWithdrawalLimit: number;
  accountType: number;
}

export const createAccountService = async (data: CreateAccountInput) => {
  const account = await prisma.account.create({
    data: {
      personId: data.personId,
      balance: data.balance,
      dailyWithdrawalLimit: data.dailyWithdrawalLimit,
      accountType: data.accountType,
    },
  });

  return account;
};

export const getAccountBalanceService = async (accountId: number) => {
  // findUnique finds exactly one record by a unique field (primary key here)
  // returns null if no record matches
  const account = await prisma.account.findUnique({
    where: { accountId },
  });

  return account;
};

export const depositService = async (accountId: number, value: number) => {
  const account = await prisma.account.findUnique({
    where: { accountId },
  });

  if (!account) return { error: 'Account not found', status: 404 };
  if (!account.activeFlag) return { error: 'Account is blocked', status: 403 };

  // Update the balance and create a transaction record in a single atomic operation
  const updatedAccount = await prisma.$transaction(async (tx) => {
    const updated = await tx.account.update({
      where: { accountId },
      data: { balance: account.balance + value },
    });

    await tx.transaction.create({
      data: { accountId, value },
    });

    return updated;
  });

  return { accountId: updatedAccount.accountId, balance: updatedAccount.balance };
};

export const withdrawService = async (accountId: number, value: number) => {
  const account = await prisma.account.findUnique({
    where: { accountId },
  });

  // Basic validations before touching the DB further
  if (!account) return { error: 'Account not found', status: 400 };
  if (!account.activeFlag) return { error: 'Account is blocked', status: 403 };
  if (account.balance < value) return { error: 'Insufficient balance', status: 400 };

  // Build a Date object representing midnight of today (start of current day)
  // We use this to filter only transactions that happened today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // Find all withdrawals made today for this account
  // Withdrawals are stored as negative values, so we filter value < 0
  // gte = "greater than or equal" — Prisma filter operator
  const todayTransactions = await prisma.transaction.findMany({
    where: {
      accountId,
      value: { lt: 0 }, // withdrawals are stored as negative values
      transactionDate: { gte: startOfDay },
    },
  });

  // Sum up the absolute values of today's withdrawals
  // reduce() iterates over the array and accumulates a total
  const withdrawnToday = todayTransactions.reduce((sum, t) => sum + Math.abs(t.value), 0);

  // Check if adding this withdrawal would exceed the daily limit
  if (withdrawnToday + value > account.dailyWithdrawalLimit) {
    return { error: 'Daily withdrawal limit exceeded', status: 400 };
  }

  // Update balance and record transaction atomically
  const updatedAccount = await prisma.$transaction(async (tx) => {
    const updated = await tx.account.update({
      where: { accountId },
      data: { balance: account.balance - value },
    });

    // Store withdrawal as negative value to distinguish from deposits
    await tx.transaction.create({
      data: { accountId, value: -value },
    });

    return updated;
  });

  return { accountId: updatedAccount.accountId, balance: updatedAccount.balance };
};
