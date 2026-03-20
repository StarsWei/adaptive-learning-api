# 极客背单词 (Geek Vocabulary Builder)

一个基于 **FSRS (Free Spaced Repetition Scheduler)** 算法的高效自适应背单词 MVP。它旨在利用先进的记忆算法，为中考核心词汇提供科学的记忆排期与内容精装修。

## 核心功能

*   **科学记忆排期**：深度集成 `ts-fsrs` 算法，根据遗忘曲线动态计算下次复习时间。
*   **内容精装修**：内置全量国际音标 (IPA) 映射与真题语境润色后的 AI 例句。
*   **丝滑交互体验**：
    *   **键盘盲操支持**：空格翻转，左右箭头甩牌切换，无需鼠标。
    *   **实体卡片动效**：模拟真实扑克牌甩出、滑入的物理动效。
    *   **视觉稳定性**：容器定高锁定布局，内容加载无跳变。
*   **数据驱动**：基于中考核心 1600 词库，提供精准的状态追踪（新词、学习、复习、重学）。

## 技术栈

*   **核心逻辑**: TypeScript, Node.js, Express
*   **数据库**: Prisma ORM, SQLite
*   **算法**: `ts-fsrs` (基于 FSRS 记忆算法)
*   **数据源**: `zhongkao_core_vocab_1600.json` (核心词库), `en_US.txt` (IPA 字典)

## 项目结构

- `src/` : 后端 API 服务逻辑 (`server.ts`)
- `prisma/` : 数据库 Schema 定义
- `public/` : 高颜值单页前端 (Tailwind CSS + 原生交互动效)
- `data/` : 词库与音标资源
- `scripts/` : 数据清洗与初始化工具脚本
- `journal/` : 开发札记 (忽略追踪)

## 快速运行

1. **环境准备**:
   ```bash
   npm install
   ```
2. **初始化数据库**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
3. **启动服务**:
   ```bash
   npx tsx src/server.ts
   ```
   启动后访问 `http://localhost:3000` 即可开始背单词。

## 贡献与维护

本工程为个人自适应学习方案，欢迎通过 PR 优化音标映射算法或增加更多词库。
