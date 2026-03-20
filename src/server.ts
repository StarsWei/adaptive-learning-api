import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { FSRS, Rating, Card } from 'ts-fsrs';
import cors from 'cors';
import path from 'path';

const app = express();
app.use(cors()); 
app.use(express.json());

app.use(express.static(path.join(process.cwd(), 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public/index.html'));
});

const prisma = new PrismaClient();
const fsrs = new FSRS();

// 💡 接口 1：获取今日学习任务
app.get('/api/study/today', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: '缺少userId' });
    const now = new Date();
    
    // 每日新词限额逻辑
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const learnedNewToday = await prisma.reviewLog.count({
      where: { card: { userId }, stateBefore: 0, createdAt: { gte: startOfToday } }
    });
    const newWordsQuota = Math.max(0, 20 - learnedNewToday);

    const dueCards = await prisma.userWordCard.findMany({
      where: { userId, state: { gt: 0 }, dueDate: { lte: now } },
      orderBy: { dueDate: 'asc' }, take: 20
    });

    let ObjectCards = dueCards;
    if (ObjectCards.length < 20 && newWordsQuota > 0) {
      const newCards = await prisma.userWordCard.findMany({
        where: { userId, state: 0 }, take: Math.min(20 - ObjectCards.length, newWordsQuota)
      });
      ObjectCards = ObjectCards.concat(newCards);
    }

    const nextCard = await prisma.userWordCard.findFirst({
      where: { userId, state: { gt: 0 } }, orderBy: { dueDate: 'asc' }
    });

    res.json({ success: true, data: ObjectCards, nextDueTime: nextCard ? nextCard.dueDate : null });
  } catch (error) {
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 💡 接口 2：提交复习结果
app.post('/api/study/review', async (req: Request, res: Response) => {
  try {
    const { userId, cardId, rating, durationMs = 0 } = req.body;
    const userCard = await prisma.userWordCard.findUnique({ where: { id: cardId } });

    if (!userCard || userCard.userId !== userId) return res.status(404).json({ error: '找不到单词' });

    const currentCard: Card = {
      due: userCard.dueDate, stability: userCard.stability, difficulty: userCard.difficulty,
      elapsed_days: 0, scheduled_days: 0, reps: userCard.reps, lapses: userCard.lapses,
      state: userCard.state as any, last_review: userCard.lastReview || undefined
    };

    const now = new Date();
    const schedulingCards = fsrs.repeat(currentCard, now);
    const nextCard = schedulingCards[rating as Rating].card;

    const [updatedCard] = await prisma.$transaction([
      prisma.userWordCard.update({
        where: { id: cardId },
        data: {
          state: nextCard.state, reps: nextCard.reps, lapses: nextCard.lapses,
          difficulty: nextCard.difficulty, stability: nextCard.stability,
          dueDate: nextCard.due, lastReview: nextCard.last_review || now,
        }
      }),
      prisma.reviewLog.create({
        data: { cardId, rating, durationMs, stateBefore: currentCard.state, difficultyBefore: currentCard.difficulty, stabilityBefore: currentCard.stability }
      })
    ]);

    res.json({ success: true, data: updatedCard });
  } catch (error) {
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 💡 接口 3：数据统计
app.get('/api/study/stats', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [total, newWords, learning, reviewing, mastered, todayReviews] = await Promise.all([
      prisma.userWordCard.count({ where: { userId } }),
      prisma.userWordCard.count({ where: { userId, state: 0 } }),
      prisma.userWordCard.count({ where: { userId, state: { in: [1, 3] } } }),
      prisma.userWordCard.count({ where: { userId, state: 2 } }),
      prisma.userWordCard.count({ where: { userId, stability: { gt: 21 } } }),
      prisma.reviewLog.count({ where: { card: { userId }, createdAt: { gte: startOfToday } } })
    ]);

    res.json({ success: true, data: { total, newWords, learning, reviewing, mastered, todayReviews } });
  } catch (error) {
    res.status(500).json({ success: false, error: '内部错误' });
  }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 [Adaptive Learning API] 引擎已重启! http://0.0.0.0:${PORT}`);
});