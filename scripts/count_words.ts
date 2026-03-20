import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`\n🕵🏻‍♀️ [系统级词库深度盘点] 开始核对...`);
  
  // 1. 检查物理 JSON 文件
  const jsonPath = path.join(__dirname, '../data/zhongkao_core_vocab_1600.json');
  if (!fs.existsSync(jsonPath)) {
    console.error("找不到 JSON 文件！");
    return;
  }
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const words = JSON.parse(rawData);
  console.log(`\n📄 [JSON 实体文件] 数组长度: ${words.length} 个条目`);

  // 检查 JSON 内部是否有重复单词 (大小写不敏感)
  const uniqueWords = new Set(words.map((w: any) => w.word.toLowerCase()));
  console.log(`🔍 [JSON 严格去重] 实际唯一单词数: ${uniqueWords.size} 个`);

  // 2. 检查 SQLite 数据库
  const dbCount = await prisma.userWordCard.count({
    where: { userId: 'test-user-1' }
  });
  console.log(`🗄️  [SQLite 数据库] 用户 test-user-1 拥有的记忆卡片总数: ${dbCount} 张\n`);
  
  if (uniqueWords.size === 1600 && dbCount === 1600) {
    console.log(`🎉 完美匹配！系统词库处于 100% 健康状态。`);
  } else {
    console.log(`⚠️ 发现数据偏差，请仔细核对上面的数字。`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());