import type { MindElixirData, NodeObj } from '../index'
import { type MindElixirInstance } from '../index'
import { findEle } from '../utils/dom'
import type { Operation } from '../utils/pubsub'

// 定义历史记录的数据结构
type History = {
  prev: MindElixirData // 操作前的数据快照
  next: MindElixirData // 操作后的数据快照
  currentObject:
  | {
    type: 'node' | 'summary' | 'arrow' // 当前对象的类型（节点、摘要、箭头）
    value: string // 当前对象的唯一标识
  }
  | {
    type: 'nodes' // 当前对象为多个节点
    value: string[] // 当前对象中节点的唯一标识数组
  }
}

/**
 * 根据操作计算当前对象的信息
 * @param operation 操作对象，包含操作名称与目标数据
 * @returns 当前操作的目标对象信息
 */
const calcCurentObject = function (operation: Operation): History['currentObject'] {
  // 处理摘要相关的操作
  if (['createSummary', 'removeSummary', 'finishEditSummary'].includes(operation.name)) {
    return {
      type: 'summary',
      value: (operation as any).obj.id, // 获取摘要对象的唯一标识
    }
    // 处理箭头相关的操作
  } else if (['createArrow', 'removeArrow', 'finishEditArrowLabel'].includes(operation.name)) {
    return {
      type: 'arrow',
      value: (operation as any).obj.id, // 获取箭头对象的唯一标识
    }
    // 处理多个节点相关的操作
  } else if (['removeNodes', 'copyNodes', 'moveNodeBefore', 'moveNodeAfter', 'moveNodeIn'].includes(operation.name)) {
    return {
      type: 'nodes',
      value: (operation as any).objs.map((obj: NodeObj) => obj.id), // 收集所有节点的唯一标识
    }
    // 默认处理单节点相关的操作
  } else {
    return {
      type: 'node',
      value: (operation as any).obj.id, // 获取节点对象的唯一标识
    }
  }
}

/**
 * 为 MindElixir 实例添加历史记录与撤销/重做功能
 * @param mei MindElixir 的实例对象
 */
export default function (mei: MindElixirInstance) {
  let history = [] as History[] // 保存操作历史记录的数组
  let currentIndex = -1 // 当前操作在历史记录中的索引
  let current = mei.getData() // 当前的思维导图数据快照

  // 监听 'operation' 事件，记录每次操作
  mei.bus.addListener('operation', (operation: Operation) => {
    if (operation.name === 'beginEdit') return // 跳过编辑开始操作

    history = history.slice(0, currentIndex + 1) // 清除当前位置之后的历史记录
    const next = mei.getData() // 获取操作后的最新数据快照
    history.push({ prev: current, currentObject: calcCurentObject(operation), next }) // 记录此次操作
    current = next // 更新当前数据快照
    currentIndex = history.length - 1 // 更新当前索引到最新操作
    // console.log('operation', operation.obj.id, history)
  })

  /**
   * 撤销最近的一次操作
   */
  mei.undo = function () {
    if (currentIndex > -1) { // 检查是否有可以撤销的操作
      const h = history[currentIndex] // 获取当前历史记录
      current = h.prev // 恢复操作前的数据快照
      mei.refresh(h.prev) // 更新思维导图为操作前的状态

      try {
        // 处理节点选中状态的还原
        if (h.currentObject.type === 'node') mei.selectNode(findEle(h.currentObject.value))
        else if (h.currentObject.type === 'nodes') mei.selectNodes(h.currentObject.value.map(id => findEle(id)))
      } catch (e) {
        // 捕获可能由于节点不存在造成的问题（例如撤销节点添加时）
      } finally {
        currentIndex-- // 更新索引到前一个操作
      }
      // console.log('current', current)
    }
  }

  /**
   * 重做最近被撤销的一次操作
   */
  mei.redo = function () {
    if (currentIndex < history.length - 1) { // 检查是否有可以重做的操作
      currentIndex++ // 更新索引到下一个操作
      const h = history[currentIndex] // 获取当前历史记录
      current = h.next // 恢复操作后的数据快照
      mei.refresh(h.next) // 更新思维导图为操作后的状态

      // 处理节点选中状态的还原
      if (h.currentObject.type === 'node') mei.selectNode(findEle(h.currentObject.value))
      else if (h.currentObject.type === 'nodes') mei.selectNodes(h.currentObject.value.map(id => findEle(id)))
    }
  }

  /**
   * 监听键盘操作，支持撤销和重做快捷键
   * Ctrl + Z 或 Meta + Z：撤销
   * Ctrl + Shift + Z 或 Meta + Shift + Z：重做
   */
  mei.map.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'Z') mei.redo() // 处理重做操作
    else if ((e.metaKey || e.ctrlKey) && e.key === 'z') mei.undo() // 处理撤销操作
  })
}