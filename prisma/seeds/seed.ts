import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
async function main() {
  const indexes = [
    { name: 'Brak indeksu', color: '#B4B4B8' },
    { name: 'Bardzo dobra', color: '#37791a' },
    { name: 'Dobra', color: '#60b53b' },
    { name: 'Umiarkowana', color: '#ffc700' },
    { name: 'Dostateczna', color: '#ff7c25' },
    { name: 'Zła', color: '#CD1818' },
    { name: 'Bardzo zła', color: '#731f1f' },
  ];

  for (const index of indexes) {
    await prisma.index.create({
      data: index,
    });
  }

  console.log('Seed data added to the Index table');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
