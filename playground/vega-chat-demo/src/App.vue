<template>
  <div class="chat-page">
    <h1>智能体对话 — Vega 流式图表渲染 Demo</h1>

    <div class="chat-window">
      <div class="message-content" ref="containerRef">
        <div v-if="!msg.markdown && !isStreaming" class="placeholder">
          点击下方按钮开始模拟流式接收
        </div>
        <div v-if="msg.markdown" v-html="renderedHtml()"></div>
        <div v-if="isStreaming && !msg.markdown" class="placeholder">
          接收中...
        </div>
      </div>
      <span class="cursor" v-if="isStreaming">|</span>
    </div>

    <div class="status" v-if="error">{{ error }}</div>
    <div class="status ok" v-if="log">{{ log }}</div>

    <div class="controls">
      <button @click="startStream" :disabled="isStreaming">模拟流式接收</button>
      <button @click="doReset">重置</button>
    </div>

    <div class="legend">
      <p>barMap 已注册：</p>
      <ul>
        <li v-for="key in Object.keys(barMap)" :key="key">
          <code>{{ key }}</code> — {{ barMap[key].description || 'Vega chart' }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
// ============================================================
// 🤖 假设这是你现有的智能体对话组件
//    在你的正常逻辑里，只需加两行代码（看 👇 标记处）
// ============================================================

import { ref, nextTick } from 'vue'
import { marked } from 'marked'
import { processVegaCharts, mountVegaCharts } from './composables/vegaChartHelper'

// ---- 1. 定义你的图表映射 ----
const barMap = {
  barOne: {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: '月度销售额',
    data: {
      values: [
        { month: '1月', sales: 120, target: 100 },
        { month: '2月', sales: 200, target: 150 },
        { month: '3月', sales: 150, target: 130 },
        { month: '4月', sales: 280, target: 200 },
        { month: '5月', sales: 220, target: 180 },
        { month: '6月', sales: 310, target: 250 },
      ],
    },
    mark: 'bar',
    encoding: {
      x: { field: 'month', type: 'ordinal' },
      y: { field: 'sales', type: 'quantitative' },
      color: { value: '#4C78A8' },
    },
    width: 400,
    height: 250,
  },

  barTwo: {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: '品类占比',
    data: {
      values: [
        { category: 'PC', value: 450 },
        { category: '手机', value: 320 },
        { category: '平板', value: 180 },
        { category: '配件', value: 95 },
      ],
    },
    mark: { type: 'arc', innerRadius: 60 },
    encoding: {
      theta: { field: 'value', type: 'quantitative' },
      color: { field: 'category', type: 'nominal' },
    },
    width: 300,
    height: 300,
  },
}

// ---- 2. 你的正常逻辑（模拟） ----
const containerRef = ref(null)
const msg = ref({ markdown: '' })   // 👈 这就是你的 msg.markdown
const isStreaming = ref(false)
const error = ref('')
const log = ref('')

// 把 msg.markdown 渲染成 HTML（你的正常逻辑）
function renderedHtml() {
  const processed = processVegaCharts(barMap, msg.value.markdown)  // 👈 就这一行！
  try {
    return marked.parse(processed) || ''
  } catch {
    return marked(processed) || ''
  }
}

const fullStreamText = [
  '## 销售数据报告\n\n',
  '以下是本月各渠道的销售概况。\n\n',
  '### 月度趋势\n\n',
  '销售额稳步增长：\n\n',
  "<bar><div id='barOne'></div></bar>\n\n",
  '**6月销售额达310万**，超目标24%。\n\n',
  '### 品类分布\n\n',
  '各品类占比如下：\n\n',
  "<bar><div id='barTwo'></div></bar>\n\n",
  'PC品类仍占最大份额，手机增速明显。\n\n',
  '> 总结：Q2整体完成度良好，建议下半年加大对手机品类的投入。',
]

let streamTimer = null

function startStream() {
  error.value = ''
  log.value = '开始接收...'
  msg.value.markdown = ''
  isStreaming.value = true

  let index = 0
  function push() {
    if (index >= fullStreamText.length) {
      isStreaming.value = false
      log.value = '接收完成'
      return
    }

    // 👇 你的正常流式逻辑（msg.markdown += chunk）
    msg.value.markdown += fullStreamText[index]

    // 👇 加这一行，挂载 Vega 图表
    nextTick(() => mountVegaCharts(barMap, containerRef.value))

    index++
    streamTimer = setTimeout(push, 600)
  }
  push()
}

function doReset() {
  clearTimeout(streamTimer)
  msg.value.markdown = ''
  isStreaming.value = false
  error.value = ''
  log.value = ''
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #1a1a2e;
  color: #e0e0e0;
  min-height: 100vh;
}
.chat-page { max-width: 900px; margin: 0 auto; padding: 24px; }
h1 { text-align: center; font-size: 22px; margin-bottom: 20px; color: #fff; }

.chat-window {
  background: #16213e;
  border: 1px solid #0f3460;
  border-radius: 12px;
  padding: 24px;
  min-height: 300px;
  margin-bottom: 12px;
  display: flex;
  gap: 4px;
}

.message-content { flex: 1; line-height: 1.8; }
.placeholder { color: #666; text-align: center; padding: 60px 0; font-size: 15px; }

.message-content :deep(h2) { color: #e94560; margin: 16px 0 8px; font-size: 18px; }
.message-content :deep(h3) { color: #f0a500; margin: 12px 0 6px; font-size: 16px; }
.message-content :deep(p) { margin: 6px 0; }
.message-content :deep(strong) { color: #fff; }
.message-content :deep(blockquote) {
  border-left: 3px solid #e94560;
  padding-left: 12px;
  margin: 12px 0;
  color: #aaa;
  font-style: italic;
}
.message-content :deep(.vega-chart-container) {
  margin: 20px 0;
  display: flex;
  justify-content: center;
}

.cursor { color: #e94560; animation: blink 0.8s infinite; font-size: 18px; line-height: 1.8; }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

.status {
  padding: 10px 16px; border-radius: 8px; margin-bottom: 12px;
  font-size: 14px; background: #3d1a1a; color: #e94560; border: 1px solid #e94560;
}
.status.ok { background: #1a2e1a; color: #4ecca3; border-color: #4ecca3; }

.controls { display: flex; gap: 12px; margin-bottom: 20px; }
button {
  padding: 10px 24px; border: none; border-radius: 8px;
  cursor: pointer; font-size: 15px; background: #e94560; color: #fff;
  transition: opacity 0.2s;
}
button:disabled { opacity: 0.4; cursor: not-allowed; }
button:last-child { background: #0f3460; }

.legend {
  background: #16213e; border: 1px solid #0f3460;
  border-radius: 8px; padding: 16px 20px; font-size: 14px;
}
.legend p { margin-bottom: 8px; color: #aaa; }
.legend ul { list-style: none; padding: 0; }
.legend li { padding: 4px 0; }
.legend code {
  background: #0f3460; padding: 2px 8px; border-radius: 4px; color: #f0a500; font-size: 13px;
}
</style>
