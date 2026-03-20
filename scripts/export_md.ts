import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const userId = "test-user-1";
  
  // 提取前 30 个词汇 (优先已经背过的)
  const cards = await prisma.userWordCard.findMany({
    where: { userId: userId },
    orderBy: [
      { state: 'desc' }, // 优先展示 state > 0 的活跃单词
      { updatedAt: 'desc' } // 再按最近更新时间排序
    ],
    take: 30
  });

  let md = `## 📊 用户 [${userId}] 单词状态全景透视表 (Top 30)\n\n`;
  md += `> **注意**: 包含所有已激活词汇，如果不满 30 个，会用 \`state=0\` 的新词补齐。\n\n`;
  md += `| 序号 | 单词 (Word) | 状态 | 难度(D) | 稳定性(S) | 复习次数 | 遗忘次数 | 下次复习时间 (Due Date) | 最后交互时间 |\n`;
  md += `|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---|:---|\n`;

  cards.forEach((card, index) => {
    const stateStr = ["新词", "学习", "复习", "重学"][card.state] || "未知";
    const diff = card.difficulty.toFixed(2);
    const stab = card.stability.toFixed(2);
    const due = card.dueDate.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    const updated = card.updatedAt.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    
    md += `| ${index + 1} | **${card.word}** | ${stateStr} | ${diff} | ${stab} | ${card.reps} | ${card.lapses} | ${due} | ${updated} |\n`;
  });

  const outDir = '/home/xstars/.openclaw/workspace/jobs/outputs';
  const outFile = path.join(outDir, 'words_status_top30.md');
  
  fs.writeFileSync(outFile, md, 'utf8');
  console.log(`✅ 完整 30 词 Markdown 表格已生成至：${outFile}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());