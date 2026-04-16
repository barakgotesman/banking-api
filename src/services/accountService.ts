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
