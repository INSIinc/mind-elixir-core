// 文件：src/utils/domManipulation.ts
// 功能描述：
// 本模块封装了一些与 DOM 操作相关的实用函数，用于操控思维导图节点的 DOM 结构。
// 使用场景：主要用于操作 MindElixir 思维导图框架的 DOM 节点，包括增加子节点、移除节点和判断方向等。

import { fillParent } from '.'
import { LEFT, RIGHT, SIDE } from '../const'
import { rmSubline } from '../nodeOperation'
import type { MindElixirInstance, NodeObj } from '../types'
import type { Topic, Wrapper } from '../types/dom'
import { findEle, createExpander } from './dom'

/**
 * 函数：judgeDirection
 * 功能：
 * 根据给定的方向参数和节点对象，判断新添加的节点应位于思维导图的左侧、右侧或根据平衡规则自动分配。
 * 
 * @param direction - 节点的方向参数，可以是 LEFT、RIGHT 或 SIDE。
 * @param obj - 当前操作的节点对象，类型为 NodeObj，用于存储节点的元信息。
 * @returns {number} 返回确定的方向值（LEFT 或 RIGHT）。
 */
export const judgeDirection = function (direction: number, obj: NodeObj) {
  if (direction === LEFT) {
    return LEFT
  } else if (direction === RIGHT) {
    return RIGHT
  } else if (direction === SIDE) {
    // 获取左侧和右侧子节点的数量，以决定新节点应该添加在哪一侧
    const l = document.querySelector('.lhs')?.childElementCount || 0
    const r = document.querySelector('.rhs')?.childElementCount || 0
    if (l <= r) {
      obj.direction = LEFT // 更新节点对象的方向属性为左侧
      return LEFT
    } else {
      obj.direction = RIGHT // 更新节点对象的方向属性为右侧
      return RIGHT
    }
  }
}

/**
 * 函数：addChildDom
 * 功能：
 * 在指定的父节点 DOM 结构中添加子节点，并根据逻辑更新其结构。
 * 
 * @param mei - MindElixir 实例，用于操控思维导图的全局操作上下文。
 * @param to - 目标父节点，类型为 Topic，表示新的子节点将挂载的 DOM 节点。
 * @param wrapper - 子节点外层的包装元素，包含实际子节点 DOM。
 */
export const addChildDom = function (mei: MindElixirInstance, to: Topic, wrapper: Wrapper) {
  const tpc = wrapper.children[0].children[0] // 获取子节点 DOM 中的 Topic 元素
  const top = to.parentElement // 父级 DOM 元素

  if (top.tagName === 'ME-PARENT') {
    // 如果当前父节点是普通父级节点（非根节点）
    rmSubline(tpc) // 删除子节点连线
    if (top.children[1]) {
      // 如果父节点有子节点容器，将新节点直接追加到该容器
      top.nextSibling.appendChild(wrapper)
    } else {
      // 如果没有子容器，需要创建一个子节点容器并添加展开按钮
      const c = mei.createChildren([wrapper])
      top.appendChild(createExpander(true))
      top.insertAdjacentElement('afterend', c)
    }
    // 更新连线
    mei.linkDiv(wrapper.offsetParent as Wrapper)
  } else if (top.tagName === 'ME-ROOT') {
    // 如果父节点是根节点
    const direction = judgeDirection(mei.direction, tpc.nodeObj) // 判断节点方向
    if (direction === LEFT) {
      mei.container.querySelector('.lhs')?.appendChild(wrapper) // 添加到左侧容器
    } else {
      mei.container.querySelector('.rhs')?.appendChild(wrapper) // 添加到右侧容器
    }
    // 更新全局连线
    mei.linkDiv()
  }
}

/**
 * 函数：removeNodeDom
 * 功能：
 * 从思维导图中移除指定节点及其相关 DOM 元素。
 * 
 * @param tpc - 要移除的子节点，类型为 Topic。
 * @param siblingLength - 当前节点的兄弟节点数量，用于判断是否需要移除展开按钮。
 */
export const removeNodeDom = function (tpc: Topic, siblingLength: number) {
  const p = tpc.parentNode // 获取当前节点的父节点
  if (siblingLength === 0) {
    // 当兄弟节点数量为 0 时，需要移除父节点的展开按钮
    const c = p.parentNode.parentNode
    if (c.tagName !== 'ME-MAIN') {
      // 如果父节点不是根节点，删除展开按钮
      c.previousSibling.children[1]!.remove()
    }
  }
  // 移除当前节点的父节点 DOM
  p.parentNode.remove()
}