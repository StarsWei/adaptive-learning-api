import { PrismaClient } from '@prisma/client';
import { createEmptyCard } from 'ts-fsrs';

const prisma = new PrismaClient();

const words = [
  { word: "apple", meaning: "n. 苹果" },
  { word: "banana", meaning: "n. 香蕉" },
  { word: "algorithm", meaning: "n. 算法" },
  { word: "adaptive", meaning: "adj. 适应的" },
  { word: "serendipity", meaning: "n. 机缘巧合" }
];

async function main() {
  const userId = "test-user-1";
  console.log(`\n🌱 开始为用户 ${userId} 播种单词...`);

  // FSRS 初始化一张新卡片（作为默认状态模板）
  const emptyCard = createEmptyCard();

  for (const item of words) {
    // 使用 upsert，如果已存在就不重复插了
    await prisma.userWordCard.upsert({
      where: {
        userId_word: { userId, word: item.word }
      },
      update: {},
      create: {
        userId,
        word: item.word,
        meaning: item.meaning,
        // 初始化 FSRS 的状态
        state: emptyCard.state,
        reps: emptyCard.reps,
        lapses: emptyCard.lapses,
        difficulty: emptyCard.difficulty,
        stability: emptyCard.stability,
        dueDate: emptyCard.due,
      }
    });
    console.log(`✅ 已插入新词汇: [${item.word}] - ${item.meaning}`);
  }
  console.log("🎉 播种完成！数据库已就绪。\n");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });