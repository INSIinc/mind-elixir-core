/**
 * @文件功能描述
 * 提供对树状结构中节点对象（NodeObj）进行操作的实用函数，包括节点的移动、插入、删除等。
 * @使用场景
 * 适合需要对树形结构的节点进行操作的场景，如组织结构图、文件夹树形结构等。
 */

import type { NodeObj } from '../types'

/**
 * @函数功能概述：获取节点的兄弟节点及其在兄弟节点中的索引。
 * @参数说明：
 *   - obj: 当前节点对象（NodeObj）。
 * @返回值：
 *   - siblings: 节点的兄弟节点数组（包含自身，如果有）。
 *   - index: 当前节点在兄弟节点数组中的索引。
 */
const getSibling = (obj: NodeObj): { siblings: NodeObj[] | undefined; index: number } => {
  // 获取节点的兄弟节点（即父节点的子节点）。
  const siblings = obj.parent?.children as NodeObj[]
  // 查找当前节点在兄弟节点数组中的位置，若找不到则默认为 0。
  const index = siblings?.indexOf(obj) ?? 0
  return { siblings, index }
}

/**
 * @函数功能概述：将当前节点在兄弟节点数组中向上移动一个位置，如果位于首位则循环到末位。
 * @参数说明：
 *   - obj: 当前需要移动的节点对象（NodeObj）。
 */
export function moveUpObj(obj: NodeObj) {
  const { siblings, index } = getSibling(obj)
  if (siblings === undefined) return
  const t = siblings[index]
  if (index === 0) {
    // 如果是第一个节点，则移到数组最后一个位置。
    siblings[index] = siblings[siblings.length - 1]
    siblings[siblings.length - 1] = t
  } else {
    // 将当前节点与前一个节点交换。
    siblings[index] = siblings[index - 1]
    siblings[index - 1] = t
  }
}

/**
 * @函数功能概述：将当前节点在兄弟节点数组中向下移动一个位置，如果位于末位则循环到首位。
 * @参数说明：
 *   - obj: 当前需要移动的节点对象（NodeObj）。
 */
export function moveDownObj(obj: NodeObj) {
  const { siblings, index } = getSibling(obj)
  if (siblings === undefined) return
  const t = siblings[index]
  if (index === siblings.length - 1) {
    // 如果是最后一个节点，则移到数组第一个位置。
    siblings[index] = siblings[0]
    siblings[0] = t
  } else {
    // 将当前节点与后一个节点交换。
    siblings[index] = siblings[index + 1]
    siblings[index + 1] = t
  }
}

/**
 * @函数功能概述：删除当前节点，并返回删除后兄弟节点数组的长度。
 * @参数说明：
 *   - obj: 要删除的节点对象（NodeObj）。
 * @返回值：
 *   - 删除后的兄弟节点数组的长度（number）。
 */
export function removeNodeObj(obj: NodeObj) {
  const { siblings, index } = getSibling(obj)
  if (siblings === undefined) return 0
  // 删除当前节点。
  siblings.splice(index, 1)
  return siblings.length
}

/**
 * @函数功能概述：在兄弟节点数组中插入一个新节点，可选择插入在当前节点的前或后。
 * @参数说明：
 *   - newObj: 要插入的新节点对象（NodeObj）。
 *   - type: 插入的方式（'before' 表示在前，'after' 表示在后）。
 *   - obj: 当前参考的节点对象（NodeObj）。
 */
export function insertNodeObj(newObj: NodeObj, type: 'before' | 'after', obj: NodeObj) {
  const { siblings, index } = getSibling(obj)
  if (siblings === undefined) return
  if (type === 'before') {
    // 在当前节点前插入新节点。
    siblings.splice(index, 0, newObj)
  } else {
    // 在当前节点后插入新节点。
    siblings.splice(index + 1, 0, newObj)
  }
}

/**
 * @函数功能概述：为当前节点插入一个新的父节点，并将当前节点设为该父节点的子节点。
 * @参数说明：
 *   - obj: 当前节点（NodeObj）。
 *   - newObj: 要插入的父节点对象（NodeObj）。
 */
export function insertParentNodeObj(obj: NodeObj, newObj: NodeObj) {
  const { siblings, index } = getSibling(obj)
  if (siblings === undefined) return
  // 用新父节点替换当前节点，同时将当前节点作为新父节点的子节点。
  siblings[index] = newObj
  newObj.children = [obj]
}

/**
 * @函数功能概述：将某节点移动到另一个节点的指定位置（内部、前或后）。
 * @参数说明：
 *   - type: 表示移动的方式（`in` 代表内部，`before` 或 `after` 代表在前或后）。
 *   - from: 要移动的节点对象（NodeObj）。
 *   - to: 目标节点对象（NodeObj）。
 */
export function moveNodeObj(type: 'in' | 'before' | 'after', from: NodeObj, to: NodeObj) {
  // 先移除节点。
  removeNodeObj(from)
  if (type === 'in') {
    // 将 `from` 节点作为 `to` 节点的子节点。
    if (to.children) to.children.push(from)
    else to.children = [from]
  } else {
    // 若需要调整 `from` 的方向，使其与目标节点一致。
    if (from.direction !== undefined) from.direction = to.direction
    const { siblings, index } = getSibling(to)
    if (siblings === undefined) return
    if (type === 'before') {
      // 将 `from` 节点插入到 `to` 节点之前。
      siblings.splice(index, 0, from)
    } else {
      // 将 `from` 节点插入到 `to` 节点之后。
      siblings.splice(index + 1, 0, from)
    }
  }
}