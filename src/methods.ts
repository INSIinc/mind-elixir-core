/**
 * @file methods.ts
 * @description 该文件定义了 mind-elixir 实例可以使用的所有方法。
 *              包括节点操作、布局、主题切换、插件初始化等核心功能。
 *              这些方法主要用于思维导图的创建、编辑和交互。
 *              适用于思维导图应用的核心逻辑实现。
 */

import type { MindElixirInstance, MindElixirData } from './index'
import linkDiv from './linkDiv'
import contextMenu from './plugin/contextMenu'
import keypress from './plugin/keypress'
import nodeDraggable from './plugin/nodeDraggable'
import operationHistory from './plugin/operationHistory'
import toolBar from './plugin/toolBar'
import selection from './plugin/selection'
import { editTopic, createWrapper, createParent, createChildren, createTopic, findEle } from './utils/dom'
import { getObjById, generateNewObj, fillParent } from './utils/index'
import { layout } from './utils/layout'
import changeTheme from './utils/theme'
import * as interact from './interact'
import * as nodeOperation from './nodeOperation'
import * as arrow from './arrow'
import * as summary from './summary'
import * as exportImage from './plugin/exportImage'

/**
 * 定义操作映射类型，用于描述节点操作的集合。
 */
export type OperationMap = typeof nodeOperation

/**
 * 定义操作键类型，用于索引操作映射中的具体方法。
 */
export type Operations = keyof OperationMap

/**
 * 定义节点操作类型，包含所有操作的返回值类型。
 */
type NodeOperation = {
  [K in Operations]: ReturnType<typeof beforeHook<K>>
}

/**
 * 为指定的操作方法添加前置钩子函数。
 * 在执行实际操作前，会先调用钩子函数进行预处理。
 * 如果钩子函数返回 false，则终止操作。
 *
 * @param fn - 操作方法本身
 * @param fnName - 操作方法的名称
 * @returns 返回一个带有前置钩子的新函数
 */
function beforeHook<T extends Operations>(
  fn: OperationMap[T],
  fnName: T
): (this: MindElixirInstance, ...args: Parameters<OperationMap[T]>) => Promise<void> {
  return async function (this: MindElixirInstance, ...args: Parameters<OperationMap[T]>) {
    const hook = this.before[fnName]
    if (hook) {
      const res = await hook.apply(this, args)
      if (!res) return
    }
    ; (fn as any).apply(this, args)
  }
}

// 获取所有操作方法的键名
const operations = Object.keys(nodeOperation) as Array<Operations>
const nodeOperationHooked = {} as NodeOperation

// 非精简模式下，为每个操作方法添加前置钩子
if (import.meta.env.MODE !== 'lite') {
  for (let i = 0; i < operations.length; i++) {
    const operation = operations[i]
    nodeOperationHooked[operation] = beforeHook(nodeOperation[operation], operation)
  }
}

/**
 * 定义 mind-elixir 方法集合类型。
 */
export type MindElixirMethods = typeof methods

/**
 * Methods that mind-elixir instance can use
 *
 * @public
 * @class methods
 * @description 提供 mind-elixir 实例的核心方法集合。
 *              包括节点操作、布局调整、主题切换、插件初始化等功能。
 */
const methods = {
  /**
   * 根据 ID 获取节点对象。
   */
  getObjById,

  /**
   * 生成新的节点对象。
   */
  generateNewObj,

  /**
   * 布局调整方法。
   */
  layout,

  /**
   * 更新节点链接线。
   */
  linkDiv,

  /**
   * 编辑节点主题内容。
   */
  editTopic,

  /**
   * 创建节点包装器。
   */
  createWrapper,

  /**
   * 创建父节点。
   */
  createParent,

  /**
   * 创建子节点。
   */
  createChildren,

  /**
   * 创建新主题节点。
   */
  createTopic,

  /**
   * 查找指定元素。
   */
  findEle,

  /**
   * 切换主题样式。
   */
  changeTheme,

  // 插件相关方法
  ...interact,
  ...(nodeOperationHooked as NodeOperation),
  ...arrow,
  ...summary,
  ...exportImage,

  /**
   * 初始化 mind-elixir 实例。
   * 初始化整个思维导图实例，包括基本配置、主题、节点数据、插件功能等。
   * 
   * @param data - 思维导图数据对象，包含以下属性：
   *   - `nodeData`: 思维导图的节点数据结构，表示节点的层级与布局信息。
   *   - `direction`: （可选）思维导图的方向，默认为水平布局。
   *   - `theme`: （可选）思维导图的主题样式配置。
   *   - `arrows`: （可选）自定义连线箭头数组。
   *   - `summaries`: （可选）概要节点配置。
   * @returns 如果 `data` 或 `data.nodeData` 未提供，则返回错误信息。
   */
  init(this: MindElixirInstance, data: MindElixirData) {
    // 如果传入的数据不完整或无效，立即返回错误
    if (!data || !data.nodeData) return new Error('MindElixir: `data` is required');

    // 如果用户提供了布局方向，应用指定的方向
    if (data.direction !== undefined) {
      this.direction = data.direction;
    }

    // 更改思维导图的主题，若无主题则使用默认值；第二参数表示是否需要触发渲染
    this.changeTheme(data.theme || this.theme, false);

    // 初始化节点数据，此为思维导图的核心信息
    this.nodeData = data.nodeData;

    // 补充节点的父节点引用，确保节点结构完整
    fillParent(this.nodeData);

    // 初始化箭头和概要节点，如果未提供则设为空数组
    this.arrows = data.arrows || [];
    this.summaries = data.summaries || [];

    // 整理箭头的布局和连线，确保箭头的图形显示正确
    this.tidyArrow();

    // 初始化工具条插件（若工具条功能被启用）
    this.toolBar && toolBar(this);

    // 判断当前环境是否是非精简模式（开发或完整模式）
    if (import.meta.env.MODE !== 'lite') {
      // 如果按键功能被启用，初始化按键事件绑定
      this.keypress && keypress(this);

      // 如果启用可编辑功能，初始化节点的选择事件
      if (this.editable) {
        selection(this);
      }

      // 如果启用右键菜单，绑定菜单事件并存储可解除的事件监听
      if (this.contextMenu) {
        this.disposable.push(contextMenu(this, this.contextMenuOption));
      }

      // 如果启用节点拖拽功能，初始化节点拖拽行为
      this.draggable && nodeDraggable(this);

      // 如果允许操作记录，启用历史记录功能
      this.allowUndo && operationHistory(this);
    }

    // 将思维导图视图居中
    this.toCenter();

    // 重新布局节点，使其在画布上排布整齐
    this.layout();

    // 初始化链接层，负责绘制连线和关联关系
    this.linkDiv();
  },

  /**
   * 销毁 mind-elixir 实例，清理所有资源。
   */
  destroy(this: Partial<MindElixirInstance>) {
    this.disposable!.forEach(fn => fn())
    if (this.mindElixirBox) this.mindElixirBox.innerHTML = ''
    this.mindElixirBox = undefined
    this.nodeData = undefined
    this.arrows = undefined
    this.summaries = undefined
    this.currentArrow = undefined
    this.currentNode = undefined
    this.currentNodes = undefined
    this.currentSummary = undefined
    this.waitCopy = undefined
    this.theme = undefined
    this.direction = undefined
    this.bus = undefined
    this.container = undefined
    this.map = undefined
    this.lines = undefined
    this.linkController = undefined
    this.linkSvgGroup = undefined
    this.P2 = undefined
    this.P3 = undefined
    this.line1 = undefined
    this.line2 = undefined
    this.nodes = undefined
    this.selection?.destroy()
    this.selection = undefined
  },
}

export default methods