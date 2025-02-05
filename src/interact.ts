/**
 * 交互逻辑模块（MapInteraction）
 * 
 * 此模块提供了一系列用于思维导图交互操作的核心功能，例如节点的选择与取消选择、思维导图数据的获取与转换、
 * 地图视图的缩放与居中、插件的安装、焦点模式的切换等。此外，还包括思维导图子节点的分布布局（左侧、右侧或两侧），
 * 以及刷新和展开节点等操作。
 * 
 * 使用场景：
 * 1. 用户在思维导图上交互，例如点击、拖动、缩放、展开/折叠节点等。
 * 2. 开发者需要操作底层数据模型（数据格式、导出、导入等）或实现自定义功能时。
 * 3. 思维导图的渲染刷新或动态修改视图内容。
 * 
 * 设计考量：
 * 1. 关注用户交互：每个方法都设计为支持用户常见的思维导图交互操作，如选择节点、展开或折叠子节点。
 * 2. 高度可扩展性：通过 `install` 方法，支持插件机制扩展思维导图功能，同时使用 `bus.fire` 事件机制，方便扩展时的事件监听。
 * 3. 数据和视图的分离：方法如 `getData` 和 `getDataString` 可获取底层数据，确保数据与视图渲染的解耦。
 * 4. 国际化与自定义支持：支持通过 `setLocale` 方法设置语言环境，同时暴露了可供定制的布局方向和焦点模式等功能。
 * 
 * 注意事项：
 * 开发者使用本模块时需确保正确传递实例上下文（`MindElixirInstance`）以及有效的 DOM 元素参数；某些操作（如缩放与刷新）对视觉效果和用户体验有直接影响。
 */
import type { Locale } from './i18n'
import { rmSubline } from './nodeOperation'
import type { Topic, Wrapper } from './types/dom'
import type { MindElixirData, MindElixirInstance, NodeObj } from './types/index'
import { findEle } from './utils/dom'
import { fillParent } from './utils/index'

/**
 * @function collectData
 * @description 收集思维导图实例中的当前数据，包括节点数据、箭头、摘要、方向和主题等。
 * @param {MindElixirInstance} instance - 思维导图实例对象
 * @return {Object} 包含思维导图实例的当前数据的对象
 */
function collectData(instance: MindElixirInstance) {
  return {
    nodeData: instance.isFocusMode ? instance.nodeDataBackup : instance.nodeData, // 判断是否为焦点模式，返回对应节点数据
    arrows: instance.arrows, // 当前绘制的箭头数据
    summaries: instance.summaries, // 摘要节点数据
    direction: instance.direction, // 思维导图方向
    theme: instance.theme, // 当前主题样式
  }
}

/**
 * @function selectNode
 * @description 选中一个节点，将其设置为当前选中节点，并触发相应的自定义事件。
 * @param {Topic} targetElement - 目标节点的DOM元素
 * @param {boolean} [isNewNode] - 可选参数，是否为新增节点
 * @param {MouseEvent} [e] - 可选参数，触发该方法的鼠标事件
 * @memberof MapInteraction
 */
export const selectNode = function (this: MindElixirInstance, targetElement: Topic, isNewNode?: boolean, e?: MouseEvent): void {
  if (!targetElement) return // 如果目标元素不存在，直接返回
  console.time('selectNode') // 启动性能计时
  this.clearSelection() // 清除之前的选中状态
  if (typeof targetElement === 'string') {
    const el = findEle(targetElement) // 根据字符串ID查找元素
    if (!el) return // 如果找不到元素，返回
    return this.selectNode(el) // 递归调用以选中找到的节点
  }
  targetElement.className = 'selected' // 给选中的节点添加类名'选中'
  targetElement.scrollIntoView({ block: 'nearest', inline: 'nearest' }) // 滚动到选中节点使其可见
  this.currentNode = targetElement // 设置当前选中的节点
  if (isNewNode) {
    this.bus.fire('selectNewNode', targetElement.nodeObj) // 触发选中新节点事件
  } else {
    this.bus.fire('selectNode', targetElement.nodeObj, e) // 触发选中已存在节点事件
  }
  console.timeEnd('selectNode') // 结束性能计时
}

/**
 * @function unselectNode
 * @description 取消当前选中的节点，触发对应的事件。
 * @memberof MapInteraction
 */
export const unselectNode = function (this: MindElixirInstance) {
  if (this.currentNode) {
    this.currentNode.className = '' // 移除选中节点的类名
  }
  this.currentNode = null // 当前选中节点设为空
  this.bus.fire('unselectNode') // 触发取消选中节点事件
}

/**
 * @function selectNodes
 * @description 批量选中给定的一组节点。
 * @param {Topic[]} tpc - 要选中的节点数组
 * @memberof MapInteraction
 */
export const selectNodes = function (this: MindElixirInstance, tpc: Topic[]): void {
  console.time('selectNodes') // 启动性能计时
  this.clearSelection() // 清空之前的选中状态
  for (const el of tpc) {
    el.className = 'selected' // 给每个节点添加类名'选中'
  }
  this.currentNodes = tpc // 保存当前选中的节点数组
  this.bus.fire(
    'selectNodes',
    tpc.map(el => el.nodeObj) // 触发多选事件并传递节点数据
  )
  console.timeEnd('selectNodes') // 结束性能计时
}

/**
 * @function unselectNodes
 * @description 取消选中当前选中的所有节点。
 * @memberof MapInteraction
 */
export const unselectNodes = function (this: MindElixirInstance) {
  if (this.currentNodes) {
    for (const el of this.currentNodes) {
      el.classList.remove('selected') // 移除选中状态的类名
    }
  }
  this.currentNodes = null // 清空当前选中的节点数组
  this.bus.fire('unselectNodes') // 触发取消多选事件
}

/**
 * @function clearSelection
 * @description 清除当前所有的选中状态，包括节点、摘要和箭头。
 * @memberof MapInteraction
 */
export const clearSelection = function (this: MindElixirInstance) {
  this.unselectNode() // 取消当前选中单节点
  this.unselectNodes() // 取消当前选中多节点
  this.unselectSummary() // 取消选中的摘要
  this.unselectArrow() // 取消选中的箭头
}

/**
 * @function getDataString
 * @description 获取当前思维导图数据并返回为JSON字符串。
 * @return {string} JSON字符串格式的思维导图数据
 * @memberof MapInteraction
 */
export const getDataString = function (this: MindElixirInstance) {
  const data = collectData(this) // 收集当前思维导图数据
  return JSON.stringify(data, (k, v) => {
    if (k === 'parent' && typeof v !== 'string') return undefined // 忽略非字符串类型的父节点属性
    return v
  })
}

/**
 * @function getData
 * @description 获取当前思维导图数据并返回对象格式。
 * @return {MindElixirData} 对象格式的思维导图数据
 * @memberof MapInteraction
 */
export const getData = function (this: MindElixirInstance) {
  return JSON.parse(this.getDataString()) as MindElixirData // 将JSON字符串转为对象
}

/**
 * @function getDataMd
 * @description 获取当前思维导图数据并返回为Markdown格式字符串。
 * @return {string} Markdown格式的思维导图数据
 * @memberof MapInteraction
 */
export const getDataMd = function (this: MindElixirInstance) {
  const data = collectData(this).nodeData // 获取根节点数据
  let mdString = '# ' + data.topic + '\n\n' // 将根节点作为Markdown标题

  /**
   * 内部函数 writeMd
   * @description 递归地将节点及其子节点转换为Markdown格式
   * @param {NodeObj[]} children - 子节点数组
   * @param {number} deep - 当前递归层次，用于控制Markdown标题级别
   */
  function writeMd(children: NodeObj[], deep: number) {
    for (let i = 0; i < children.length; i++) {
      if (deep <= 6) {
        // 如果递归深度小于等于6，使用#标题级别
        mdString += ''.padStart(deep, '#') + ' ' + children[i].topic + '\n\n'
      } else {
        // 超过6级后使用列表表示
        mdString += ''.padStart(deep - 7, '\t') + '- ' + children[i].topic + '\n'
      }
      if (children[i].children) {
        writeMd(children[i].children || [], deep + 1) // 递归处理子节点
      }
    }
  }

  writeMd(data.children || [], 2) // 从根节点的子节点开始，初始深度为2
  return mdString // 返回生成的Markdown字符串
}
/**
 * @function
 * @instance
 * @name enableEdit
 * @memberof MapInteraction
 * @description
 * 启用编辑模式，使得思维导图可以被编辑。
 */
export const enableEdit = function (this: MindElixirInstance) {
  this.editable = true // 将 editable 属性设置为 true，从而启用编辑功能
}

/**
 * @function
 * @instance
 * @name disableEdit
 * @memberof MapInteraction
 * @description
 * 禁用编辑模式，使得思维导图无法被编辑。
 */
export const disableEdit = function (this: MindElixirInstance) {
  this.editable = false // 将 editable 属性设置为 false，从而禁用编辑功能
}

/**
 * @function
 * @instance
 * @name scale
 * @memberof MapInteraction
 * @description
 * 改变思维导图的缩放比例。
 * @param {number} scaleVal - 缩放比例数值。
 * @throws 缩放比例的值需在合适范围内，否则可能会导致显示问题。
 */
export const scale = function (this: MindElixirInstance, scaleVal: number) {
  // 使用 CSS 的 transform 属性调整缩放比例
  // 调整方案 A (弃用)：使用 transform-origin，可能会导致中心点偏移问题
  // 调整方案 B：使用 transform: translate 和 scale，避免中心点偏移问题
  this.scaleVal = scaleVal // 记录新的缩放比例
  this.map.style.transform = 'scale(' + scaleVal + ')' // 应用缩放比例至 CSS
  this.bus.fire('scale', scaleVal) // 触发内部事件，用于通知其他模块缩放变化
}

/**
 * @function
 * @instance
 * @name toCenter
 * @memberof MapInteraction
 * @description
 * 将思维导图的视图重置到中心位置。
 */
export const toCenter = function (this: MindElixirInstance) {
  this.container.scrollTo(
    10000 - this.container.offsetWidth / 2,
    10000 - this.container.offsetHeight / 2
  ) // 计算并设置容器的滚动位置，以展现中心
}

/**
 * @function
 * @instance
 * @name install
 * @memberof MapInteraction
 * @description
 * 安装插件。
 * @param {Function} plugin - 待安装的插件函数，该函数接受 MindElixirInstance 作为参数。
 */
export const install = function (
  this: MindElixirInstance,
  plugin: (instance: MindElixirInstance) => void
) {
  plugin(this) // 调用插件函数并传入实例
}

/**
 * @function
 * @instance
 * @name focusNode
 * @memberof MapInteraction
 * @description
 * 启用聚焦模式，并将指定的节点设为根节点。
 * @param {Topic} el - 被聚焦的目标节点，默认值为当前目标节点。
 */
export const focusNode = function (this: MindElixirInstance, el: Topic) {
  if (!el.nodeObj.parent) return // 如果目标节点没有父节点，则直接返回
  if (this.tempDirection === null) {
    this.tempDirection = this.direction // 备份当前方向信息
  }
  if (!this.isFocusMode) {
    this.nodeDataBackup = this.nodeData // 备份当前节点数据
    this.isFocusMode = true // 启用聚焦模式标志
  }
  this.nodeData = el.nodeObj // 将目标节点设为根节点
  this.initRight() // 初始化右侧子节点布局
  this.toCenter() // 将视图重置到中心位置
}

/**
 * @function
 * @instance
 * @name cancelFocus
 * @memberof MapInteraction
 * @description
 * 退出聚焦模式。
 */
export const cancelFocus = function (this: MindElixirInstance) {
  this.isFocusMode = false // 关闭聚焦模式标志
  if (this.tempDirection !== null) {
    this.nodeData = this.nodeDataBackup // 恢复原始节点数据
    this.direction = this.tempDirection // 恢复原始方向
    this.tempDirection = null
    this.refresh() // 刷新视图
    this.toCenter() // 将视图重置到中心位置
  }
}

/**
 * @function
 * @instance
 * @name initLeft
 * @memberof MapInteraction
 * @description
 * 将子节点布局设置为根节点的左侧。
 */
export const initLeft = function (this: MindElixirInstance) {
  this.direction = 0 // 将方向属性设置为左
  this.refresh() // 刷新视图
}

/**
 * @function
 * @instance
 * @name initRight
 * @memberof MapInteraction
 * @description
 * 将子节点布局设置为根节点的右侧。
 */
export const initRight = function (this: MindElixirInstance) {
  this.direction = 1 // 将方向属性设置为右
  this.refresh() // 刷新视图
}

/**
 * @function
 * @instance
 * @name initSide
 * @memberof MapInteraction
 * @description
 * 将子节点布局设置为根节点的两侧。
 */
export const initSide = function (this: MindElixirInstance) {
  this.direction = 2 // 将方向属性设置为两侧
  this.refresh() // 刷新视图
}

/**
 * @function
 * @instance
 * @name setLocale
 * @memberof MapInteraction
 * @description
 * 设置视图的多语言环境。
 * @param {Locale} locale - 多语言环境对象。
 */
export const setLocale = function (this: MindElixirInstance, locale: Locale) {
  this.locale = locale // 设置新的语言环境
  this.refresh() // 刷新视图以使语言设置生效
}

/**
 * @function
 * @instance
 * @name expandNode
 * @memberof MapInteraction
 * @description
 * 展开或折叠指定节点。
 * @param {Topic} el - 节点的 DOM 元素。
 * @param {boolean} [isExpand] - 指定是否展开，如果未传入则自动切换展开/折叠状态。
 * @throws 如果传入的节点无效，可能无法成功折叠。
 */
export const expandNode = function (
  this: MindElixirInstance,
  el: Topic,
  isExpand?: boolean
) {
  const node = el.nodeObj // 获取节点数据对象
  if (typeof isExpand === 'boolean') {
    node.expanded = isExpand // 根据参数决定展开或折叠
  } else if (node.expanded !== false) {
    node.expanded = false // 默认折叠
  } else {
    node.expanded = true // 默认展开
  }
  const parent = el.parentNode // 获取父级 DOM 元素
  const expander = parent.children[1]! // 定位到节点的展开/折叠按钮
  expander.expanded = node.expanded // 更新按钮的状态
  expander.className = node.expanded ? 'minus' : '' // 设置样式类名

  rmSubline(el) // 移除子线条
  if (node.expanded) {
    // 节点处于展开状态，动态加入其子节点
    const children = this.createChildren(
      node.children!.map(child => {
        const wrapper = this.createWrapper(child) // 包装每个子节点
        return wrapper.grp
      })
    )
    parent.parentNode.appendChild(children) // 插入生成的子节点 DOM
  } else {
    // 节点处于折叠状态，从 DOM 树中移除子节点
    const children = parent.parentNode.children[1]
    children.remove()
  }

  this.linkDiv(el.closest('me-main > me-wrapper') as Wrapper) // 更新父级的连接线

  // 确保节点始终在可视区域内
  const elRect = el.getBoundingClientRect() // 获取节点位置
  const containerRect = this.container.getBoundingClientRect() // 获取容器位置
  const isOutOfView =
    elRect.bottom > containerRect.bottom ||
    elRect.top < containerRect.top ||
    elRect.right > containerRect.right ||
    elRect.left < containerRect.left
  if (isOutOfView) {
    el.scrollIntoView({ block: 'center', inline: 'center' }) // 滚动节点到视图中心
  }

  this.bus.fire('expandNode', node) // 触发事件通知
}
/**
 * @function
 * @instance
 * @name refresh
 * @description 刷新思维导图布局。在修改了 `this.nodeData` 数据后，可以调用该方法刷新导图以反映新数据。
 * @memberof MapInteraction
 * @param {TargetElement} data 可选参数，表示思维导图的数据。如果未提供将使用现有数据。
 */
export const refresh = function (this: MindElixirInstance, data?: MindElixirData) {
  // 如果提供了新数据，将其进行深拷贝避免污染原数据
  if (data) {
    data = JSON.parse(JSON.stringify(data)) as MindElixirData // 深拷贝以确保原始数据不受污染
    this.nodeData = data.nodeData // 更新节点数据
    this.arrows = data.arrows || [] // 更新箭头数据，若数据未提供默认为空数组
    this.summaries = data.summaries || [] // 更新摘要数据，若数据未提供默认为空数组
  }

  // 为节点数据补全父节点信息，用于保证树结构的完整性
  fillParent(this.nodeData)

  // 为每个节点创建对应的 DOM 元素
  this.layout()

  // 为节点之间动态生成连接线
  this.linkDiv()
}