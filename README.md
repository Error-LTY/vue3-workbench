# 🧰 Vue3 开发工作台

日常开发遇到的问题 & 解决方案。

---

## playground/vega-chat-demo — 流式 Markdown 图表渲染

智能体对话场景：流式接收 AI 回复，自动识别 `<bar>` 标签并渲染 Vega 图表。

### 快速开始

```bash
cd playground/vega-chat-demo
npm install
npm run dev
```

### 集成到现有项目

复制 `src/composables/useVegaMarkdown.js` 到你的项目：

```js
import { useVegaMarkdown } from './composables/useVegaMarkdown'

// 1. 定义图表映射
const barMap = {
  barOne: { $schema: '...', data: {...}, mark: 'bar', ... },
  barTwo: { $schema: '...', data: {...}, mark: 'arc', ... },
}

// 2. 初始化
const { renderedHtml, containerRef, appendChunk, reset } = useVegaMarkdown(barMap)

// 3. 在流式回调中调用 appendChunk
function onStreamChunk(chunk) {
  appendChunk(chunk)  // 代替原来的 msg.markdown += chunk
}
```

```html
<!-- 4. 模板绑定 -->
<div ref="containerRef">
  <div v-html="renderedHtml"></div>
</div>
```

### 约定

AI 返回的 markdown 中，用 `<bar><div id='barOne'></div></bar>` 标记图表位置，`id` 对应 `barMap` 中的 key。

### 技术栈

Vue 3 + Vite + marked + vega-embed + vega-lite

---

## AUI / Element Plus 问题记录

*待添加 — 公司遇到问题后，按 `docs/问题名.md` 格式记录*

---

> 📮 公司 → 家：邮件/微信发给自己 | 家 → 公司：push 后在浏览器看 https://github.com/Error-LTY/vue3-workbench
