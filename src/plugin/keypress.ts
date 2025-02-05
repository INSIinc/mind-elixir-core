import type { Topic } from '../types/dom'
import type { MindElixirInstance } from '../types/index'
import { DirectionClass } from '../types/index'

/**
 * 核心功能概述:
 * 该文件提供了用于处理键盘事件的多个函数，主要用于在思维导图中进行节点选择、编辑、缩放等操作。
 * 所有函数都基于MindElixirInstance实例（mei），并根据当前节点状态和用户输入执行相应操作。
 */

/**
 * 功能详细描述: 
 * 选择左侧根节点，计算中间位置的左侧节点并选中。
 * 输入参数解析: 
 * @param mei - MindElixirInstance实例，表示当前思维导图的状态。
 * 异常处理机制: 
 * 如果没有找到符合条件的节点，则不会执行任何操作。
 */
const selectRootLeft = (mei: MindElixirInstance) => {
  // 获取所有左侧根节点
  const tpcs = mei.map.querySelectorAll('.lhs>me-wrapper>me-parent>me-tpc')
  // 计算中间位置并选中对应节点
  mei.selectNode(tpcs[Math.ceil(tpcs.length / 2) - 1] as Topic)
}

/**
 * 功能详细描述: 
 * 选择右侧根节点，计算中间位置的右侧节点并选中。
 * 输入参数解析: 
 * @param mei - MindElixirInstance实例，表示当前思维导图的状态。
 * 异常处理机制: 
 * 如果没有找到符合条件的节点，则不会执行任何操作。
 */
const selectRootRight = (mei: MindElixirInstance) => {
  // 获取所有右侧根节点
  const tpcs = mei.map.querySelectorAll('.rhs>me-wrapper>me-parent>me-tpc')
  // 计算中间位置并选中对应节点
  mei.selectNode(tpcs[Math.ceil(tpcs.length / 2) - 1] as Topic)
}

/**
 * 功能详细描述: 
 * 选择思维导图的根节点。
 * 输入参数解析: 
 * @param mei - MindElixirInstance实例，表示当前思维导图的状态。
 * 异常处理机制: 
 * 如果根节点不存在，则不会执行任何操作。
 */
const selectRoot = (mei: MindElixirInstance) => {
  // 选中根节点
  mei.selectNode(mei.map.querySelector('me-root>me-tpc') as Topic)
}

/**
 * 功能详细描述: 
 * 选择当前节点的父节点。
 * 输入参数解析: 
 * @param mei - MindElixirInstance实例，表示当前思维导图的状态。
 * @param currentNode - 当前选中的节点。
 * 异常处理机制: 
 * 如果父节点不存在，则不会执行任何操作。
 */
const selectParent = function (mei: MindElixirInstance, currentNode: Topic) {
  // 逐层向上查找父节点
  const parent = currentNode.parentElement.parentElement.parentElement.previousSibling
  if (parent) {
    // 选中父节点的第一个子节点
    const target = parent.firstChild
    mei.selectNode(target)
  }
}

/**
 * 功能详细描述: 
 * 选择当前节点的第一个子节点。
 * 输入参数解析: 
 * @param mei - MindElixirInstance实例，表示当前思维导图的状态。
 * @param currentNode - 当前选中的节点。
 * 异常处理机制: 
 * 如果没有子节点，则不会执行任何操作。
 */
const selectFirstChild = function (mei: MindElixirInstance, currentNode: Topic) {
  // 查找当前节点的子节点容器
  const children = currentNode.parentElement.nextSibling
  if (children && children.firstChild) {
    // 选中第一个子节点
    const target = children.firstChild.firstChild.firstChild
    mei.selectNode(target)
  }
}

/**
 * 功能详细描述: 
 * 处理左右方向键的操作逻辑，根据当前节点位置和方向选择目标节点。
 * 输入参数解析: 
 * @param mei - MindElixirInstance实例，表示当前思维导图的状态。
 * @param direction - 方向标识，值为DirectionClass.LHS或DirectionClass.RHS。
 * 异常处理机制: 
 * 如果无法确定目标节点，则不会执行任何操作。
 */
const handleLeftRight = function (mei: MindElixirInstance, direction: DirectionClass) {
  // 获取当前选中的节点
  const current = mei.currentNode || mei.currentNodes?.[0]
  if (!current) return
  const nodeObj = current.nodeObj
  const main = current.offsetParent.offsetParent.parentElement
  // 根据节点层级和方向执行不同操作
  if (!nodeObj.parent) {
    direction === DirectionClass.LHS ? selectRootLeft(mei) : selectRootRight(mei)
  } else if (main.className === direction) {
    selectFirstChild(mei, current)
  } else {
    if (!nodeObj.parent?.parent) {
      selectRoot(mei)
    } else {
      selectParent(mei, current)
    }
  }
}

/**
 * 功能详细描述: 
 * 处理上下方向键的操作逻辑，选择当前节点的上一个或下一个兄弟节点。
 * 输入参数解析: 
 * @param mei - MindElixirInstance实例，表示当前思维导图的状态。
 * @param direction - 方向标识，值为'previous'或'next'。
 * 异常处理机制: 
 * 如果没有兄弟节点，则不会执行任何操作。
 */
const handlePrevNext = function (mei: MindElixirInstance, direction: 'previous' | 'next') {
  // 获取当前选中的节点
  const current = mei.currentNode || mei.currentNodes?.[0]
  if (!current) return
  const nodeObj = current.nodeObj
  if (!nodeObj.parent) return
  // 根据方向动态获取兄弟节点属性名
  const s = (direction + 'Sibling') as 'previousSibling' | 'nextSibling'
  const sibling = current.parentElement.parentElement[s]
  if (sibling) {
    // 选中兄弟节点
    mei.selectNode(sibling.firstChild.firstChild)
  }
}

/**
 * 功能详细描述: 
 * 处理缩放操作，支持放大和缩小两种模式。
 * 输入参数解析: 
 * @param mei - MindElixirInstance实例，表示当前思维导图的状态。
 * @param direction - 缩放方向，值为'in'或'out'。
 * @param factor - 缩放因子，默认值为1。
 * 异常处理机制: 
 * 如果缩放超出限制范围，则不会执行任何操作。
 */
const handleZoom = function (mei: MindElixirInstance, direction: 'in' | 'out', factor = 1) {
  switch (direction) {
    case 'in':
      // 放大操作，限制最大缩放比例
      if (mei.scaleVal * factor > 1.6) return
      mei.scale((mei.scaleVal += 0.2))
      break
    case 'out':
      // 缩小操作，限制最小缩放比例
      if (mei.scaleVal * factor < 0.6) return
      mei.scale((mei.scaleVal -= 0.2))
  }
}

export default function (mind: MindElixirInstance) {
  /**
   * 功能详细描述: 
   * 处理删除操作，根据当前选中的内容类型（箭头、摘要、节点）执行相应的删除逻辑。
   * 异常处理机制: 
   * 如果未选中任何内容，则不会执行任何操作。
   */
  const handleRemove = () => {
    if (mind.currentArrow) mind.removeArrow()
    else if (mind.currentSummary) mind.removeSummary(mind.currentSummary.summaryObj.id)
    else if (mind.currentNode) {
      mind.removeNode()
    } else if (mind.currentNodes) {
      mind.removeNodes(mind.currentNodes)
    }
  }

  // 定义按键与功能的映射关系
  const key2func: Record<string, (e: KeyboardEvent) => void> = {
    Enter: e => {
      // 插入新节点，支持三种模式：前置兄弟节点、父节点、后置兄弟节点
      if (e.shiftKey) {
        mind.insertSibling('before')
      } else if (e.ctrlKey) {
        mind.insertParent()
      } else {
        mind.insertSibling('after')
      }
    },
    Tab: () => {
      // 添加子节点
      mind.addChild()
    },
    F1: () => {
      // 将视图居中
      mind.toCenter()
    },
    F2: () => {
      // 开始编辑当前节点
      mind.beginEdit()
    },
    ArrowUp: e => {
      // 向上移动节点或选择上一个兄弟节点
      if (e.altKey) {
        mind.moveUpNode()
      } else if (e.metaKey || e.ctrlKey) {
        return mind.initSide()
      } else {
        handlePrevNext(mind, 'previous')
      }
    },
    ArrowDown: e => {
      // 向下移动节点或选择下一个兄弟节点
      if (e.altKey) {
        mind.moveDownNode()
      } else {
        handlePrevNext(mind, 'next')
      }
    },
    ArrowLeft: e => {
      // 向左移动节点或处理左侧方向键逻辑
      if (e.metaKey || e.ctrlKey) {
        return mind.initLeft()
      }
      handleLeftRight(mind, DirectionClass.LHS)
    },
    ArrowRight: e => {
      // 向右移动节点或处理右侧方向键逻辑
      if (e.metaKey || e.ctrlKey) {
        return mind.initRight()
      }
      handleLeftRight(mind, DirectionClass.RHS)
    },
    PageUp: () => {
      // 向上移动节点
      return mind.moveUpNode()
    },
    PageDown: () => {
      // 向下移动节点
      mind.moveDownNode()
    },
    c: (e: KeyboardEvent) => {
      // 复制节点到剪贴板
      if (e.metaKey || e.ctrlKey) {
        if (mind.currentNode) mind.waitCopy = [mind.currentNode]
        else if (mind.currentNodes) mind.waitCopy = mind.currentNodes
      }
    },
    x: (e: KeyboardEvent) => {
      // 剪切节点到剪贴板并删除原节点
      if (e.metaKey || e.ctrlKey) {
        if (mind.currentNode) mind.waitCopy = [mind.currentNode]
        else if (mind.currentNodes) mind.waitCopy = mind.currentNodes
        handleRemove()
      }
    },
    v: (e: KeyboardEvent) => {
      // 粘贴剪贴板中的节点到当前节点
      if (!mind.waitCopy || !mind.currentNode) return
      if (e.metaKey || e.ctrlKey) {
        if (mind.waitCopy.length === 1) {
          mind.copyNode(mind.waitCopy[0], mind.currentNode)
        } else {
          mind.copyNodes(mind.waitCopy, mind.currentNode)
        }
      }
    },
    '+': (e: KeyboardEvent) => {
      // 放大视图
      if (e.metaKey || e.ctrlKey) {
        handleZoom(mind, 'in')
      }
    },
    '-': (e: KeyboardEvent) => {
      // 缩小视图
      if (e.metaKey || e.ctrlKey) {
        handleZoom(mind, 'out')
      }
    },
    '0': (e: KeyboardEvent) => {
      // 恢复默认缩放比例
      if (e.metaKey || e.ctrlKey) {
        mind.scale(1)
      }
    },
    Delete: handleRemove,
    Backspace: handleRemove,
  }

  // 绑定键盘事件监听器
  mind.map.onkeydown = e => {
    e.preventDefault()
    if (!mind.editable) return
    // 如果焦点不在当前元素上，则忽略事件
    if (e.target !== e.currentTarget) {
      return
    }
    // 根据按键调用对应的功能函数
    const keyHandler = key2func[e.key]
    keyHandler && keyHandler(e)
  }

  // 绑定鼠标滚轮事件监听器
  mind.map.onwheel = e => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      // 根据滚轮方向调整缩放比例
      const factor = Math.abs(e.deltaY / 100) // this can be tweaked
      if (e.deltaY < 0) handleZoom(mind, 'in', factor)
      else if (mind.scaleVal - 0.2 > 0) handleZoom(mind, 'out', factor)
      e.stopPropagation()
    }
  }
}