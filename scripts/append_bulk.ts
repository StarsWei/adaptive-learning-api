import fs from 'fs';
import path from 'path';

const mainPath = path.join(__dirname, '../data/zhongkao_core_vocab_1600.json');
const batches = ['batch_extra.json'];

let existingWords = [];
if (fs.existsSync(mainPath)) {
  const raw = fs.readFileSync(mainPath, 'utf-8');
  existingWords = JSON.parse(raw);
}

const wordSet = new Set(existingWords.map((item: any) => item.word));
let addedCount = 0;

for (const batch of batches) {
  const batchPath = path.join(__dirname, `../data/${batch}`);
  if (fs.existsSync(batchPath)) {
    const batchRaw = fs.readFileSync(batchPath, 'utf-8');
    const newWords = JSON.parse(batchRaw);
    for (const item of newWords) {
      if (!wordSet.has(item.word)) {
        existingWords.push(item);
        wordSet.add(item.word);
        addedCount++;
      }
    }
  }
}

fs.writeFileSync(mainPath, JSON.stringify(existingWords, null, 2), 'utf-8');
console.log(`✅ 成功将 ${addedCount} 个新单词注入主词汇表！`);
console.log(`目前主词汇表总计: ${existingWords.length} 个单词。`);