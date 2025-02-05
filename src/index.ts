/**
 * @fileoverview MindElixir 是一个用于生成和管理思维导图的类库。
 * @description 该模块提供了思维导图的基础设施、交互功能、数据生成和管理以及相关工具方法。
 * 使用场景包括：创建、编辑和动态更新思维导图。
 */

import './index.less'
import './iconfont/iconfont.js'
import { LEFT, RIGHT, SIDE, DARK_THEME, THEME } from './const'
import { generateUUID } from './utils/index'
import initMouseEvent from './mouse'
import Bus from './utils/pubsub'
import { findEle } from './utils/dom'
import { createLinkSvg, createLine } from './utils/svg'
import dragMoveHelper from './utils/dragMoveHelper'
// types
export * from './types/index'
export * from './types/dom'
import type { MindElixirData, MindElixirInstance, MindElixirMethods, Options } from './types/index'
import methods from './methods'
import { sub, main } from './utils/generateBranch'
// @ts-expect-error json file
import { version } from '../package.json'

// TODO show up animation
const $d = document

/**
 * @class MindElixir
 * @classdesc MindElixir 基于 HTML 和 SVG，提供了创建、渲染和交互式编辑思维导图的功能。
 */
function MindElixir(
  this: MindElixirInstance,
  {
    el,
    direction,
    locale,
    draggable,
    editable,
    contextMenu,
    contextMenuOption,
    toolBar,
    keypress,
    mouseSelectionButton,
    selectionContainer,
    before,
    newTopicName,
    allowUndo,
    generateMainBranch,
    generateSubBranch,
    overflowHidden,
    theme,
  }: Options
): void {
  let ele: HTMLElement | null = null
  const elType = Object.prototype.toString.call(el)
  if (elType === '[object HTMLDivElement]') {
    ele = el as HTMLElement
  } else if (elType === '[object String]') {
    ele = document.querySelector(el as string) as HTMLElement
  }
  if (!ele) throw new Error('MindElixir: el is not a valid element')

  ele.className += ' mind-elixir'
  ele.innerHTML = ''
  this.mindElixirBox = ele as HTMLElement
  this.disposable = [] // 存储需要销毁的资源。
  this.before = before || {}
  this.locale = locale || 'en'
  this.contextMenuOption = contextMenuOption
  this.contextMenu = contextMenu === undefined ? true : contextMenu
  this.toolBar = toolBar === undefined ? true : toolBar
  this.keypress = keypress === undefined ? true : keypress
  this.mouseSelectionButton = mouseSelectionButton || 0
  // focus 模式下的方向记录。在退出 focus 模式时重置为 null。
  this.direction = typeof direction === 'number' ? direction : 1
  this.draggable = draggable === undefined ? true : draggable
  this.newTopicName = newTopicName || 'new node'
  this.editable = editable === undefined ? true : editable
  this.allowUndo = allowUndo === undefined ? false : allowUndo
  // this.parentMap = {} // 处理大量节点时的优化。
  this.currentNode = null // 表示当前被选中的 <tpc/> 元素
  this.currentArrow = null // 表示当前被选中的 svg 连接线元素
  this.scaleVal = 1 // 当前缩放比例。
  this.tempDirection = null // 暂存的方向值。
  this.generateMainBranch = generateMainBranch || main
  this.generateSubBranch = generateSubBranch || sub
  this.overflowHidden = overflowHidden || false

  this.bus = Bus.create() // 初始化发布-订阅事件总线。

  this.container = $d.createElement('div') // 思维导图的容器。
  this.selectionContainer = selectionContainer || this.container

  this.container.className = 'map-container'

  // 根据用户的系统主题自动切换默认主题。
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  this.theme = theme || (mediaQuery.matches ? DARK_THEME : THEME)

  // 初始化基础结构。
  const canvas = $d.createElement('div') // 画布元素
  canvas.className = 'map-canvas'
  this.map = canvas
  this.map.setAttribute('tabindex', '0') // 允许键盘聚焦
  this.container.appendChild(this.map)
  this.mindElixirBox.appendChild(this.container)

  this.nodes = $d.createElement('me-nodes')
  this.nodes.className = 'main-node-container'

  this.lines = createLinkSvg('lines') // 主干连接线容器。
  this.summarySvg = createLinkSvg('summary') // 汇总图形容器。

  this.linkController = createLinkSvg('linkcontroller') // 贝塞尔曲线控制器容器。
  this.P2 = $d.createElement('div') // 贝塞尔曲线控制点 P2。
  this.P3 = $d.createElement('div') // 贝塞尔曲线控制点 P3。
  this.P2.className = this.P3.className = 'circle'
  this.P2.style.display = this.P3.style.display = 'none'
  this.line1 = createLine() // 贝塞尔辅助线1
  this.line2 = createLine() // 贝塞尔辅助线2
  this.linkController.appendChild(this.line1)
  this.linkController.appendChild(this.line2)
  this.linkSvgGroup = createLinkSvg('topiclinks') // 用户自定义的连接线存储节点。

  this.map.appendChild(this.nodes)

  if (this.overflowHidden) {
    this.container.style.overflow = 'hidden'
  } else initMouseEvent(this) // 初始化鼠标交互事件。
}

// 将方法属性挂载到原型链。
MindElixir.prototype = methods

// 静态属性：方向枚举。
MindElixir.LEFT = LEFT
MindElixir.RIGHT = RIGHT
MindElixir.SIDE = SIDE

// 静态属性：主题枚举。
MindElixir.THEME = THEME
MindElixir.DARK_THEME = DARK_THEME

/**
 * @memberof MindElixir
 * @static
 */
MindElixir.version = version
/**
 * @function
 * @memberof MindElixir
 * @static
 * @name E
 * @param {string} id 节点 ID。
 * @return {TargetElement} 返回对应的目标元素。
 * @example
 * E('bd4313fbac40284b')
 */
MindElixir.E = findEle

/**
 * @function new
 * @memberof MindElixir
 * @static
 * @param {String} topic 根节点的主题文本。
 * @return {MindElixirData} 返回包含根节点数据的对象。
 */
if (import.meta.env.MODE !== 'lite') {
  MindElixir.new = (topic: string): MindElixirData => ({
    nodeData: {
      id: generateUUID(),
      topic: topic || 'new topic',
      children: [],
    },
  })
}

// 静态方法：拖拽移动的工具方法。
MindElixir.dragMoveHelper = dragMoveHelper

// 导出类的接口定义，用作类型检查或外部调用支持。
export interface MindElixirCtor {
  new(options: Options): MindElixirInstance
  E: typeof findEle
  new: typeof MindElixir.new
  version: string
  LEFT: typeof LEFT
  RIGHT: typeof RIGHT
  SIDE: typeof SIDE
  THEME: typeof THEME
  DARK_THEME: typeof DARK_THEME
  prototype: MindElixirMethods
  dragMoveHelper: typeof dragMoveHelper
}

// 默认导出类。
export default MindElixir as unknown as MindElixirCtor