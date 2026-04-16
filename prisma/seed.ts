import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const person = await prisma.person.create({
    data: {
      name: 'Barak Gotesman',
      document: '123456789',
      birthDate: new Date('1990-01-01'),
    },
  });

  console.log('Seed complete. Created person:', person);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
