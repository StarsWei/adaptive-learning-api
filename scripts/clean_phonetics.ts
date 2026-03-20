import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 正在清理错误的音标数据...");
  const count = await prisma.userWordCard.updateMany({
    where: { phonetic: { not: null } },
    data: { phonetic: null }
  });
  console.log(`✅ 已清除 ${count.count} 个音标错误数据。`);
}

main().finally(() => prisma.$disconnect());