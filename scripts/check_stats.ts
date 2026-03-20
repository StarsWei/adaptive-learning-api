import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = "test-user-1";
  
  // 获取最近更新（刚背过）的 20 个单词
  const recentCards = await prisma.userWordCard.findMany({
    where: { 
      userId: userId,
      reps: { gt: 0 } // 只看复习次数大于 0 的，排除了没背过的新词
    },
    orderBy: { updatedAt: 'desc' },
    take: 20
  });

  if (recentCards.length === 0) {
    console.log("❌ 数据库里没有找到最近的复习记录！你是不是光看了没点按钮呀？");
    return;
  }

  console.log("📊 [FSRS 算法引擎 - 脑电波扫描报告]");
  console.log("用户: test-user-1 | 最新复习的 20 个单词状态\n");
  
  console.log("| 单词 (Word) | 状态 | 难度(D) | 稳定性(S) | 复习次数 | 下次复习时间 (Due Date) |");
  console.log("|-------------|------|---------|-----------|----------|-------------------------|");

  for (const card of recentCards) {
    const stateStr = ["新词", "学习", "复习", "重学"][card.state] || "未知";
    // 简单格式化对齐
    const wordPadded = card.word.padEnd(11);
    const statePadded = stateStr.padEnd(2);
    const diffPadded = card.difficulty.toFixed(2).padEnd(7);
    const stabPadded = card.stability.toFixed(2).padEnd(9);
    const repsPadded = card.reps.toString().padEnd(8);
    const dueStr = card.dueDate.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

    console.log(`| ${wordPadded} | ${statePadded} | ${diffPadded} | ${stabPadded} | ${repsPadded} | ${dueStr} |`);
  }
  console.log("\n💡 释义：");
  console.log(" - 难度(D)：越大代表这个词你越容易忘（上限10）。");
  console.log(" - 稳定性(S)：越大代表记忆越牢固，下次复习的间隔天数也会越长。");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());