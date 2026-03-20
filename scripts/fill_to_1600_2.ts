import fs from 'fs';
import path from 'path';

const mainPath = path.join(__dirname, '../data/zhongkao_core_vocab_1600.json');

let existingWords: {word: string, meaning: string}[] = [];
if (fs.existsSync(mainPath)) {
  const raw = fs.readFileSync(mainPath, 'utf-8');
  existingWords = JSON.parse(raw);
}

const wordSet = new Set(existingWords.map(item => item.word.toLowerCase()));

// 添加最后一个极其偏门但也属于大纲词的词补齐 1600
const candidates = [
  { word: "zebra", meaning: "n. 斑马" },
  { word: "zero", meaning: "num. 零" }, // might exist
  { word: "yummy", meaning: "adj. 味道好的" }
];

let added = 0;
for (const c of candidates) {
  if (existingWords.length >= 1600) break;
  if (!wordSet.has(c.word.toLowerCase())) {
    existingWords.push(c);
    wordSet.add(c.word.toLowerCase());
    added++;
  }
}

fs.writeFileSync(mainPath, JSON.stringify(existingWords, null, 2), 'utf-8');
console.log(`✅ 成功补齐了 ${added} 个单词！`);
console.log(`🎯 目前主词汇表总计: ${existingWords.length} 个单词。`);