// ============================================================
// useVegaMarkdown — 流式 Markdown + Vega 图表渲染
// ============================================================
// 用法：
//   import { useVegaMarkdown } from './useVegaMarkdown'
//
//   const barMap = { barOne: {...vegaSpec}, barTwo: {...vegaSpec} }
//   const { renderedHtml, appendChunk, reset, isStreaming } = useVegaMarkdown(barMap)
//
//   流式收到 chunk 时调用 appendChunk(chunk)
//   模板用 <div v-html="renderedHtml"></div>
//
// 约定：服务端返回的 markdown 中，用 <bar><div id='xxx'></div></bar>
// 包裹需要渲染图表的位置，xxx 对应 barMap 中的 key
// ============================================================

import { ref, nextTick } from 'vue'
import { marked } from 'marked'
import vegaEmbed from 'vega-embed'

export function useVegaMarkdown(barMap = {}) {
  const renderedHtml = ref('')
  const isStreaming = ref(false)
  const containerRef = ref(null)
  let rawMarkdown = ''
  let renderLock = false

  // ---- 解析 <bar> 标签 ----
  function parseBarTags(text) {
    const barRegex = /<bar>\s*<div\s+id=['"]([^'"]+)['"]><\/div>\s*<\/bar>/gi
    const chartIds = []

    const cleaned = text.replace(barRegex, (match, id) => {
      chartIds.push(id)
      return `<div class="vega-chart-container" data-chart-id="${id}"></div>`
    })

    return { cleaned, chartIds }
  }

  // ---- 渲染 ----
  async function render() {
    if (renderLock) return
    renderLock = true

    try {
      const { cleaned, chartIds } = parseBarTags(rawMarkdown)

      // markdown -> HTML
      let html
      try {
        html = marked.parse(cleaned) || ''
      } catch {
        html = marked(cleaned) || ''
      }

      renderedHtml.value = html
      await nextTick()

      // 挂载 Vega 图表
      const root = containerRef.value
      if (!root) return

      for (const id of chartIds) {
        const container = root.querySelector(`[data-chart-id="${id}"]`)
        if (!container) continue

        const spec = barMap[id]
        if (!spec) {
          container.innerHTML = `<p style="color:#e94560">[图表 "${id}" 未注册]</p>`
          continue
        }

        try {
          await vegaEmbed(container, spec, { actions: false })
        } catch (err) {
          container.innerHTML = `<p style="color:#e94560">[图表渲染失败: ${err.message}]</p>`
        }
      }
    } finally {
      renderLock = false
    }
  }

  // ---- 追加流式文本 ----
  function appendChunk(chunk) {
    isStreaming.value = true
    rawMarkdown += chunk
    render()
  }

  // ---- 结束/重置 ----
  function flush() {
    isStreaming.value = false
  }

  function reset() {
    isStreaming.value = false
    rawMarkdown = ''
    renderedHtml.value = ''
  }

  return {
    // 模板绑定
    renderedHtml,
    containerRef, // 需要绑定到包含 v-html 的父元素上：<div ref="containerRef"><div v-html="renderedHtml"></div></div>
    isStreaming,

    // 操作方法
    appendChunk, // 每收到一个流式 chunk 就调一次
    flush,       // 流结束
    reset,       // 清空
  }
}
