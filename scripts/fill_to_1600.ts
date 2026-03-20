import fs from 'fs';
import path from 'path';

const mainPath = path.join(__dirname, '../data/zhongkao_core_vocab_1600.json');

let existingWords: {word: string, meaning: string}[] = [];
if (fs.existsSync(mainPath)) {
  const raw = fs.readFileSync(mainPath, 'utf-8');
  existingWords = JSON.parse(raw);
}

const wordSet = new Set(existingWords.map(item => item.word.toLowerCase()));

// 准备一批极其基础但容易在去重时被漏掉的词汇（代词、数字、月份、颜色、基础动词等）
const candidates = [
  { word: "April", meaning: "n. 四月" },
  { word: "August", meaning: "n. 八月" },
  { word: "purple", meaning: "n.& adj. 紫色" },
  { word: "gray", meaning: "n.& adj. 灰色" },
  { word: "eleven", meaning: "num. 十一" },
  { word: "million", meaning: "num. 百万" },
  { word: "billion", meaning: "num. 十亿" },
  { word: "me", meaning: "pron. 我 (宾格)" },
  { word: "mine", meaning: "pron. 我的 (名词性物主代词)" },
  { word: "yours", meaning: "pron. 你的，你们的 (名词性物主代词)" },
  { word: "his", meaning: "pron. 他的" },
  { word: "hers", meaning: "pron. 她的 (名词性物主代词)" },
  { word: "its", meaning: "pron. 它的" },
  { word: "ours", meaning: "pron. 我们的 (名词性物主代词)" },
  { word: "theirs", meaning: "pron. 他们的 (名词性物主代词)" },
  { word: "am", meaning: "v. 是 (用于第一人称单数现在时)" },
  { word: "is", meaning: "v. 是 (用于第三人称单数现在时)" },
  { word: "are", meaning: "v. 是 (用于复数及第二人称现在时)" },
  { word: "was", meaning: "v. 是 (am, is 的过去式)" },
  { word: "were", meaning: "v. 是 (are 的过去式)" },
  { word: "been", meaning: "v. 是 (be 的过去分词)" },
  { word: "does", meaning: "v. 做，干 (do 的第三人称单数)" },
  { word: "did", meaning: "v. 做，干 (do 的过去式)" },
  { word: "done", meaning: "v. 做，干 (do 的过去分词)" },
  { word: "has", meaning: "v. 有 (have 的第三人称单数)" },
  { word: "had", meaning: "v. 有 (have 的过去式和过去分词)" },
  { word: "an", meaning: "art. 一（个，件……）(用于元音音素开头的词前)" },
  { word: "a", meaning: "art. 一（个，件……）" },
  { word: "yes", meaning: "adv. 是，好" },
  { word: "no", meaning: "adv. 不，没有" },
  { word: "not", meaning: "adv. 不，没" },
  { word: "very", "meaning": "adv. 很，非常" },
  { word: "too", "meaning": "adv. 太，也" },
  { word: "quite", "meaning": "adv. 相当，十分" },
  { word: "hello", "meaning": "int. 喂，你好" },
  { word: "hi", "meaning": "int. 嗨，你好" },
  { word: "bye", "meaning": "int. 再见" },
  { word: "ok", "meaning": "int. 好的，行" },
  { word: "please", "meaning": "int. 请" },
  { word: "sorry", "meaning": "adj. 对不起的，抱歉的" },
  { word: "thanks", "meaning": "n.& v. 感谢" },
  { word: "welcome", "meaning": "v.& adj. 欢迎，受欢迎的" },
  { word: "excuse", "meaning": "v. 原谅，宽恕 n. 借口" },
  { word: "pardon", "meaning": "v.& n. 原谅，宽恕" },
  { word: "Mr.", "meaning": "n. 先生 (Mister 的缩写)" },
  { word: "Mrs.", "meaning": "n. 夫人，太太 (Mistress 的缩写)" },
  { word: "Miss", "meaning": "n. 小姐，女士" },
  { word: "Ms.", "meaning": "n. 女士 (不知婚否)" },
  { word: "sir", "meaning": "n. 先生" },
  { word: "madam", "meaning": "n. 夫人，女士" }
];

let target = 1600;
let current = existingWords.length;
let needed = target - current;

let added = 0;

for (const candidate of candidates) {
  if (added >= needed) break;
  if (!wordSet.has(candidate.word.toLowerCase())) {
    existingWords.push(candidate);
    wordSet.add(candidate.word.toLowerCase());
    added++;
  }
}

fs.writeFileSync(mainPath, JSON.stringify(existingWords, null, 2), 'utf-8');
console.log(`✅ 成功补齐了 ${added} 个单词！`);
console.log(`🎯 目前主词汇表总计: ${existingWords.length} 个单词。`);