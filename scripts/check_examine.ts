import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const card = await prisma.userWordCard.findFirst({
        where: { word: "examine" }
    });
    console.log(card);
}
main().then(() => prisma.$disconnect());
