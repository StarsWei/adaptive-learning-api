const fs = require('fs');
const file = '/home/xstars/.openclaw/workspace/jobs/adaptive-learning-api/public/index.html';
let code = fs.readFileSync(file, 'utf8');

// 1. 删掉按钮的 HTML 渲染代码
const btnRegex = /<button id="forceRefreshBtn"[\s\S]*?<\/button>/g;
code = code.replace(btnRegex, '');

// 2. 删掉事件监听器代码块
const listenerRegex = /\/\/ 🌟 修复强制刷新按钮的事件绑定[\s\S]*?\}\);/g;
code = code.replace(listenerRegex, '');

fs.writeFileSync(file, code);
console.log('✅ index.html 强制刷新按钮及底层逻辑已彻底删除！');
