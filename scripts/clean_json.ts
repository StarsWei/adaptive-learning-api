import fs from 'fs';
import path from 'path';

const jsonPath = path.join(__dirname, '../data/zhongkao_core_vocab_1600.json');
const rawData = fs.readFileSync(jsonPath, 'utf-8');
const words = JSON.parse(rawData);

const uniqueWords = new Map();
const cleanedWords = [];
let duplicates = [];

// 1. 查找并剔除重复词（忽略大小写）
for (const item of words) {
  const lower = item.word.toLowerCase();
  if (uniqueWords.has(lower)) {
    duplicates.push(item.word);
  } else {
    uniqueWords.set(lower, item);
    cleanedWords.push(item);
  }
}

console.log(`🧹 找到并移除了重复单词:`, duplicates);

// 2. 如果剔除后不足 1600 个，补充极其基础的漏网之鱼
const candidates = [
  { word: "zone", meaning: "n. 地区，地带" },
  { word: "ahead", meaning: "adv. 在前，向前" },
  { word: "awake", meaning: "adj. 醒着的" },
  { word: "asleep", meaning: "adj. 睡着的" }
];

let added = 0;
for (const c of candidates) {
  if (cleanedWords.length >= 1600) break;
  const lower = c.word.toLowerCase();
  if (!uniqueWords.has(lower)) {
    cleanedWords.push(c);
    uniqueWords.set(lower, c);
    added++;
    console.log(`➕ 补充缺失的真实大纲词汇: ${c.word}`);
  }
}

fs.writeFileSync(jsonPath, JSON.stringify(cleanedWords, null, 2), 'utf-8');
console.log(`✅ JSON 实体文件清理完毕！当前绝对唯一单词数: ${cleanedWords.length}`);