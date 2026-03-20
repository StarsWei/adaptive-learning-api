import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const userId = "test-user-1";
  
  const cards = await prisma.userWordCard.findMany({
    where: { userId: userId },
    orderBy: [
      { state: 'desc' }, 
      { updatedAt: 'desc' }
    ],
    take: 30
  });

  // CSV 表头
  let csv = `序号,单词,状态,难度(D),稳定性(S),复习次数,遗忘次数,下次复习时间,最后交互时间\n`;

  cards.forEach((card, index) => {
    const stateStr = ["新词", "学习", "复习", "重学"][card.state] || "未知";
    const diff = card.difficulty.toFixed(2);
    const stab = card.stability.toFixed(2);
    // 转换时间格式，避免被 CSV 逗号截断
    const due = card.dueDate.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }).replace(/,/g, '');
    const updated = card.updatedAt.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }).replace(/,/g, '');
    
    // 拼接成 CSV 行
    csv += `${index + 1},${card.word},${stateStr},${diff},${stab},${card.reps},${card.lapses},${due},${updated}\n`;
  });

  const outDir = '/home/xstars/.openclaw/workspace/jobs/outputs';
  const outFile = path.join(outDir, 'words_status_top30.csv');
  
  // 写入文件，加上 BOM 头防止 Excel 乱码
  fs.writeFileSync(outFile, Buffer.from('\\uFEFF' + csv, 'utf-8'));
  console.log(`✅ CSV 表格已生成至：\${outFile}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());