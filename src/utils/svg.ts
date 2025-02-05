import { setAttributes } from '.'
import type { MindElixirInstance } from '../types'
import type { CustomSvg } from '../types/dom'
import { selectText } from './dom'

/*
  模块功能概述:
  本模块主要用于创建和操作SVG元素，包括路径、线条、组以及编辑SVG中的文本内容。
  使用场景:
  适用于需要动态生成和操作SVG图形，例如思维导图、图形编辑器等功能中。
*/

const $d = document
const svgNS = 'http://www.w3.org/2000/svg'

/**
 * 创建SVG路径元素
 * @param d - 表示路径的d属性，定义路径形状
 * @param color - 路径的颜色，默认为#666
 * @param width - 路径线条的宽度
 * @returns 创建好的SVG路径元素
 */
export const createPath = function (d: string, color: string, width: string) {
  const path = $d.createElementNS(svgNS, 'path') // 创建路径元素
  setAttributes(path, {
    d,
    stroke: color || '#666', // 默认颜色
    fill: 'none', // 路径内部无填充
    'stroke-width': width, // 线条宽度
  })
  return path
}

/**
 * 创建带类名的SVG容器元素
 * @param klass - SVG元素的类名，用于样式定义
 * @returns 创建好的SVG容器元素
 */
export const createLinkSvg = function (klass: string) {
  const svg = $d.createElementNS(svgNS, 'svg') // 创建SVG元素
  svg.setAttribute('class', klass) // 设置类名
  svg.setAttribute('overflow', 'visible') // 设置溢出可见，避免裁剪
  return svg
}

/**
 * 创建默认样式的SVG线条
 * @returns 创建好的SVG线条元素
 */
export const createLine = function () {
  const line = $d.createElementNS(svgNS, 'line') // 创建线条元素
  line.setAttribute('stroke', '#bbb') // 设置线条颜色
  line.setAttribute('fill', 'none') // 无填充
  line.setAttribute('stroke-width', '2') // 设置线条宽度
  return line
}

/**
 * 创建SVG组，包含路径和箭头
 * @param d - 路径的d属性，定义路径形状
 * @param arrowd - 箭头的d属性，定义箭头形状
 * @returns 包含路径和箭头的SVG组元素
 */
export const createSvgGroup = function (d: string, arrowd: string): CustomSvg {
  const pathAttrs = {
    stroke: 'rgb(235, 95, 82)', // 路径颜色
    fill: 'none', // 无填充
    'stroke-linecap': 'cap', // 端点样式
    'stroke-width': '2', // 线条宽度
  }
  const g = $d.createElementNS(svgNS, 'g') as CustomSvg // 创建SVG组
  const path = $d.createElementNS(svgNS, 'path') // 创建路径元素
  const arrow = $d.createElementNS(svgNS, 'path') // 创建箭头路径

  setAttributes(arrow, {
    d: arrowd, // 设置箭头路径
    ...pathAttrs,
  })
  setAttributes(path, {
    d, // 设置路径
    ...pathAttrs,
    'stroke-dasharray': '8,2', // 定义虚线样式
  })

  g.appendChild(path) // 将路径加入组
  g.appendChild(arrow) // 将箭头加入组
  return g
}

/**
 * 编辑SVG文本的工具函数
 * @param mei - MindElixir实例，用于操作SVG节点
 * @param textEl - 要编辑的SVG文本元素
 * @param onblur - 当失去焦点时触发的回调函数，接收编辑后的div元素
 */
export const editSvgText = function (mei: MindElixirInstance, textEl: SVGTextElement, onblur: (div: HTMLDivElement) => void) {
  console.time('editSummary') // 性能跟踪
  if (!textEl) return
  const div = document.createElement('div') // 创建用于编辑的div元素
  mei.nodes.appendChild(div) // 将编辑框挂载到MindElixir节点
  const origin = textEl.innerHTML // 获取原始文本内容
  div.id = 'input-box' // 设置编辑框ID
  div.textContent = origin // 将原始内容填充到编辑框
  div.contentEditable = 'true' // 设置编辑框为可编辑
  div.spellcheck = false // 禁用拼写检查
  const bbox = textEl.getBBox() // 获取文本元素的边界框
  console.log(bbox)
  div.style.cssText = `
    min-width:${Math.max(88, bbox.width)}px; // 最小宽度不低于88px
    position:absolute; // 绝对定位
    left:${bbox.x}px; // 水平位置
    top:${bbox.y}px; // 垂直位置
    padding: 2px 4px; // 内边距
    margin: -2px -4px; // 外边距修正
  `
  div.focus() // 聚焦到编辑框

  selectText(div) // 自动选中文本

  // 监听键盘事件，用于处理回车和Tab键提交
  div.addEventListener('keydown', e => {
    e.stopPropagation() // 防止事件冒泡
    const key = e.key

    if (key === 'Enter' || key === 'Tab') {
      if (e.shiftKey) return // Shift + 回车保留换行

      e.preventDefault() // 阻止默认行为
      div.blur() // 失去焦点
      mei.map.focus() // 聚焦到思维导图
    }
  })

  // 监听失去焦点事件，触发回调函数
  div.addEventListener('blur', () => {
    if (!div) return
    onblur(div) // 提交操作
  })
  console.timeEnd('editSummary') // 性能跟踪结束
}