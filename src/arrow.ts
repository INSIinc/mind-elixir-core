/**
 * 该模块用于处理思维导图中的箭头连接功能，定义了一系列函数和类型以支持箭头的创建、删除、选择、渲染和编辑工作。
 *
 * 使用场景：
 * 1. 在思维导图中标识节点之间的关系，通过箭头连接各个节点。
 * 2. 支持自定义箭头路径，便于用户自定义连接方式。
 * 3. 为用户提供编辑箭头标签、调整控制点位置等交互体验。
 *
 * 设计考量：
 * 1. **灵活性**：使用`Arrow`和`DivData`类型定义箭头的核心属性及计算所需的数据结构，为功能扩展和维护提供可扩展性。
 * 2. **性能优化**：通过性能计时和条件判断，避免多余计算，提升渲染性能。
 * 3. **模块化设计**：划分功能到多个函数（如`calcCtrlP`、`calcP`等），便于逻辑拆分和代码复用。
 * 4. **SVG 绘制**：借助 SVG 元素绘制箭头路径，实现灵活精美的动态连接效果。
 * 5. **交互增强**：实现拖拽控制点功能，便于用户动态调整箭头形状，同时支持箭头标签的编辑。

 */
import { generateUUID, getArrowPoints, getObjById, getOffsetLT, setAttributes } from './utils/index'
import LinkDragMoveHelper from './utils/LinkDragMoveHelper'
import { findEle } from './utils/dom'
import { createSvgGroup, editSvgText } from './utils/svg'
import type { CustomSvg, Topic } from './types/dom'
import type { MindElixirInstance, Uid } from './index'

// p1: 起点
// p2: 起点的控制点
// p3: 终点的控制点
// p4: 终点

/**
 * 定义箭头对象的类型
 * 表示思维导图中两节点之间的连线箭头
 */
export type Arrow = {
  id: string // 箭头唯一标识符
  label: string // 箭头的标签内容
  from: Uid // 箭头起始节点的唯一标识
  to: Uid // 箭头结束节点的唯一标识
  delta1: { // 起始节点的控制点相对偏移
    x: number // x轴方向的偏移量
    y: number // y轴方向的偏移量
  }
  delta2: { // 结束节点的控制点相对偏移
    x: number // x轴方向的偏移量
    y: number // y轴方向的偏移量
  }
}

/**
 * 定义节点数据类型
 * 表示一个HTML节点的位置与尺寸数据
 */
export type DivData = {
  cx: number // 节点中心点的x坐标
  cy: number // 节点中心点的y坐标
  w: number // 节点的宽度
  h: number // 节点的高度
  ctrlX: number // 控制点的x坐标
  ctrlY: number // 控制点的y坐标
}

/**
 * 计算控制点坐标，描述了节点及其控制点的几何属性
 * @param mei 思维导图实例
 * @param tpc 节点对象
 * @param delta 偏移量，用于生成控制点位置
 * @returns 包含节点位置信息和控制点坐标的对象
 */
function calcCtrlP(mei: MindElixirInstance, tpc: Topic, delta: { x: number; y: number }) {
  // 获取节点的左上角坐标偏移
  const { offsetLeft: x, offsetTop: y } = getOffsetLT(mei.nodes, tpc)
  const w = tpc.offsetWidth // 节点宽度
  const h = tpc.offsetHeight // 节点高度
  const cx = x + w / 2 // 计算节点中心点的x坐标
  const cy = y + h / 2 // 计算节点中心点的y坐标
  const ctrlX = cx + delta.x // 控制点的x坐标 = 中心点x + 偏移量
  const ctrlY = cy + delta.y // 控制点的y坐标 = 中心点y + 偏移量

  return {
    w,
    h,
    cx,
    cy,
    ctrlX,
    ctrlY,
  }
}

/**
 * 根据节点控制点和中心点计算箭头的起点或终点
 * @param data 节点几何信息数据
 * @returns 起点或终点的坐标
 */
function calcP(data: DivData) {
  let x, y
  // 计算从控制点到中心点的斜率k
  const k = (data.cy - data.ctrlY) / (data.ctrlX - data.cx)

  // 根据斜率确定横向或纵向是否超出节点的宽高比例，并计算最终的x, y坐标
  if (k > data.h / data.w || k < -data.h / data.w) {
    if (data.cy - data.ctrlY < 0) {
      x = data.cx - data.h / 2 / k // 算出靠顶部的x坐标
      y = data.cy + data.h / 2 // y坐标取底部
    } else {
      x = data.cx + data.h / 2 / k // 算出靠底部的x坐标
      y = data.cy - data.h / 2 // y坐标取顶部
    }
  } else {
    if (data.cx - data.ctrlX < 0) {
      x = data.cx + data.w / 2 // x坐标取右侧
      y = data.cy - (data.w * k) / 2
    } else {
      x = data.cx - data.w / 2 // x坐标取左侧
      y = data.cy + (data.w * k) / 2
    }
  }
  return {
    x,
    y,
  }
}

/**
 * 创建SVG文本元素
 * @param string 文本内容
 * @param x 文本的x坐标
 * @param y 文本的y坐标
 * @param color 文本颜色，默认为灰色
 * @returns SVG文本元素
 */
const createText = function (string: string, x: number, y: number, color?: string) {
  // 创建一个SVG文本元素
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  // 设置属性（包括对齐方式、位置和颜色等）
  setAttributes(text, {
    'text-anchor': 'middle',
    x: x + '',
    y: y + '',
    fill: color || '#666', // 默认颜色设置为灰色
  })
  text.dataset.type = 'custom-link' // 设置自定义数据类型
  text.innerHTML = string // 填充文本内容
  return text
}

/**
 * 绘制箭头并连接两个节点
 * @param mei 思维导图实例
 * @param from 起始节点
 * @param to 结束节点
 * @param obj 箭头对象
 * @param isInitPaint 是否为初始化绘制
 */
const drawArrow = function (mei: MindElixirInstance, from: Topic, to: Topic, obj: Arrow, isInitPaint?: boolean) {
  if (!from || !to) {
    return // 如果任一节点未展开，则直接返回
  }
  const start = performance.now() // 开始测量时间

  // 计算起始节点和结束节点的控制点数据
  const fromData = calcCtrlP(mei, from, obj.delta1)
  const toData = calcCtrlP(mei, to, obj.delta2)

  // 分别计算起点、控制点和终点的具体坐标
  const { x: p1x, y: p1y } = calcP(fromData)
  const { ctrlX: p2x, ctrlY: p2y } = fromData
  const { ctrlX: p3x, ctrlY: p3y } = toData
  const { x: p4x, y: p4y } = calcP(toData)

  // 获取箭头顶部的两个边缘点，用于绘制箭头头部
  const arrowPoint = getArrowPoints(p3x, p3y, p4x, p4y)

  // 使用贝塞尔曲线绘制箭头线条路径和箭头头部的三角形
  const newSvgGroup = createSvgGroup(
    `M ${p1x} ${p1y} C ${p2x} ${p2y} ${p3x} ${p3y} ${p4x} ${p4y}`,
    `M ${arrowPoint.x1} ${arrowPoint.y1} L ${p4x} ${p4y} L ${arrowPoint.x2} ${arrowPoint.y2}`
  )

  // 计算标签的中心点坐标（四点加权平均法）
  const halfx = p1x / 8 + (p2x * 3) / 8 + (p3x * 3) / 8 + p4x / 8
  const halfy = p1y / 8 + (p2y * 3) / 8 + (p3y * 3) / 8 + p4y / 8
  const label = createText(obj.label, halfx, halfy, mei.theme.cssVar['--color'])
  // 在SVG组中添加标签
  newSvgGroup.appendChild(label)

  // 设置箭头对象数据和关联信息
  newSvgGroup.arrowObj = obj
  newSvgGroup.dataset.linkid = obj.id
  mei.linkSvgGroup.appendChild(newSvgGroup)

  if (!isInitPaint) {
    // 如果不是初始化绘制，则添加到箭头数组并设置当前箭头为新绘制的箭头
    mei.arrows.push(obj)
    mei.currentArrow = newSvgGroup
    // 显示箭头的控制器矩阵
    showLinkController(mei, obj, fromData, toData)
  }

  const end = performance.now() // 结束测量时间
  console.log(`DrawArrow Execution time: ${end - start} ms`) // 输出绘制时间
}

/**
 * 创建一个连接两个节点的箭头
 * @param this 当前的思维导图实例
 * @param from 起始节点
 * @param to 结束节点
 */
export const createArrow = function (this: MindElixirInstance, from: Topic, to: Topic) {
  // 初始化箭头对象
  const arrowObj = {
    id: generateUUID(), // 生成箭头唯一ID
    label: 'Custom Link', // 默认箭头标签
    from: from.nodeObj.id, // 起始节点的标识
    to: to.nodeObj.id, // 结束节点的标识
    delta1: {
      x: 0,
      y: -200, // 起始节点控制点的默认偏移
    },
    delta2: {
      x: 0,
      y: -200, // 结束节点控制点的默认偏移
    },
  }
  // 调用绘制箭头的函数
  drawArrow(this, from, to, arrowObj)

  // 触发自定义操作事件
  this.bus.fire('operation', {
    name: 'createArrow',
    obj: arrowObj,
  })
}
/**
 * 移除指定的箭头链接。
 * @param {CustomSvg} linkSvg - 可选，指向要移除的链接的SVG对象。
 * 如果未传入此参数，则默认使用当前选中的箭头链接。
 * 
 * 功能详细描述：
 * - 隐藏链接控制器。
 * - 在箭头集 `arrows` 中过滤掉该箭头对象。
 * - 从DOM中移除对应的SVG元素。
 * - 触发一个箭头移除的操作事件。
 */
export const removeArrow = function (this: MindElixirInstance, linkSvg?: CustomSvg) {

  let link
  if (linkSvg) {
    link = linkSvg
  } else {
    link = this.currentArrow
  }
  if (!link) return
  // 隐藏链接控制器，使界面不显示箭头的操作点
  hideLinkController(this)
  // 获取箭头的唯一标识符
  const id = link.arrowObj!.id
  // 从箭头数组中移除该箭头
  this.arrows = this.arrows.filter(arrow => arrow.id !== id)
  // 从DOM中移除该箭头的节点
  link.remove()
  // 触发事件总线通知其他模块箭头已移除
  this.bus.fire('operation', {
    name: 'removeArrow',
    obj: {
      id,
    },
  })
}
/**
 * 选中指定的箭头链接，并显示其控制器。
 * @param {CustomSvg} link - 要选中的箭头链接对象。
 * 
 * 功能详细描述：
 * - 将指定箭头设置为当前选中状态。
 * - 使用箭头的控制点数据，计算控制器的位置并显示。
 */
export const selectArrow = function (this: MindElixirInstance, link: CustomSvg) {

  this.currentArrow = link
  const obj = link.arrowObj

  // 获取箭头起点和终点关联的DOM元素
  const from = findEle(obj.from)
  const to = findEle(obj.to)

  // 计算控制点数据，用于显示控制器
  const fromData = calcCtrlP(this, from, obj.delta1)
  const toData = calcCtrlP(this, to, obj.delta2)

  // 显示控制器并设置控制点位置
  showLinkController(this, obj, fromData, toData)
}
/**
  * 取消当前箭头的选中状态，并隐藏其控制器。
  * 
  * - 将当前选中的箭头设置为 `null`。
  * - 隐藏链接控制器。
  */
export const unselectArrow = function (this: MindElixirInstance) {

  this.currentArrow = null
  hideLinkController(this)
}
/**
 * 隐藏链接的控制器及其UI元素。
 * @param {MindElixirInstance} mei - MindElixir实例对象。
 * 
 * 功能详细描述：
 * - 将链接控制器组件及相关点的样式设置为隐藏，从视觉上取消操作点的可见性。
 */
const hideLinkController = function (mei: MindElixirInstance) {

  mei.linkController.style.display = 'none'
  mei.P2.style.display = 'none'
  mei.P3.style.display = 'none'
}
/**
 * 显示链接控制器并更新控制点的位置。
 * @param {MindElixirInstance} mei - MindElixir实例对象。
 * @param {Arrow} linkItem - 当前选定箭头的对象。
 * @param {DivData} fromData - 起点的控制点数据。
 * @param {DivData} toData - 终点的控制点数据。
 * 
 * 功能详细描述：
 * - 初始化并显示控制器UI。
 * - 根据控制点的位置调整箭头的曲线路径。
 * - 绑定控制点的拖动事件以实时调整箭头的形状。
 */
const showLinkController = function (mei: MindElixirInstance, linkItem: Arrow, fromData: DivData, toData: DivData) {


  mei.linkController.style.display = 'initial'
  mei.P2.style.display = 'initial'
  mei.P3.style.display = 'initial'
  mei.nodes.appendChild(mei.linkController)
  mei.nodes.appendChild(mei.P2)
  mei.nodes.appendChild(mei.P3)

  // 初始化控制点的坐标位置，用于显示和后续的拖拽操作
  let { x: p1x, y: p1y } = calcP(fromData)
  let { ctrlX: p2x, ctrlY: p2y } = fromData
  let { ctrlX: p3x, ctrlY: p3y } = toData
  let { x: p4x, y: p4y } = calcP(toData)

  mei.P2.style.cssText = `top:${p2y}px;left:${p2x}px;`
  mei.P3.style.cssText = `top:${p3y}px;left:${p3x}px;`

  // 设置控制点到控制器的线条属性（路径起始和结束的坐标）
  setAttributes(mei.line1, {
    x1: p1x + '',
    y1: p1y + '',
    x2: p2x + '',
    y2: p2y + '',
  })
  setAttributes(mei.line2, {
    x1: p3x + '',
    y1: p3y + '',
    x2: p4x + '',
    y2: p4y + '',
  })

  // 如果已有拖拽帮助类，先销毁
  if (mei.helper1) {
    mei.helper1.destory(mei.map)
    mei.helper2?.destory(mei.map)
  }

  // 创建控制点的拖拽帮助对象
  mei.helper1 = LinkDragMoveHelper.create(mei.P2)
  mei.helper2 = LinkDragMoveHelper.create(mei.P3)

  // 绑定拖拽事件：调整箭头的起点控制
  mei.helper1.init(mei.map, (deltaX, deltaY) => {
    p2x = p2x + deltaX / mei.scaleVal
    p2y = p2y + deltaY / mei.scaleVal
    const p1 = calcP({ ...fromData, ctrlX: p2x, ctrlY: p2y })
    p1x = p1.x
    p1y = p1.y
    const halfx = p1x / 8 + (p2x * 3) / 8 + (p3x * 3) / 8 + p4x / 8
    const halfy = p1y / 8 + (p2y * 3) / 8 + (p3y * 3) / 8 + p4y / 8

    mei.P2.style.top = p2y + 'px'
    mei.P2.style.left = p2x + 'px'
    mei.currentArrow?.children[0].setAttribute('d', `M ${p1x} ${p1y} C ${p2x} ${p2y} ${p3x} ${p3y} ${p4x} ${p4y}`)
    setAttributes(mei.currentArrow!.children[2], {
      x: halfx + '',
      y: halfy + '',
    })
    setAttributes(mei.line1, {
      x1: p1x + '',
      y1: p1y + '',
      x2: p2x + '',
      y2: p2y + '',
    })

    // 更新箭头节点对应的控制点偏移量
    linkItem.delta1.x = p2x - fromData.cx
    linkItem.delta1.y = p2y - fromData.cy
  })

  // 绑定拖拽事件：调整箭头的终点控制
  mei.helper2.init(mei.map, (deltaX, deltaY) => {
    p3x = p3x + deltaX / mei.scaleVal
    p3y = p3y + deltaY / mei.scaleVal
    const p4 = calcP({ ...toData, ctrlX: p3x, ctrlY: p3y })
    p4x = p4.x
    p4y = p4.y
    const halfx = p1x / 8 + (p2x * 3) / 8 + (p3x * 3) / 8 + p4x / 8
    const halfy = p1y / 8 + (p2y * 3) / 8 + (p3y * 3) / 8 + p4y / 8
    const arrowPoint = getArrowPoints(p3x, p3y, p4x, p4y)

    mei.P3.style.top = p3y + 'px'
    mei.P3.style.left = p3x + 'px'
    mei.currentArrow?.children[0].setAttribute('d', `M ${p1x} ${p1y} C ${p2x} ${p2y} ${p3x} ${p3y} ${p4x} ${p4y}`)
    mei.currentArrow?.children[1].setAttribute('d', `M ${arrowPoint.x1} ${arrowPoint.y1} L ${p4x} ${p4y} L ${arrowPoint.x2} ${arrowPoint.y2}`)
    setAttributes(mei.currentArrow!.children[2], {
      x: halfx + '',
      y: halfy + '',
    })
    setAttributes(mei.line2, {
      x1: p3x + '',
      y1: p3y + '',
      x2: p4x + '',
      y2: p4y + '',
    })
    linkItem.delta2.x = p3x - toData.cx
    linkItem.delta2.y = p3y - toData.cy
  })
}
/**
 * 渲染MindElixir实例中的所有箭头。
 * 
 * - 清空`linkSvgGroup`内的内容。
 * - 遍历箭头数组，逐一调用 `drawArrow` 方法进行绘制。
 * - 在节点树中追加绘制好的箭头组。
 */
export function renderArrow(this: MindElixirInstance) {

  this.linkSvgGroup.innerHTML = ''
  for (let i = 0; i < this.arrows.length; i++) {
    const link = this.arrows[i]
    try {
      // 绘制单个箭头链接
      drawArrow(this, findEle(link.from), findEle(link.to), link, true)
    } catch (e) {
      console.warn('Node may not be expanded') // 如果节点未展开，绘制可能会失败
    }
  }
  this.nodes.appendChild(this.linkSvgGroup)
}

/**
 * 编辑箭头标签的功能函数
 * 该函数旨在编辑视觉化思维导图中箭头的文本标签部分，提供用户操作和更新支持。
 * @param this - MindElixir 实例对象
 * @param el - 自定义的 SVG 元素（CustomSvg），代表具体需要编辑的箭头元素
 */
export function editArrowLabel(this: MindElixirInstance, el: CustomSvg) {
  console.time('editSummary') // 开启计时器，用于记录标签编辑过程的耗时
  if (!el) return // 如果待编辑元素不存在，直接返回
  const textEl = el.children[2] // 获取第三个子元素，即箭头标签的文本元素

  // 调用辅助函数 editSvgText，传入当前实例和目标文本元素
  editSvgText(this, textEl, div => {
    const node = el.arrowObj // 获取当前箭头绑定的对象信息
    const text = div.textContent?.trim() || '' // 获取用户编辑后的文本内容，去除空白符。如果为空则设置为默认值

    if (text === '') {
      node.label = origin // 若用户输入为空，将标签复原为初始值
    } else {
      node.label = text // 否则更新箭头标签为用户的输入值
    }

    div.remove() // 移除编辑框元素

    if (text === origin) return // 若文本未变更，无需后续处理直接返回

    textEl.innerHTML = node.label // 更新实际 SVG 文本标签内容
    this.linkDiv() // 更新关联的 DOM 缓存
    this.bus.fire('operation', { // 触发事件通知系统已完成编辑操作
      name: 'finishEditArrowLabel',
      obj: node,
    })
  })
  console.timeEnd('editSummary') // 结束计时并打印耗时
}

/**
 * 整理箭头数据的功能函数
 * 该函数用于清理无效的箭头连线，确保数据和界面的同步一致。
 * @param this - MindElixir 实例对象
 */
export function tidyArrow(this: MindElixirInstance) {
  // 使用数组过滤器保留有效的箭头对象
  this.arrows = this.arrows.filter(arrow => {
    // 校验箭头的起点和终点是否在当前思维导图的节点数据中存在
    return getObjById(arrow.from, this.nodeData) && getObjById(arrow.to, this.nodeData)
  })
}