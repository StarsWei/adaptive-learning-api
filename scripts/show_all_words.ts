import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = "test-user-1";
  
  // 查询已经交互过的词（state > 0）
  const activeCards = await prisma.userWordCard.findMany({
    where: { userId: userId, state: { gt: 0 } },
    orderBy: { updatedAt: 'desc' }
  });

  // 统计还没背过的新词数量（state === 0）
  const newCardsCount = await prisma.userWordCard.count({
    where: { userId: userId, state: 0 }
  });

  console.log(`\n📊 [数据库全景透视] 用户: ${userId}`);
  console.log(`--------------------------------------------------`);
  console.log(`🆕 尚未开始的新词池 (State 0): ${newCardsCount} 个`);
  console.log(`🏃 已经激活的单词 (State > 0): ${activeCards.length} 个\n`);

  if (activeCards.length > 0) {
    console.log("| 单词 (Word)  | 状态 | 难度(D) | 稳定性(S) | 复习次数 | 下次复习时间 (Due Date) |");
    console.log("|--------------|------|---------|-----------|----------|-------------------------|");
    for (const card of activeCards) {
      const stateStr = ["新词", "学习", "复习", "重学"][card.state] || "未知";
      const wordPadded = card.word.padEnd(12);
      const statePadded = stateStr.padEnd(2);
      const diffPadded = card.difficulty.toFixed(2).padEnd(7);
      const stabPadded = card.stability.toFixed(2).padEnd(9);
      const repsPadded = card.reps.toString().padEnd(8);
      const dueStr = card.dueDate.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

      console.log(`| ${wordPadded} | ${statePadded} | ${diffPadded} | ${stabPadded} | ${repsPadded} | ${dueStr} |`);
    }
  } else {
    console.log("💡 目前还没有产生任何学习记录，赶紧去前端点两下吧！");
  }
  console.log("");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());