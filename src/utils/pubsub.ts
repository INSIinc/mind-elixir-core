/**
 * 模块功能描述:
 * 本模块实现了一个基于发布订阅模式的事件总线（Event Bus），用于管理多个事件的监听和触发逻辑。
 * 使用场景:
 * 本模块适用于需要在模块或组件之间进行事件解耦的场景，例如前端界面组件间通信、跨模块事件协调等。
 */

import type { Arrow } from '../arrow'
import type { Summary } from '../summary'
import type { NodeObj } from '../types/index'

/**
 * 类型定义: NodeOperation
 * 描述不同节点操作的类型及其结构。
 * 包括支持的节点操作如移动、复制、编辑等，及其对应的操作对象和必要参数。
 */
type NodeOperation =
  | {
    name: 'moveNodeIn' | 'moveDownNode' | 'moveUpNode' | 'copyNode' | 'addChild' | 'insertParent' | 'insertBefore' | 'beginEdit'
    obj: NodeObj // 操作涉及的节点对象
  }
  | {
    name: 'insertSibling'
    type: 'before' | 'after' // 插入位置：之前或之后
    obj: NodeObj
  }
  | {
    name: 'reshapeNode' // 重塑节点
    obj: NodeObj // 新的节点对象
    origin: NodeObj // 原始节点对象
  }
  | {
    name: 'finishEdit'
    obj: NodeObj // 编辑后节点
    origin: string // 原始内容
  }
  | {
    name: 'moveNodeAfter' | 'moveNodeBefore' | 'moveNodeIn'
    objs: NodeObj[] // 被移动的节点列表
    toObj: NodeObj // 移动目标节点
  }
  | {
    name: 'removeNode'
    obj: NodeObj // 要删除的节点
    originIndex?: number // 节点原始位置索引（可选）
    originParentId?: string // 节点原始父节点 ID（可选）
  }

/**
 * 类型定义: MultipleNodeOperation
 * 描述多节点操作的类型结构，如批量删除或复制。
 */
type MultipleNodeOperation =
  | {
    name: 'removeNodes'
    objs: NodeObj[] // 被删除的节点列表
  }
  | {
    name: 'copyNodes'
    objs: NodeObj[] // 被复制的节点列表
  }

/**
 * 类型定义: SummaryOperation
 * 描述摘要操作的类型及其结构，包括创建、更改和删除摘要。
 */
export type SummaryOperation =
  | {
    name: 'createSummary' // 创建摘要
    obj: Summary // 摘要对象
  }
  | {
    name: 'removeSummary' // 删除摘要
    obj: { id: string } // 摘要 ID
  }
  | {
    name: 'finishEditSummary'
    obj: Summary // 编辑后的摘要对象
  }

/**
 * 类型定义: ArrowOperation
 * 描述箭头操作的类型及其结构，包括新建、删除及完成箭头标签编辑。
 */
export type ArrowOperation =
  | {
    name: 'createArrow' // 创建箭头
    obj: Arrow // 箭头对象
  }
  | {
    name: 'removeArrow' // 删除箭头
    obj: { id: string } // 箭头 ID
  }
  | {
    name: 'finishEditArrowLabel'
    obj: Arrow // 编辑后的箭头对象
  }

/**
 * 类型定义: Operation
 * 操作类型联合了所有节点操作、多节点操作、摘要操作和箭头操作的类型。
 */
export type Operation = NodeOperation | MultipleNodeOperation | SummaryOperation | ArrowOperation

/**
 * 类型定义: OperationType
 * 表示所有支持的操作名称类型。
 */
export type OperationType = Operation['name']

/**
 * 类型定义: EventMap
 * 描述事件名称与对应回调函数类型的映射。
 */
export type EventMap = {
  operation: (info: Operation) => void // 操作事件回调
  selectNode: (nodeObj: NodeObj, e?: MouseEvent) => void // 选中节点事件
  selectNewNode: (nodeObj: NodeObj) => void // 选中新节点事件
  selectNodes: (nodeObj: NodeObj[]) => void // 选中多个节点事件
  unselectNode: () => void // 取消选中节点事件
  unselectNodes: () => void // 取消选中多个节点事件
  expandNode: (nodeObj: NodeObj) => void // 节点展开事件
  linkDiv: () => void // 链接 DIV 事件
  scale: (scale: number) => void // 缩放事件
}

/**
 * 类描述: Bus
 * 提供了发布订阅模式的实现，支持事件的注册、触发和移除功能。
 * 使用场景:
 * 可用于不同模块、组件之间的事件传递。
 */
const Bus = {
  /**
   * 创建一个事件总线实例。
   * @template T 事件映射类型
   * @returns 返回包含监听器和相关操作方法的实例对象。
   */
  create<T extends Record<string, (...args: any[]) => void> = EventMap>() {
    return {
      handlers: {} as Record<keyof T, ((...arg: any[]) => void)[]>, // 事件处理器集合

      /**
       * 显示当前已注册的事件处理器。
       * 用于调试，打印handlers对象内容。
       */
      showHandler: function () {
        console.log(this.handlers)
      },

      /**
       * 添加一个事件监听器。
       * @param type 事件名称
       * @param handler 对应的事件处理器函数
       */
      addListener: function <K extends keyof T>(type: K, handler: T[K]) {
        if (this.handlers[type] === undefined) this.handlers[type] = [] // 初始化事件数组
        this.handlers[type].push(handler) // 添加处理函数
      },

      /**
       * 触发指定事件。
       * @param type 事件名称
       * @param payload 事件附加参数
       */
      fire: function <K extends keyof T>(type: K, ...payload: Parameters<T[K]>) {
        if (this.handlers[type] instanceof Array) {
          const handlers = this.handlers[type]
          for (let i = 0; i < handlers.length; i++) {
            handlers[i](...payload) // 调用处理函数
          }
        }
      },

      /**
       * 移除事件监听器。
       * @param type 事件名称
       * @param handler 要移除的事件处理函数，若不传则移除该事件的所有处理程序。
       */
      removeListener: function <K extends keyof T>(type: K, handler: T[K]) {
        if (!this.handlers[type]) return // 未找到对应处理器直接返回
        const handlers = this.handlers[type]
        if (!handler) {
          handlers.length = 0 // 清空所有处理函数
        } else if (handlers.length) {
          for (let i = 0; i < handlers.length; i++) {
            if (handlers[i] === handler) {
              this.handlers[type].splice(i, 1) // 移除匹配的处理函数
            }
          }
        }
      },
    }
  },
}

export default Bus