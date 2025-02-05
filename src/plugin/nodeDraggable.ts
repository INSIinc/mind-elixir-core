/**
 * @文件描述: 节点拖拽功能模块
 * 
 * 本模块主要用于实现思维导图节点拖拽的交互功能，包括拖拽开始、拖拽过程中动态插入指示、拖拽结束节点重新排序等操作。
 * 适用于需要通过拖拽调整节点层级关系的场景，例如思维导图编辑器、组织架构图管理工具等。
 *
 * @设计考量:
 * 1. **拖拽元素隔离**: 在拖拽过程中，通过创建“幽灵节点”(ghost)来代替被拖拽的实际节点，确保用户界面不会意外受影响。
 * 2. **插入预览**: 在拖拽经过其他节点时动态显示插入位置的预览，提升用户体验。
 * 3. **性能优化**: 针对 `dragover` 处理过程引入节流机制（throttle），避免频繁触发回调函数，降低性能开销。
 * 4. **容错与边界控制**: 通过 `canMove` 函数判断拖放目标节点的合法性，规避不应发生的嵌套或循环问题。
 * 5. **事件监听与分离**: 将拖拽的常见事件（dragstart、dragover、dragend）集中处理，事件行为彼此独立但协同工作。

 */
import { throttle } from '../utils/index'
import dragMoveHelper from '../utils/dragMoveHelper'
import type { Topic } from '../types/dom'
import type { MindElixirInstance } from '../types/index'
// https://html.spec.whatwg.org/multipage/dnd.html#drag-and-drop-processing-model

/**
 * 表示插入类型的类型别名
 * - `'before'`: 插入到目标节点之前
 * - `'after'`: 插入到目标节点之后
 * - `'in'`: 插入到目标节点内部
 * - `null`: 不进行插入
 */
type InsertType = 'before' | 'after' | 'in' | null

// 便捷引用 document 实例
const $d = document

/**
 * 为目标节点显示插入预览的函数
 * @param tpc 需要显示插入预览的目标节点
 * @param insertTpye 插入类型，可以是 'before'、'after'、'in' 或 null
 * @returns 返回传入的目标节点 tpc
 */
const insertPreview = function (tpc: Topic, insertTpye: InsertType) {
  if (!insertTpye) {
    // 清理插入预览效果
    clearPreview(tpc)
    return tpc
  }
  let el = tpc.querySelector('.insert-preview')
  const className = `insert-preview ${insertTpye} show`
  if (!el) {
    // 如果还没有插入预览节点，则创建一个新节点
    el = $d.createElement('div')
    tpc.appendChild(el)
  }
  // 更新插入预览的样式类名
  el.className = className
  return tpc
}

/**
 * 清除目标节点中的插入预览效果
 * @param el 目标节点或 null
 */
const clearPreview = function (el: Element | null) {
  if (!el) return
  // 查找所有的插入预览节点并移除
  const query = el.querySelectorAll('.insert-preview')
  for (const queryElement of query || []) {
    queryElement.remove()
  }
}

/**
 * 检查目标节点是否可以作为拖动节点的插入点
 * @param el 检查的目标节点
 * @param dragged 当前正在被拖动的节点数组
 * @returns 如果可以插入返回 true，否则返回 false
 */
const canMove = function (el: Element, dragged: Topic[]) {
  for (const node of dragged) {
    const isContain = node.parentElement.parentElement.contains(el)
    const ok =
      el &&
      el.tagName === 'ME-TPC' &&
      el !== node && // 防止自己拖动到自己
      !isContain && // 防止拖动到自己的子节点中
      (el as Topic).nodeObj.parent // 检查是否有父节点
    if (!ok) return false
  }
  return true
}

/**
 * 创建拖动过程中显示的虚影节点
 * @param mei MindElixir 实例
 * @returns 返回创建的虚影节点
 */
const createGhost = function (mei: MindElixirInstance) {
  const ghost = document.createElement('div')
  ghost.className = 'mind-elixir-ghost'
  // 将虚影节点添加到 MindElixir 的地图容器中
  mei.map.appendChild(ghost)
  return ghost
}

/**
 * 为 MindElixir 思维导图实例配置拖动功能
 * @param mind MindElixir 实例
 */
export default function (mind: MindElixirInstance) {
  // 当前被拖动的节点数组
  let dragged: Topic[] | null = null
  // 当前的插入类型
  let insertTpye: InsertType = null
  // 当前的目标节点
  let meet: Topic | null = null
  // 虚影节点
  const ghost = createGhost(mind)
  // 光标与拖动节点上下边界的阈值，用于判断插入位置
  const threshold = 48

  // 监听 dragstart 事件
  mind.map.addEventListener('dragstart', e => {
    const target = e.target as Topic
    if (target?.tagName !== 'ME-TPC') {
      // 如果拖动的目标不是 Topic 节点，阻止拖动并直接返回
      e.preventDefault()
      return
    }
    if (!mind.currentNodes?.includes(target)) {
      // 如果目标未被选中，取消其他选择并选中目标
      mind.unselectNodes()
      mind.selectNode(target)
    }
    if (mind.currentNodes) {
      // 如果有选中的多个节点，将其设为拖动节点
      dragged = mind.currentNodes
      ghost.innerHTML = mind.currentNodes.length + ' nodes'
    } else {
      // 仅拖动单个目标节点的情况
      dragged = [target]
      ghost.innerHTML = target.innerHTML
    }
    for (const node of dragged) {
      // 设置被拖动节点的父节点透明度
      node.parentElement.parentElement.style.opacity = '0.5'
    }
    // 设置拖动时显示的虚影
    e.dataTransfer?.setDragImage(ghost, 0, 0)
    dragMoveHelper.clear()
  })

  // 监听 dragend 事件
  mind.map.addEventListener('dragend', async e => {
    if (!dragged) return
    for (const node of dragged) {
      // 恢复拖动节点父节点的透明度
      node.parentElement.parentElement.style.opacity = '1'
    }
    const target = e.target as Topic
    target.style.opacity = ''
    if (!meet) return
    // 清除目标节点上的插入预览
    clearPreview(meet)
    // 根据插入类型执行对应的节点移动
    if (insertTpye === 'before') {
      mind.moveNodeBefore(dragged, meet)
    } else if (insertTpye === 'after') {
      mind.moveNodeAfter(dragged, meet)
    } else if (insertTpye === 'in') {
      mind.moveNodeIn(dragged, meet)
    }
    dragged = null
  })


  // 为脑图的拖动操作添加事件监听器
  mind.map.addEventListener(
    'dragover',
    throttle(function (e: DragEvent) {
      // 检查是否存在拖动目标，如果没有则直接返回
      if (!dragged) return

      // 清除之前可能存在的插入预览效果
      // 通过 clearPreview 方法对上次选中的预览节点进行状态清空
      clearPreview(meet)

      // 判断当前鼠标光标是否位于目标节点的上方
      const topMeet = $d.elementFromPoint(e.clientX, e.clientY - threshold) as Topic
      if (canMove(topMeet, dragged)) {
        // 当前目标节点可插入
        meet = topMeet
        const y = topMeet.getBoundingClientRect().y
        if (e.clientY > y + topMeet.clientHeight) {
          // 如果鼠标光标位于目标节点的下边缘，则设置插入位置为 "after"
          insertTpye = 'after'
        } else {
          // 否则默认插入为目标节点的内部
          insertTpye = 'in'
        }
      } else {
        // 如果光标不位于上方，尝试判断是否位于目标节点的下方
        const bottomMeet = $d.elementFromPoint(e.clientX, e.clientY + threshold) as Topic
        if (canMove(bottomMeet, dragged)) {
          // 当前目标节点可插入
          meet = bottomMeet
          const y = bottomMeet.getBoundingClientRect().y
          if (e.clientY < y) {
            // 如果光标位于目标节点的上边缘，则设置插入位置为 "before"
            insertTpye = 'before'
          } else {
            // 否则默认插入为目标节点的内部
            insertTpye = 'in'
          }
        } else {
          // 如果没有可插入的目标，则重置插入类型和目标节点
          insertTpye = meet = null
        }
      }

      // 如果存在目标节点，则在目标节点上添加插入预览效果
      if (meet) insertPreview(meet, insertTpye)
    }, 100) // 使用 throttle 方法限制事件触发频率，每100毫秒调用一次
  )
}