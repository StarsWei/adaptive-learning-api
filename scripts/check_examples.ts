import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const countNull = await prisma.userWordCard.count({
        where: { exampleSentence: null }
    });
    
    const countTotal = await prisma.userWordCard.count();
    const someNull = await prisma.userWordCard.findFirst({
        where: { exampleSentence: null }
    });
    const someWith = await prisma.userWordCard.findFirst({
        where: { NOT: { exampleSentence: null } }
    });
    
    console.log(`总数: ${countTotal}`);
    console.log(`无例句: ${countNull}`);
    console.log("带例句示例:", someWith);
}
main().then(() => prisma.$disconnect());
