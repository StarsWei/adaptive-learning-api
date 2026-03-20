import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const userId = "test-user-1";
  
  // 1. 加载 1600 个单词的权威 JSON
  const jsonPath = path.join(__dirname, '../data/zhongkao_core_vocab_1600.json');
  const words = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const wordSet = new Set(words.map((w: any) => w.word.toLowerCase()));

  // 2. 获取数据库里所有的词
  const dbCards = await prisma.userWordCard.findMany({ where: { userId } });

  let deletedCount = 0;
  for (const card of dbCards) {
    // 如果数据库里的词不在权威词库里，那是“野词”，必须删！
    if (!wordSet.has(card.word.toLowerCase())) {
      console.log(`🗑️ 发现野词，正在清理: ${card.word}`);
      await prisma.userWordCard.delete({ where: { id: card.id } });
      deletedCount++;
    }
  }
  
  // 3. 再次执行导入脚本（确保漏网之鱼入库）
  // 刚才我们通过 scripts/import.ts 已经导入过，这里只需要跑一遍确认逻辑即可
  console.log(`✅ 清理完毕，删除了 ${deletedCount} 个非大纲词汇`);
  const finalCount = await prisma.userWordCard.count({ where: { userId } });
  console.log(`🎯 当前数据库准确词汇数: ${finalCount} / 1600`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());