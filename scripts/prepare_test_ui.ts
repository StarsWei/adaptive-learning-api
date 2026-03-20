import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = "test-user-1";
  const words = ['abandon', 'ability', 'able', 'about', 'above'];

  // 先把这 5 个词重置为新词 (state: 0)
  await prisma.userWordCard.updateMany({
    where: { userId, word: { in: words } },
    data: { state: 0, dueDate: new Date() }
  });

  // 把剩下的词全部标记为已完成 (state: 2)
  await prisma.userWordCard.updateMany({
    where: { userId, word: { notIn: words } },
    data: { state: 2, dueDate: new Date(Date.now() + 86400000 * 30) }
  });

  console.log("✅ 测试环境已就绪：仅这 5 个精装修词待学习！");
}

main().finally(() => prisma.$disconnect());