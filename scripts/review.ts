import { PrismaClient } from '@prisma/client';
import { FSRS, Rating, Card } from 'ts-fsrs';

const prisma = new PrismaClient();
const fsrs = new FSRS();

async function main() {
  const userId = "test-user-1";
  const targetWord = "algorithm";

  // 1. 从数据库中取出那张卡片
  const userCard = await prisma.userWordCard.findUnique({
    where: { userId_word: { userId, word: targetWord } }
  });

  if (!userCard) {
    console.log("找不到该单词！请先跑一遍 npx tsx scripts/seed.ts");
    return;
  }

  console.log(`\n🧠 [用户复习模拟]`);
  console.log(`正在复习单词: [${userCard.word}] - ${userCard.meaning}`);
  console.log(`复习前状态: state=${userCard.state}, dueDate=${userCard.dueDate.toLocaleString()}`);

  // 2. 将数据库字段转为 FSRS 算法能识别的 Card 对象
  const currentCard: Card = {
    due: userCard.dueDate,
    stability: userCard.stability,
    difficulty: userCard.difficulty,
    elapsed_days: 0,
    scheduled_days: 0,
    reps: userCard.reps,
    lapses: userCard.lapses,
    state: userCard.state as any,
    last_review: userCard.lastReview || undefined
  };

  // 3. 核心计算：假设用户此时看了一眼单词，然后点击了 "认识 (Good)"
  const now = new Date();
  const schedulingCards = fsrs.repeat(currentCard, now);
  // 获取 "Good" 评级后的新卡片状态
  const nextCard = schedulingCards[Rating.Good].card;

  console.log(`\n👆 动作: 用户点击了 "认识 (Good)"`);
  console.log(`⏱️  耗时: 假设用户思考了 1.5 秒`);
  console.log(`\n⚡ FSRS 算法引擎正在重新计算该卡片的遗忘曲线...\n`);

  // 4. 将新状态存回数据库，并记录流水（使用事务保证数据一致性）
  const [updatedCard, log] = await prisma.$transaction([
    prisma.userWordCard.update({
      where: { id: userCard.id },
      data: {
        state: nextCard.state,
        reps: nextCard.reps,
        lapses: nextCard.lapses,
        difficulty: nextCard.difficulty,
        stability: nextCard.stability,
        dueDate: nextCard.due,
        lastReview: nextCard.last_review || new Date(),
      }
    }),
    prisma.reviewLog.create({
      data: {
        cardId: userCard.id,
        rating: Rating.Good,
        durationMs: 1500,
        stateBefore: currentCard.state,
        difficultyBefore: currentCard.difficulty,
        stabilityBefore: currentCard.stability,
      }
    })
  ]);

  console.log(`✅ [数据库更新完毕]`);
  console.log(`复习后状态: state=${updatedCard.state}`);
  console.log(`下一次最佳复习时间 (dueDate): \x1b[32m${updatedCard.dueDate.toLocaleString()}\x1b[0m`);
  console.log(`大脑稳定性评分 (S): \x1b[33m${updatedCard.stability.toFixed(4)}\x1b[0m`);
  console.log(`单词难度评分 (D): \x1b[31m${updatedCard.difficulty.toFixed(4)}\x1b[0m\n`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });