const fs = require('fs');
const file = '/home/xstars/.openclaw/workspace/jobs/adaptive-learning-api/public/index.html';
let code = fs.readFileSync(file, 'utf8');

// 1. 替换单词显示的 HTML 结构，增加一个小喇叭 SVG 图标
const wordHtmlRegex = /<h2 id="wordText" class="text-5xl font-black text-gray-900 mb-6 tracking-tight">word<\/h2>/;
const newWordHtml = `<div class="flex items-center justify-center space-x-4 mb-6">
          <h2 id="wordText" class="text-5xl font-black text-gray-900 tracking-tight">word</h2>
          <button id="speakBtn" class="text-gray-400 hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-blue-50 focus:outline-none" title="播放发音">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 10v4a2 2 0 002 2h2.586l3.707 3.707A.996.996 0 0014 21V3a.996.996 0 00-1.707-.707L9.586 10H7a2 2 0 00-2 2z" />
            </svg>
          </button>
        </div>`;

if (wordHtmlRegex.test(code)) {
  code = code.replace(wordHtmlRegex, newWordHtml);
}

// 2. 注入语音合成 (Web Speech API) 的 JS 函数
const scriptEndRegex = /<\/script>/;
const ttsFunction = `
    // 🌟 核心魔法：调用浏览器原生语音引擎 (TTS)
    function speakWord(text) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // 打断上一个还没读完的单词
        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'en-US'; // 设定为美式英语 (如果是 en-GB 则是英式)
        msg.rate = 0.85;    // 语速稍微放慢，适合学习者听清细节
        window.speechSynthesis.speak(msg);
      }
    }

    // 绑定喇叭按钮点击事件
    document.getElementById('speakBtn').addEventListener('click', () => {
      if (cards[currentIndex]) {
        speakWord(cards[currentIndex].word);
      }
    });
  </script>`;

if (scriptEndRegex.test(code) && !code.includes('speakWord(')) {
  code = code.replace(scriptEndRegex, ttsFunction);
}

// 3. 在 showCard 函数里，每次切换单词时自动朗读
const showCardRegex = /wordText\.innerText = card\.word;/;
const newShowCard = `wordText.innerText = card.word;
      // 🌟 切换卡片时自动朗读单词
      speakWord(card.word);`;

if (showCardRegex.test(code) && !code.includes('speakWord(card.word);')) {
  code = code.replace(showCardRegex, newShowCard);
}

fs.writeFileSync(file, code);
console.log('✅ 前端 TTS (语音合成) 魔法注入成功！');