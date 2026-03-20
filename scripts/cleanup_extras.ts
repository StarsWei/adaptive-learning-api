import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const deleted = await prisma.userWordCard.deleteMany({
        where: {
            word: {
                in: ['may', 'abandon']
            }
        }
    });
    console.log(`🧹 已清理 ${deleted.count} 条测试冗余记录。`);
    
    const remaining = await prisma.userWordCard.count();
    console.log(`📊 当前数据库剩余总词数: ${remaining}`);
}
main().then(() => prisma.$disconnect());
