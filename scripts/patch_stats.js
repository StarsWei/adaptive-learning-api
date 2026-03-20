const fs = require('fs');
const path = require('path');

const dir = '/home/xstars/.openclaw/workspace/jobs/adaptive-learning-api';

// 1. 更新 server.ts
const serverFile = path.join(dir, 'src/server.ts');
let serverCode = fs.readFileSync(serverFile, 'utf8');

const statsApi = `
// 💡 接口 3：获取用户学习统计数据 (大屏仪表盘)
app.get('/api/study/stats', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: '缺少必填参数: userId' });
    }
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [total, newWords, learning, reviewing, mastered, todayReviews] = await Promise.all([
      prisma.userWordCard.count({ where: { userId } }),
      prisma.userWordCard.count({ where: { userId, state: 0 } }),
      prisma.userWordCard.count({ where: { userId, state: { in: [1, 3] } } }),
      prisma.userWordCard.count({ where: { userId, state: 2 } }),
      prisma.userWordCard.count({ where: { userId, stability: { gt: 21 } } }),
      prisma.reviewLog.count({
        where: {
          card: { userId: userId },
          createdAt: { gte: startOfToday }
        }
      })
    ]);

    res.json({ success: true, data: { total, newWords, learning, reviewing, mastered, todayReviews } });
  } catch (error) {
    console.error('获取统计失败:', error);
    res.status(500).json({ success: false, error: '内部错误' });
  }
});
`;

if (!serverCode.includes('/api/study/stats')) {
  serverCode = serverCode.replace('const PORT = 3000;', statsApi + '\nconst PORT = 3000;');
  fs.writeFileSync(serverFile, serverCode);
  console.log('✅ server.ts 更新成功');
}

// 2. 更新 index.html
const htmlFile = path.join(dir, 'public/index.html');
let htmlCode = fs.readFileSync(htmlFile, 'utf8');

const statsHtml = `
    <!-- 数据大屏 -->
    <div id="statsPanel" class="w-full grid grid-cols-4 gap-2 text-center bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100 shadow-sm text-xs">
      <div><span class="block text-gray-400 mb-1">今日复习</span><strong id="st-today" class="text-blue-600 text-xl">0</strong></div>
      <div><span class="block text-gray-400 mb-1">新词剩余</span><strong id="st-new" class="text-gray-700 text-xl">0</strong></div>
      <div><span class="block text-gray-400 mb-1">正在死磕</span><strong id="st-learning" class="text-orange-500 text-xl">0</strong></div>
      <div><span class="block text-gray-400 mb-1">牢固掌握</span><strong id="st-mastered" class="text-green-600 text-xl">0</strong></div>
    </div>
`;

if (!htmlCode.includes('id="statsPanel"')) {
  htmlCode = htmlCode.replace('<!-- 单词显示区 -->', statsHtml + '\n    <!-- 单词显示区 -->');
}

const loadStatsScript = `
    async function loadStats() {
      try {
        const res = await fetch(\`/api/study/stats?userId=\${USER_ID}\`);
        const result = await res.json();
        if (result.success) {
          document.getElementById('st-today').innerText = result.data.todayReviews;
          document.getElementById('st-new').innerText = result.data.newWords;
          document.getElementById('st-learning').innerText = result.data.learning;
          document.getElementById('st-mastered').innerText = result.data.mastered;
        }
      } catch (e) { console.error('刷新统计失败', e); }
    }
    loadStats(); // 初始化加载
`;

if (!htmlCode.includes('loadStats()')) {
  htmlCode = htmlCode.replace('// 1. 获取今日单词列表', loadStatsScript + '\n    // 1. 获取今日单词列表');
  htmlCode = htmlCode.replace('console.log(`已提交', 'loadStats(); // 每次提交后刷新面板\n        console.log(`已提交');
  fs.writeFileSync(htmlFile, htmlCode);
  console.log('✅ index.html 更新成功');
}
