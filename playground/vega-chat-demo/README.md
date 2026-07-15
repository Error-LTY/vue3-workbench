# Vega 流式图表渲染 Demo

智能体/AI 对话场景：流式接收回复，自动识别 `<bar>` 标签并用 Vega 渲染图表。

## 快速开始

```bash
cd playground/vega-chat-demo
npm install
npm run dev
```

浏览器打开 `http://localhost:5173/`，点击「模拟流式接收」查看效果。

## 集成到你的项目

只需复制 `src/composables/vegaChartHelper.js`，两个纯函数，零侵入：

```js
import { processVegaCharts, mountVegaCharts } from './vegaChartHelper'
import { nextTick } from 'vue'
import { marked } from 'marked'

// 1. 定义图表映射
const barMap = {
  barOne: { $schema: '...', data: {...}, mark: 'bar', ... },
  barTwo: { $schema: '...', data: {...}, mark: 'arc', ... },
}

// 2. 你的正常流式逻辑
msg.markdown += res.data   // 不变，保持你原来的写法

// 3. 渲染时过一遍 processVegaCharts
function renderHtml() {
  const processed = processVegaCharts(barMap, msg.markdown)
  return marked.parse(processed)
}

// 4. DOM 更新后挂载图表
nextTick(() => mountVegaCharts(barMap, containerRef.value))
```

```html
<!-- 模板：跟原来一样，v-html 绑定即可 -->
<div ref="containerRef">
  <div v-html="renderHtml()"></div>
</div>
```

就这些——不改变你现有的 `msg.markdown += res.data`，不需要 composable、不需要内部状态。

## API

### `processVegaCharts(barMap, markdown)`

纯函数，扫描 markdown 文本中的 `<bar>` 标签，替换为图表容器 div。

- **完整标签** `<bar><div id='xxx'></div></bar>` → 替换为 `<div class="vega-chart-container" data-chart-id="xxx"></div>`
- **不完整标签**（流式未传输完）→ 保留原样，下次再试
- **未注册的 id** → 替换为错误提示

```js
const processed = processVegaCharts(barMap, msg.markdown)
```

### `mountVegaCharts(barMap, containerEl)`

在容器 DOM 中找到所有未挂载的图表容器，调用 `vegaEmbed` 渲染。已挂载的自动跳过，可安全重复调用。

```js
nextTick(() => mountVegaCharts(barMap, containerRef.value))
```

## 约定

AI / 服务端返回的 markdown 中用以下格式标记图表位置：

```html
<bar><div id='barOne'></div></bar>
```

`id` 对应 `barMap` 中的 key。

## 核心文件

| 文件 | 说明 |
|------|------|
| `src/composables/vegaChartHelper.js` | **核心**，两个纯函数，直接复制复用 |
| `src/composables/useVegaMarkdown.js` | 旧版 composable 方案（Vue 深度绑定） |
| `src/App.vue` | Demo 页面，展示集成方式 |

## 技术栈

Vue 3 + Vite + marked + vega-embed + vega-lite
