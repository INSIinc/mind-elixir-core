import type { Topic } from '../types/dom'
import type { NodeObj, MindElixirInstance, NodeObjExport } from '../types/index'

/**
 * 将字符串中的特殊HTML字符进行编码，避免HTML注入攻击
 * @param s - 需要编码的字符串
 * @returns 编码后的字符串
 */
export function encodeHTML(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
}

/**
 * 判断当前设备是否为移动设备
 * @returns 如果是移动设备返回true，否则返回false
 */
export const isMobile = (): boolean => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

/**
 * 根据节点ID在指定的数据树中查找节点对象
 * @param id - 节点ID
 * @param data - 节点数据树
 * @returns 如果找到匹配的节点则返回节点对象，否则返回null
 */
export const getObjById = function (id: string, data: NodeObj): NodeObj | null {
  if (data.id === id) {
    return data
  } else if (data.children && data.children.length) {
    for (let i = 0; i < data.children.length; i++) {
      const res = getObjById(id, data.children[i])
      if (res) return res
    }
    return null
  } else {
    return null
  }
}

/**
 * 给数据树中的每个节点添加父节点属性
 * @param data - 当前节点
 * @param parent - 父节点
 */
export const fillParent = (data: NodeObj, parent?: NodeObj) => {
  data.parent = parent
  if (data.children) {
    for (let i = 0; i < data.children.length; i++) {
      fillParent(data.children[i], data)
    }
  }
}

/**
 * 刷新数据树中每个节点的ID为新的UUID
 * @param data - 当前节点
 */
export function refreshIds(data: NodeObj) {
  data.id = generateUUID()
  if (data.children) {
    for (let i = 0; i < data.children.length; i++) {
      refreshIds(data.children[i])
    }
  }
}

/**
 * 函数节流，限制函数在特定时间间隔内只能被调用一次
 * @param fn - 需要节流的函数
 * @param wait - 时间间隔，毫秒
 * @returns 包装后的节流函数
 */
export const throttle = <T extends (...args: never[]) => void>(fn: T, wait: number) => {
  let pre = Date.now()
  return function (...args: Parameters<T>) {
    const now = Date.now()
    if (now - pre < wait) return
    fn(...args)
    pre = Date.now()
  }
}

/**
 * 获取箭头的两个端点坐标
 * @param p3x - 第一个点的x坐标
 * @param p3y - 第一个点的y坐标
 * @param p4x - 第二个点的x坐标
 * @param p4y - 第二个点的y坐标
 * @returns 箭头端点的坐标对象
 */
export function getArrowPoints(p3x: number, p3y: number, p4x: number, p4y: number) {
  const deltay = p4y - p3y
  const deltax = p3x - p4x
  let angle = (Math.atan(Math.abs(deltay) / Math.abs(deltax)) / 3.14) * 180
  if (deltax < 0 && deltay > 0) {
    angle = 180 - angle
  }
  if (deltax < 0 && deltay < 0) {
    angle = 180 + angle
  }
  if (deltax > 0 && deltay < 0) {
    angle = 360 - angle
  }
  const arrowLength = 15
  const arrowAngle = 30
  const a1 = angle + arrowAngle
  const a2 = angle - arrowAngle
  return {
    x1: p4x + Math.cos((Math.PI * a1) / 180) * arrowLength,
    y1: p4y - Math.sin((Math.PI * a1) / 180) * arrowLength,
    x2: p4x + Math.cos((Math.PI * a2) / 180) * arrowLength,
    y2: p4y - Math.sin((Math.PI * a2) / 180) * arrowLength,
  }
}

/**
 * 生成一个新的UUID
 * @returns UUID字符串
 */
export function generateUUID(): string {
  return (new Date().getTime().toString(16) + Math.random().toString(16).substr(2)).substr(2, 16)
}

/**
 * 在MindElixir实例中生成一个新的节点对象
 * @returns 新的节点对象
 */
export const generateNewObj = function (this: MindElixirInstance): NodeObjExport {
  const id = generateUUID()
  return {
    topic: this.newTopicName,
    id,
  }
}

/**
 * 检查节点移动是否合法，防止出现循环引用
 * @param from - 被移动的节点
 * @param to - 目标父节点
 * @returns 如果移动合法则返回true，否则返回false
 */
export function checkMoveValid(from: NodeObj, to: NodeObj) {
  let valid = true
  while (to.parent) {
    if (to.parent === from) {
      valid = false
      break
    }
    to = to.parent
  }
  return valid
}

/**
 * 深度克隆一个节点对象
 * @param obj - 要克隆的节点对象
 * @returns 克隆后的新对象
 */
export function deepClone(obj: NodeObj) {
  const deepCloneObj = JSON.parse(
    JSON.stringify(obj, (k, v) => {
      if (k === 'parent') return undefined
      return v
    })
  )
  return deepCloneObj
}

/**
 * 获取子元素相对于父元素的左上角的偏移量
 * @param parent - 父元素
 * @param child - 子元素
 * @returns 子元素相对于父元素的偏移对象
 */
export const getOffsetLT = (parent: HTMLElement, child: HTMLElement) => {
  let offsetLeft = 0
  let offsetTop = 0
  while (child && child !== parent) {
    offsetLeft += child.offsetLeft
    offsetTop += child.offsetTop
    child = child.offsetParent as HTMLElement
  }
  return { offsetLeft, offsetTop }
}

/**
 * 设置HTML元素或SVG元素的多个属性
 * @param el - 元素对象
 * @param attrs - 属性键值对对象
 */
export const setAttributes = (el: HTMLElement | SVGElement, attrs: { [key: string]: string }) => {
  for (const key in attrs) {
    el.setAttribute(key, attrs[key])
  }
}

/**
 * 判断目标元素是否为主题节点
 * @param target - 目标元素
 * @returns 如果是主题节点返回true，否则返回false
 */
export const isTopic = (target?: HTMLElement): target is Topic => {
  return target ? target.tagName === 'ME-TPC' : false
}

/**
 * 合并主题节点，排除父子关系的节点
 * @param nodes - 主题节点数组
 * @returns 只包含独立主题节点的新数组
 */
export const unionTopics = (nodes: Topic[]) => {
  return nodes.filter(node => {
    for (let i = 0; i < nodes.length; i++) {
      if (node === nodes[i]) continue
      const parent = nodes[i].parentElement.parentElement
      if (parent.contains(node)) {
        return false
      }
    }
    return true
  })
}
