// ============================================================
// vegaChartHelper — 纯函数，零侵入处理流式 markdown 中的图表
// ============================================================
// 用法：
//   import { processVegaCharts, mountVegaCharts } from './vegaChartHelper'
//
//   const barMap = { barOne: {...vegaSpec}, barTwo: {...vegaSpec} }
//
//   // 流式收到 chunk 时（你的正常逻辑里）：
//   msg.markdown += res.data
//   msg.markdown = processVegaCharts(barMap, msg.markdown)
//
//   // DOM 更新后：
//   nextTick(() => mountVegaCharts(barMap, containerEl))
// ============================================================

import vegaEmbed from 'vega-embed'

/**
 * 处理 markdown 中的 <bar> 图表标签 → 替换为图表容器 div
 * - 完整标签：替换为容器 div，后续 mountVegaCharts 会渲染
 * - 不完整标签（流式还没传输完）：原样保留，下次再试
 *
 * @param {Object} barMap  - { chartId: vegaSpec, ... }
 * @param {string} markdown - 累积的 markdown 文本
 * @returns {string} 处理后的 markdown
 */
export function processVegaCharts(barMap, markdown) {
  const barRegex = /<bar>\s*<div\s+id=['"]([^'"]+)['"]><\/div>\s*<\/bar>/gi

  return markdown.replace(barRegex, (match, id) => {
    if (!barMap[id]) {
      return `<div style="color:#e94560;padding:12px;">⚠️ 图表 "${id}" 未注册</div>`
    }
    return `<div class="vega-chart-container" data-chart-id="${id}"></div>`
  })
}

/**
 * 在容器内挂载所有未渲染的 Vega 图表（已挂载的跳过）
 * 调用时机：nextTick 后，确保 DOM 已更新
 *
 * @param {Object}   barMap      - { chartId: vegaSpec, ... }
 * @param {Element}  containerEl - 包含 v-html 的父元素
 */
export async function mountVegaCharts(barMap, containerEl) {
  if (!containerEl) return

  const containers = containerEl.querySelectorAll(
    '.vega-chart-container:not([data-mounted])'
  )

  for (const el of containers) {
    const id = el.getAttribute('data-chart-id')
    const spec = barMap[id]
    if (!spec) continue

    el.setAttribute('data-mounted', 'true')

    try {
      await vegaEmbed(el, spec, { actions: false })
    } catch (err) {
      el.innerHTML = `<p style="color:#e94560">[图表渲染失败: ${err.message}]</p>`
    }
  }
}
