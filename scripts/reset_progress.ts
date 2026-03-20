import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = "test-user-1";
  console.log(`\n🧹 正在为用户 \${userId} 清空学习记录，恢复出厂设置...`);

  // 1. 清空该用户产生的所有复习流水（这样今日新词额度就会重置为 0）
  const deletedLogs = await prisma.reviewLog.deleteMany({
    where: {
      card: {
        userId: userId
      }
    }
  });
  console.log(`✅ 删除了 \${deletedLogs.count} 条复习流水日志`);

  // 2. 将所有单词卡片的状态重置为“新词”状态
  const updatedCards = await prisma.userWordCard.updateMany({
    where: {
      userId: userId
    },
    data: {
      state: 0,           // 变回新词
      reps: 0,            // 复习次数清零
      lapses: 0,          // 遗忘次数清零
      difficulty: 0,      // 难度系数归零
      stability: 0,       // 稳定性归零
      retrievability: 0,  // 记忆保留率归零
      lastReview: null,   // 清除上次复习时间
      dueDate: new Date() // 下次复习时间重置为现在
    }
  });
  console.log(`✅ 重置了 \${updatedCards.count} 张单词卡片的状态为 0 (新词)`);

  console.log(`\n🎉 记忆消除手术完成！系统已恢复到最初的 259 词开荒状态！`);
}

main()
  .catch(e => {
    console.error('清空数据时发生致命错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });