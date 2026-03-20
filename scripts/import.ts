import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const userId = "test-user-1";
  console.log(`\n🚀 开始导入中考核心词汇表...`);

  // 1. 读取 JSON 数据
  const dataPath = path.join(__dirname, '../data/zhongkao_core_vocab_1600.json');
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ 找不到词汇表文件: ${dataPath}`);
    return;
  }

  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const words: { word: string; meaning: string }[] = JSON.parse(rawData);

  console.log(`📖 成功加载了 ${words.length} 个单词，准备灌入数据库...`);

  let successCount = 0;
  let skipCount = 0;

  // 2. 批量处理并保证幂等性 (如果已存在则跳过)
  for (const item of words) {
    // 检查是否已经存在该单词卡片
    const exists = await prisma.userWordCard.findUnique({
      where: {
        userId_word: { userId, word: item.word }
      }
    });

    if (exists) {
      skipCount++;
      continue;
    }

    // 不存在则插入新卡片 (初始状态 state: 0, 难度 0, 稳定性 0)
    await prisma.userWordCard.create({
      data: {
        userId,
        word: item.word,
        meaning: item.meaning,
        state: 0,          // 0 代表新词
        difficulty: 0,
        stability: 0,
        retrievability: 0,
        reps: 0,
        lapses: 0,
      }
    });
    
    successCount++;
    if (successCount % 10 === 0) {
      console.log(`⏳ 已成功插入 ${successCount} 个单词...`);
    }
  }

  console.log(`\n🎉 导入任务执行完毕！`);
  console.log(`📊 统计报告：`);
  console.log(`   - 成功新导入：${successCount} 个`);
  console.log(`   - 已存在跳过：${skipCount} 个`);
  console.log(`   - 数据库最新状态：待学习新词汇已就绪！\n`);
}

main()
  .catch(e => {
    console.error('导入时发生致命错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });