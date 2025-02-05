/**
 * @fileoverview 该文件定义了 MindElixir 的类型声明，包括主题、实例、选项以及节点对象等核心数据结构。
 * 它主要用于 TypeScript 类型检查和代码提示，确保在使用 MindElixir 库时能够获得良好的开发体验。
 */

import type Bus from '../utils/pubsub'
import type { Topic, CustomSvg } from './dom'
import type { EventMap, Operation } from '../utils/pubsub'
import type { MindElixirMethods, OperationMap, Operations } from '../methods'
import type { LinkDragMoveHelperInstance } from '../utils/LinkDragMoveHelper'
import type { Arrow } from '../arrow'
import type { Summary, SummarySvgGroup } from '../summary'
import type SelectionArea from '@viselect/vanilla'
import type { MainLineParams, SubLineParams } from '../utils/generateBranch'
import type { Locale } from '../i18n'
import type { ContextMenuOption } from '../plugin/contextMenu'
export { type MindElixirMethods } from '../methods'

/**
 * 枚举类 DirectionClass 定义了左右方向的样式类名。
 */
export enum DirectionClass {
  LHS = 'lhs', // 左侧分支
  RHS = 'rhs', // 右侧分支
}

/**
 * Before 类型定义了一个对象，用于在执行某些操作前进行拦截和验证。
 * 每个键对应一个操作名称，值是一个函数，接受操作参数并返回布尔值或 Promise<boolean>。
 */
type Before = Partial<{
  [K in Operations]: (...args: Parameters<OperationMap[K]>) => Promise<boolean> | boolean
}>

/**
 * Theme 类型定义了 MindElixir 的主题配置。
 *
 * @public
 */
export type Theme = {
  name: string // 主题名称
  /**
   * 提示开发者使用正确的主题类型（亮色或暗色）。
   */
  type?: 'light' | 'dark'
  /**
   * 主分支的颜色调色板。
   */
  palette: string[]
  cssVar: Partial<{
    '--gap': string // 节点间距
    '--main-color': string // 主颜色
    '--main-bgcolor': string // 主背景颜色
    '--color': string // 文本颜色
    '--bgcolor': string // 背景颜色
    '--selected': string // 选中状态颜色
    '--root-color': string // 根节点文本颜色
    '--root-bgcolor': string // 根节点背景颜色
    '--root-border-color': string // 根节点边框颜色
    '--root-radius': string // 根节点圆角半径
    '--main-radius': string // 主节点圆角半径
    '--topic-padding': string // 节点内边距
    '--panel-color': string // 面板文本颜色
    '--panel-bgcolor': string // 面板背景颜色
    '--panel-border-color': string // 面板边框颜色
  }>
}

/**
 * MindElixirInstance 接口定义了 MindElixir 实例的核心属性和方法。
 *
 * @public
 */
export interface MindElixirInstance extends MindElixirMethods {
  disposable: Array<() => void> // 一次性清理函数数组
  isFocusMode: boolean // 是否处于聚焦模式
  nodeDataBackup: NodeObj // 节点数据备份
  mindElixirBox: HTMLElement // MindElixir 容器元素

  nodeData: NodeObj // 当前节点数据
  arrows: Arrow[] // 箭头集合
  summaries: Summary[] // 概要集合

  currentNode: Topic | null // 当前选中的节点
  currentNodes: Topic[] | null // 当前多选的节点集合
  currentSummary: SummarySvgGroup | null // 当前选中的概要
  currentArrow: CustomSvg | null // 当前选中的箭头

  waitCopy: Topic[] | null // 待复制的节点集合
  scaleVal: number // 缩放比例
  tempDirection: number | null // 临时方向设置
  theme: Theme // 当前主题
  userTheme?: Theme // 用户自定义主题
  direction: number // 思维导图方向
  locale: Locale // 国际化语言配置
  draggable: boolean // 是否允许拖拽
  editable: boolean // 是否允许编辑
  contextMenu: boolean // 是否启用右键菜单
  contextMenuOption?: ContextMenuOption // 右键菜单选项
  toolBar: boolean // 是否显示工具栏
  keypress: boolean // 是否启用快捷键
  mouseSelectionButton: 0 | 2 // 鼠标选择按钮（左键或右键）
  before: Before // 操作前的拦截函数集合
  newTopicName: string // 新主题的默认名称
  allowUndo: boolean // 是否允许撤销操作
  overflowHidden: boolean // 是否隐藏溢出内容
  mainBranchStyle: number // 主分支样式
  subBranchStyle: number // 子分支样式
  generateMainBranch: (params: MainLineParams) => PathString // 生成主分支路径的函数
  generateSubBranch: (params: SubLineParams) => PathString // 生成子分支路径的函数

  container: HTMLElement // 外层容器
  map: HTMLElement // 地图容器
  root: HTMLElement // 根节点元素
  nodes: HTMLElement // 所有节点的容器
  lines: SVGElement // 连线容器
  summarySvg: SVGElement // 概要 SVG 容器
  linkController: SVGElement // 链接控制器
  P2: HTMLElement // 辅助点 2
  P3: HTMLElement // 辅助点 3
  line1: SVGElement // 第一条连线
  line2: SVGElement // 第二条连线
  linkSvgGroup: SVGElement // 链接 SVG 组
  /**
   * @internal
   */
  helper1?: LinkDragMoveHelperInstance // 链接拖动辅助工具实例 1
  /**
   * @internal
   */
  helper2?: LinkDragMoveHelperInstance // 链接拖动辅助工具实例 2

  bus: ReturnType<typeof Bus.create<EventMap>> // 事件总线
  history: Operation[] // 操作历史记录
  undo: () => void // 撤销操作
  redo: () => void // 重做操作

  selection: SelectionArea // 选择区域实例
  selectionContainer?: string | HTMLElement // 选择区域容器
}

type PathString = string

/**
 * Options 类型定义了初始化 MindElixir 实例时的配置选项。
 *
 * @public
 */
export type Options = {
  el: string | HTMLElement // 容器元素或选择器
  direction?: number // 思维导图方向
  locale?: Locale // 国际化语言配置
  draggable?: boolean // 是否允许拖拽
  editable?: boolean // 是否允许编辑
  contextMenu?: boolean // 是否启用右键菜单
  contextMenuOption?: ContextMenuOption // 右键菜单选项
  toolBar?: boolean // 是否显示工具栏
  keypress?: boolean // 是否启用快捷键
  mouseSelectionButton?: 0 | 2 // 鼠标选择按钮（左键或右键）
  before?: Before // 操作前的拦截函数集合
  newTopicName?: string // 新主题的默认名称
  allowUndo?: boolean // 是否允许撤销操作
  overflowHidden?: boolean // 是否隐藏溢出内容
  generateMainBranch?: (this: MindElixirInstance, params: MainLineParams) => PathString // 自定义主分支生成函数
  generateSubBranch?: (this: MindElixirInstance, params: SubLineParams) => PathString // 自定义子分支生成函数
  theme?: Theme // 主题配置
  nodeMenu?: boolean // 是否启用节点菜单
  selectionContainer?: string | HTMLElement // 选择区域容器
}

export type Uid = string

export type Left = 0
export type Right = 1

/**
 * NodeObj 类型定义了思维导图中节点的数据结构。
 *
 * @public
 */
export type NodeObj = {
  topic: string // 节点主题
  id: Uid // 节点唯一标识符
  style?: {
    fontSize?: string // 字体大小
    color?: string // 文本颜色
    background?: string // 背景颜色
    fontWeight?: string // 字体粗细
  }
  children?: NodeObj[] // 子节点集合
  tags?: string[] // 标签集合
  icons?: string[] // 图标集合
  hyperLink?: string // 超链接
  expanded?: boolean // 是否展开
  direction?: Left | Right // 节点方向
  image?: {
    url: string // 图片 URL
    width: number // 图片宽度
    height: number // 图片高度
    fit?: 'fill' | 'contain' | 'cover' // 图片填充方式
  }
  // 主节点特定属性
  branchColor?: string // 分支颜色
  // 程序添加的属性
  parent?: NodeObj // 父节点（根节点无父节点！）
  // TODO: checkbox
  // checkbox?: boolean | undefined
  dangerouslySetInnerHTML?: string // 危险地设置 HTML 内容
}
export type NodeObjExport = Omit<NodeObj, 'parent'>

/**
 * MindElixirData 类型定义了导出的思维导图数据结构。
 *
 * @public
 */
export type MindElixirData = {
  nodeData: NodeObj // 节点数据
  arrows?: Arrow[] // 箭头集合
  summaries?: Summary[] // 概要集合
  direction?: number // 思维导图方向
  theme?: Theme // 主题配置
}