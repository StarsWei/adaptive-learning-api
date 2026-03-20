import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const cards = await prisma.userWordCard.findMany({
        select: { word: true }
    });
    const words = cards.map(c => c.word);
    
    // 找出数据库里有但不在 1600 核心词库里的词
    const fs = require('fs');
    const path = require('path');
    const coreWords = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/zhongkao_core_vocab_1600.json'), 'utf-8')).map((w: any) => w.word);
    
    const extras = words.filter(w => !coreWords.includes(w));
    console.log("Extra words found in DB:", extras);
}
main().then(() => prisma.$disconnect());
