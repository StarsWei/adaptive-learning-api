import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = "test-user-1";
  
  const cards = await prisma.userWordCard.findMany({
    where: { 
      userId: userId,
      state: { gt: 0 } // 只看已经学过的词
    },
    orderBy: { dueDate: 'asc' },
    take: 15
  });

  console.log("\n⏳ [系统揭秘] 你的艾宾浩斯复习时间表 ⏳\n");
  
  for (const card of cards) {
    const dueStr = card.dueDate.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    const now = new Date();
    const diffMs = card.dueDate.getTime() - now.getTime();
    
    let timeInfo = "";
    if (diffMs <= 0) {
      timeInfo = "\x1b[31m[现在立刻需要复习！]\x1b[0m";
    } else if (diffMs < 60 * 60 * 1000) {
      timeInfo = `\x1b[33m[${Math.ceil(diffMs / 60000)} 分钟后复习]\x1b[0m`;
    } else if (diffMs < 24 * 60 * 60 * 1000) {
      timeInfo = `\x1b[36m[${Math.ceil(diffMs / 3600000)} 小时后复习]\x1b[0m`;
    } else {
      timeInfo = `\x1b[32m[${Math.ceil(diffMs / 86400000)} 天后复习]\x1b[0m`;
    }

    const stateStr = ["新词", "学习中", "复习", "重学"][card.state] || "未知";
    console.log(`${card.word.padEnd(12)} | 状态: ${stateStr.padEnd(3)} | 调度时间: ${dueStr.padEnd(20)} | ${timeInfo}`);
  }
  console.log("");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());