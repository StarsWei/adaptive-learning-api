import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("🧹 正在彻底清除错误音标...");
  const count = await prisma.userWordCard.updateMany({
    data: { phonetic: null }
  });
  console.log(`✅ 已清除 ${count.count} 个音标字段。`);
}
main().finally(() => prisma.$disconnect());