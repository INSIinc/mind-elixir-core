/*
 * 该文件定义了心智图工具的摘要功能相关逻辑，包括摘要的创建、绘制、选择、编辑与删除等功能。
 * 
 * 使用场景：
 * 1. 心智图构建过程中，用户可以在多个节点间快速创建摘要，对多个节点的内容进行概括或归纳。
 * 2. 支持对摘要的动态编辑、样式调整以及删除操作，方便用户维护心智图的结构清晰和美观。
 * 
 * 设计考量：
 * - 提供了多种灵活的SVG元素绘制方法（路径、文本等），确保摘要在页面上的显示效果良好。
 * - 考虑到节点间的层级关系和方向性，通过算法动态计算节点的父子结构及位置，确保摘要的绘制与逻辑的准确性。
 * - 通过事件总线（bus.fire）与核心功能交互，记录摘要相关操作（如创建、编辑）以便支持撤销、重做等功能。
 * - 注重可扩展性，确保摘要功能的实现可以集成到心智图组件中，与其他功能模块无缝协作。
 */

import type { MindElixirInstance, Topic } from '.'
import { DirectionClass } from '.'
import { generateUUID, getOffsetLT, setAttributes } from './utils'
import { findEle } from './utils/dom'
import { editSvgText } from './utils/svg'

/**
 * Summary 类型定义
 * 用于表示摘要的核心属性信息
 */
export type Summary = {
  id: string  // 摘要的唯一标识符
  text: string  // 摘要文本内容
  parent: string  // 父节点的唯一标识符
  start: number  // 起始子节点索引
  end: number  // 结束子节点索引
}

/**
 * SummarySvgGroup 类型定义
 * 描述一个 SVG 组节点，包含路径和文本的组合
 */
export type SummarySvgGroup = SVGGElement & {
  children: [SVGPathElement, SVGTextElement]  // SVG 组所包含的路径和文本元素
  summaryObj: Summary  // 与该SVG组关联的摘要对象
}

/**
 * 计算选中节点的范围
 * @param nodes - 所有选中的节点
 * @returns 返回父节点ID以及计算后的起始和结束索引
 * @throws 如果未选中节点或选中根节点时抛出错误
 */
const calcRange = function (nodes: Topic[]) {
  if (nodes.length === 0) throw new Error('No selected node.') // 无选中节点时抛出错误
  if (nodes.length === 1) {
    const obj = nodes[0].nodeObj
    const parent = nodes[0].nodeObj.parent
    if (!parent) throw new Error('Can not select root node.') // 根节点无法作为操作对象
    const i = parent.children!.findIndex(child => obj === child) // 定位子节点的索引
    return {
      parent: parent.id,  // 父节点ID
      start: i,  // 子节点起始索引
      end: i,  // 子节点结束索引
    }
  }

  let maxLen = 0
  // 构建每个节点的父链数组
  const parentChains = nodes.map(item => {
    let node = item.nodeObj
    const parentChain = []
    while (node.parent) { // 遍历父节点直到根为止
      const parent = node.parent
      const siblings = parent.children
      const index = siblings?.indexOf(node) // 定位当前节点相对于兄弟节点的索引
      node = parent
      parentChain.unshift({ node, index }) // 将父节点及索引加入数组
    }
    if (parentChain.length > maxLen) maxLen = parentChain.length // 更新链长度最大值
    return parentChain
  })

  let index = 0
  // 查找公共父节点
  findMcp: for (; index < maxLen; index++) {
    const base = parentChains[0][index]?.node
    for (let i = 1; i < parentChains.length; i++) {
      const parentChain = parentChains[i]
      if (parentChain[index]?.node !== base) { // 如果父节点不同，则停止查找
        break findMcp
      }
    }
  }
  if (!index) throw new Error('Can not select root node.') // 如果没有找到公共父节点，抛出错误
  const range = parentChains.map(chain => chain[index - 1].index).sort() // 获取子节点的相对索引范围并排序
  const min = range[0] || 0
  const max = range[range.length - 1] || 0
  const parent = parentChains[0][index - 1].node
  if (!parent.parent) throw new Error('Please select nodes in the same main topic.') // 如果不是同一主要主题，抛出错误

  return {
    parent: parent.id,  // 父节点ID
    start: min,  // 范围起点索引
    end: max,  // 范围终点索引
  }
}

/**
 * 创建一个SVG的组元素
 * @param id - 组元素的唯一标识符
 * @returns 返回创建的SVG组对象
 */
const creatGroup = function (id: string) {
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SummarySvgGroup
  group.setAttribute('id', id) // 设置SVG组的ID属性
  return group
}

/**
 * 创建SVG路径对象
 * @param d - 路径的定义数据
 * @param color - 路径的颜色（可选）
 * @returns 返回创建的SVG路径对象
 */
const createPath = function (d: string, color?: string) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  setAttributes(path, {
    d,
    stroke: color || '#666', // 设置路径的描边颜色
    fill: 'none', // 填充为空
    'stroke-linecap': 'round', // 线段端点样式
    'stroke-width': '2', // 描边宽度
  })
  return path
}

/**
 * 创建SVG文本对象
 * @param string - 文本内容
 * @param x - x轴坐标
 * @param y - y轴坐标
 * @param anchor - 文本的对齐锚点
 * @param color - 文本颜色（可选）
 * @returns 返回创建的SVG文本对象
 */
const createText = function (string: string, x: number, y: number, anchor: 'start' | 'end', color?: string) {
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  setAttributes(text, {
    'text-anchor': anchor, // 设置文本对齐方式
    x: x + '', // x轴坐标转换为字符串
    y: y + '', // y轴坐标转换为字符串
    fill: color || '#666', // 设置文本颜色
  })
  text.innerHTML = string // 设置文本内容
  return text
}

/**
 * 获取节点的父元素包装器
 * @param id - 子节点ID
 * @returns 返回子节点的父元素
 */
const getWrapper = (id: string) => findEle(id).parentElement.parentElement

/**
 * 获取摘要的方向
 * @param summary - 摘要对象
 * @returns 返回生成摘要的方向类名
 */
const getDirection = function ({ parent, start }: Summary) {
  const parentEl = findEle(parent) // 查找父元素
  const parentObj = parentEl.nodeObj // 获取父元素的节点数据
  let side: DirectionClass
  if (parentObj.parent) {
    side = parentEl.closest('me-main')!.className as DirectionClass // 获取当前父项的方向类名
  } else {
    side = findEle(parentObj.children![start].id).closest('me-main')!.className as DirectionClass // 根节点时从子节点方向获取
  }
  return side
}

/**
 * 绘制摘要
 * @param mei - MindElixirInstance 实例
 * @param summary - 摘要对象
 * @returns 返回绘制的摘要组对象，若失败则返回null
 */
const drawSummary = function (mei: MindElixirInstance, summary: Summary) {
  const { id, text: summaryText, parent, start, end } = summary
  const container = mei.nodes
  const parentEl = findEle(parent)
  const parentObj = parentEl.nodeObj
  const side = getDirection(summary)
  let left = Infinity
  let right = 0
  let startTop = 0
  let endBottom = 0
  for (let i = start; i <= end; i++) {
    const child = parentObj.children?.[i]
    if (!child) {
      console.warn('Child not found')
      mei.removeSummary(id) // 如果找不到子节点，移除摘要
      return null
    }
    const wrapper = getWrapper(child.id) // 获取子节点包装器
    const { offsetLeft, offsetTop } = getOffsetLT(container, wrapper) // 计算偏移量
    const offset = start === end ? 10 : 20 // 设置摘要的边距偏移
    if (i === start) startTop = offsetTop + offset
    if (i === end) endBottom = offsetTop + wrapper.offsetHeight - offset
    if (offsetLeft < left) left = offsetLeft
    if (wrapper.offsetWidth + offsetLeft > right) right = wrapper.offsetWidth + offsetLeft
  }

  let path
  let text
  const top = startTop + 10
  const bottom = endBottom + 10
  const md = (top + bottom) / 2 // 计算范围的垂直中点
  const color = mei.theme.cssVar['--color'] // 主题颜色
  if (side === DirectionClass.LHS) { // 左侧时的路径与文本
    path = createPath(`M ${left + 10} ${top} c -5 0 -10 5 -10 10 L ${left} ${bottom - 10} c 0 5 5 10 10 10 M ${left} ${md} h -10`, color)
    text = createText(summaryText, left - 20, md + 6, 'end', color)
  } else { // 右侧时的路径与文本
    path = createPath(`M ${right - 10} ${top} c 5 0 10 5 10 10 L ${right} ${bottom - 10} c 0 5 -5 10 -10 10 M ${right} ${md} h 10`, color)
    text = createText(summaryText, right + 20, md + 6, 'start', color)
  }

  const group = creatGroup('s-' + id) // 创建组对象
  group.appendChild(path)
  group.appendChild(text)
  group.summaryObj = summary
  mei.summarySvg.appendChild(group) // 将组添加到SVG容器中
  return group
}

/**
 * 创建一个概要（或总结）的方法，为特定主题节点生成概要。
 * @function createSummary
 * @description 核心功能是为选中的节点创建一个总结，生成可视化的概要图形，并触发相应的事件。
 * @param none
 * @returns void 不返回任何内容，通过操作实例状态来更新概要。
 */
export const createSummary = function (this: MindElixirInstance) {
  let nodes: Topic[] = []
  // 判断当前节点或节点组，并获取相应的节点集合
  if (this.currentNode) {
    nodes = [this.currentNode] // 单个节点情况
  } else if (this.currentNodes) {
    nodes = this.currentNodes // 多个节点情况
  }

  // 使用 calcRange 计算选中范围的节点的父级、起点和终点
  const { parent, start, end } = calcRange(nodes)
  const summary = {
    id: generateUUID(), // 使用UUID生成唯一标识符
    parent,
    start,
    end,
    text: 'summary' // 默认文本内容为 "summary"
  }
  const g = drawSummary(this, summary) as SummarySvgGroup
  this.summaries.push(summary) // 将新创建的总结对象加入实例的总结列表
  this.editSummary(g) // 进入编辑状态
  this.bus.fire('operation', {
    name: 'createSummary', // 触发事件，标明此操作为创建总结
    obj: summary,
  })
}

/**
 * 删除指定的概要。
 * @function removeSummary
 * @description 根据提供的ID删除对应的概要，并更新视图。
 * @param {string} id - 要删除的概要的唯一标识符。
 * @returns void 不返回任何内容，通过操作实例状态来删除概要。
 */
export const removeSummary = function (this: MindElixirInstance, id: string) {
  // 查找匹配的概要索引
  const index = this.summaries.findIndex(summary => summary.id === id)
  if (index > -1) { // 如果找到概要，移除它
    this.summaries.splice(index, 1) // 从数组删除目标概要
    document.querySelector('#s-' + id)?.remove() // 移除对应的SVG图形
  }
  // 触发删除操作的事件
  this.bus.fire('operation', {
    name: 'removeSummary', // 事件名称
    obj: { id }, // 删除概要事件携带目标ID
  })
}

/**
 * 选中某个概要。
 * @function selectSummary
 * @description 为提供的概要元素绘制选中样式并将其设置为当前概要。
 * @param {SummarySvgGroup} el - SVG类型的概要元素。
 * @returns void 不返回任何内容，通过操作实例状态更新当前选择。
 */
export const selectSummary = function (this: MindElixirInstance, el: SummarySvgGroup) {
  // 获取目标概要的边界盒
  const box = el.children[1].getBBox()
  const padding = 6 // 外边距
  const radius = 3 // 圆角半径

  // 创建矩形边框来高亮显示概要
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  setAttributes(rect, {
    x: box.x - padding + '',
    y: box.y - padding + '',
    width: box.width + padding * 2 + '',
    height: box.height + padding * 2 + '',
    rx: radius + '', // 圆角配置
    stroke: this.theme.cssVar['--selected'] || '#4dc4ff', // 边框颜色
    'stroke-width': '2', // 边框宽度
    fill: 'none', // 背景透明
  })
  el.appendChild(rect) // 将选中矩形附加到概要上
  this.currentSummary = el // 将该概要设置为当前选中项
}

/**
 * 清除选中状态的概要。
 * @function unselectSummary
 * @description 移除概要的选中样式并重置当前选择。
 * @param none
 * @returns void 不返回任何内容，通过操作实例状态清除选择。
 */
export const unselectSummary = function (this: MindElixirInstance) {
  this.currentSummary?.querySelector('rect')?.remove() // 移除矩形选中框
  this.currentSummary = null // 重置当前选中概要
}

/**
 * 绘制所有概要。
 * @function renderSummary
 * @description 清空并重新渲染所有概要，确保视图同步更新。
 * @param none
 * @returns void 不返回任何内容，通过操作 SVG 图层实现更新。
 */
export const renderSummary = function (this: MindElixirInstance) {
  this.summarySvg.innerHTML = '' // 清空当前SVG内容
  this.summaries.forEach(summary => {
    try {
      drawSummary(this, summary) // 逐一调用绘制方法
    } catch (e) {
      // 捕获异常，可能由于节点未展开而无法绘制
      console.warn('Node may not be expanded')
    }
  })
  // 将绘制后的 SVG 总结插入至节点层
  this.nodes.insertAdjacentElement('beforeend', this.summarySvg)
}

/**
 * 编辑概要的核心功能，允许用户自定义概要文本。
 * @function editSummary
 * @description 进入编辑模式，为选中的概要提供文本修改功能。
 * @param {SummarySvgGroup} el - 要编辑的SVG概要对象。
 * @returns void 不返回任何内容，通过操作更新概要的文本。
 */
export const editSummary = function (this: MindElixirInstance, el: SummarySvgGroup) {
  console.time('editSummary') // 记录操作耗时
  if (!el) return
  const textEl = el.childNodes[1] as SVGTextElement // 定位 SVG 文本节点
  editSvgText(this, textEl, div => {
    const node = el.summaryObj // 获取概要的原始对象
    const text = div.textContent?.trim() || '' // 获取用户输入并去除多余空格
    if (text === '') node.text = origin // 如果为空，保持原始内容
    else node.text = text // 更新总结内容
    div.remove() // 移除编辑工具
    if (text === origin) return
    textEl.innerHTML = node.text // 更新 SVG 文本内容
    this.linkDiv() // 重新定位总结相关连线
    this.bus.fire('operation', {
      name: 'finishEditSummary', // 触发完成编辑的事件
      obj: node, // 事件携带当前概要节点
    })
  })
  console.timeEnd('editSummary') // 输出操作耗时
}