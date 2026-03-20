import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const remaining = await prisma.userWordCard.count({
        where: {
            OR: [
                { exampleSentence: null },
                { exampleSentence: { contains: "important for your studies" } },
                { exampleSentence: { contains: "standard sentence for" } }
            ]
        }
    });
    console.log(remaining);
}
main().then(() => prisma.$disconnect());
