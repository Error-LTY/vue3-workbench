# Vega 流式图表渲染 Demo

智能体对话场景：流式接收 AI 回复，自动识别 `<bar>` 标签并用 vegaEmbed 渲染图表。

## 快速开始

```bash
cd playground/vega-chat-demo
npm install
npm run dev
```

## 集成到现有项目

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

## 约定

AI 返回的 markdown 中用 `<bar><div id='barOne'></div></bar>` 标记图表位置，`id` 对应 `barMap` 中的 key。

## 核心文件

| 文件 | 说明 |
|------|------|
| `src/composables/useVegaMarkdown.js` | 核心 composable，可直接复制复用 |
| `src/App.vue` | Demo 页面，展示 3 步集成方式 |

## 技术栈

Vue 3 + Vite + marked + vega-embed + vega-lite
