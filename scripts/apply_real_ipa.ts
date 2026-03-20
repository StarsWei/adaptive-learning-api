import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const dictPath = path.join(__dirname, '../data/en_US.txt');
    const dictContent = fs.readFileSync(dictPath, 'utf-8');
    
    console.log("📚 正在加载开源 IPA 音标词典...");
    const ipaMap = new Map<string, string>();
    
    // Parse the TSV dictionary
    for (const line of dictContent.split('\n')) {
        const parts = line.split('\t');
        if (parts.length >= 2) {
            const word = parts[0].trim().toLowerCase();
            const ipas = parts[1].split(', ');
            if (ipas.length > 0) {
                ipaMap.set(word, ipas[0]); // Take the first pronunciation
            }
        }
    }
    
    console.log(`✅ 成功加载词典，总计 ${ipaMap.size} 个词条。`);
    
    console.log("🚀 开始全量映射单词音标...");
    const allCards = await prisma.userWordCard.findMany({
        where: { userId: "test-user-1" },
        select: { id: true, word: true }
    });
    
    let matched = 0;
    let missing = 0;
    
    for (const card of allCards) {
        const lowerWord = card.word.toLowerCase();
        let ipa = ipaMap.get(lowerWord);
        
        if (ipa) {
            await prisma.userWordCard.update({
                where: { id: card.id },
                data: { phonetic: ipa }
            });
            matched++;
        } else {
            missing++;
            console.log(`⚠️ 未找到音标: ${card.word}`);
        }
        
        if ((matched + missing) % 200 === 0) {
            console.log(`⏳ 进度: ${matched + missing} / ${allCards.length}`);
        }
    }
    
    console.log(`\n🎉 音标映射完成！`);
    console.log(`✅ 成功匹配: ${matched} 个单词`);
    console.log(`❌ 词典缺失: ${missing} 个单词`);
}

main().finally(() => prisma.$disconnect());
