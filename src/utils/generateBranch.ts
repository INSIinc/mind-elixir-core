import type { MindElixirInstance } from '..'
import { DirectionClass } from '..'

/**
 * 本模块主要用于生成思维导图中主分支和子分支的 SVG 路径数据。
 * 使用场景：
 * - 在思维导图中动态绘制连接节点的曲线。
 * - 根据节点的方向及位置计算曲线路径。
 */

export interface MainLineParams {
  pT: number // 父节点的顶部坐标
  pL: number // 父节点的左侧坐标
  pW: number // 父节点的宽度
  pH: number // 父节点的高度
  cT: number // 子节点的顶部坐标
  cL: number // 子节点的左侧坐标
  cW: number // 子节点的宽度
  cH: number // 子节点的高度
  direction: DirectionClass // 节点的方向（左侧或右侧）
  containerHeight: number // 当前视图的容器高度
}

export interface SubLineParams {
  pT: number // 父节点的顶部坐标
  pL: number // 父节点的左侧坐标
  pW: number // 父节点的宽度
  pH: number // 父节点的高度
  cT: number // 子节点的顶部坐标
  cL: number // 子节点的左侧坐标
  cW: number // 子节点的宽度
  cH: number // 子节点的高度
  direction: DirectionClass // 节点的方向（左侧或右侧）
  isFirst: boolean | undefined // 当前子节点是否为第一个子节点
}

// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d#path_commands

/**
 * 生成主分支的曲线路径。
 * @param {MainLineParams} 参数对象，包含父节点和子节点的位置信息及方向。
 * @returns {string} 返回 SVG 路径命令字符串，用于绘制主分支的连接曲线。
 */
export function main({ pT, pL, pW, pH, cT, cL, cW, cH, direction, containerHeight }: MainLineParams) {
  let x1 = pL + pW / 2 // 父节点的 x 坐标（中心点）
  const y1 = pT + pH / 2 // 父节点的 y 坐标（中心点）
  let x2
  if (direction === DirectionClass.LHS) {
    x2 = cL + cW // 子节点的右侧（左侧分支的连接点）
  } else {
    x2 = cL // 子节点的左侧（右侧分支的连接点）
  }
  const y2 = cT + cH / 2 // 子节点的 y 坐标（中心点）

  // 根据父子节点的垂直距离计算曲线的偏移量
  const pct = Math.abs(y2 - y1) / containerHeight // 计算父子节点距离占容器高度的百分比
  const offset = (1 - pct) * 0.25 * (pW / 2) // 距离越近，偏移量越大

  if (direction === DirectionClass.LHS) {
    x1 = x1 - pW / 10 - offset // 左侧分支调整 x 坐标
  } else {
    x1 = x1 + pW / 10 + offset // 右侧分支调整 x 坐标
  }

  // 返回二次贝塞尔曲线的路径
  return `M ${x1} ${y1} Q ${x1} ${y2} ${x2} ${y2}`
}

/**
 * 生成子分支的曲线路径。
 * @param {SubLineParams} 参数对象，包含父节点和子节点的位置信息、方向及是否为第一个子节点。
 * @returns {string} 返回 SVG 路径命令字符串，用于绘制子分支的连接曲线。
 */
export function sub(this: MindElixirInstance, { pT, pL, pW, pH, cT, cL, cW, cH, direction, isFirst }: SubLineParams) {
  const GAP = parseInt(this.mindElixirBox.style.getPropertyValue('--gap')) // 从样式中获取 GAP 大小
  // const GAP = 30 // 或使用默认值（如 30 像素）
  let y1 = 0
  let end = 0

  if (isFirst) {
    y1 = pT + pH / 2 // 如果是第一个子节点，连接父节点的中心
  } else {
    y1 = pT + pH // 否则连接父节点的底部
  }

  const y2 = cT + cH // 子节点的底部 y 坐标
  let x1 = 0
  let x2 = 0
  let xMid = 0

  // 偏移量与父子节点的垂直距离相关
  const offset = (Math.abs(y1 - y2) / 300) * GAP

  if (direction === DirectionClass.LHS) {
    // 左侧分支的路径计算
    xMid = pL
    x1 = xMid + GAP // 父节点曲线的起点
    x2 = xMid - GAP // 子节点曲线的终点
    end = cL + GAP  // 子节点的最终水平线连接处
    return `M ${x1} ${y1} C ${xMid} ${y1} ${xMid + offset} ${y2} ${x2} ${y2} H ${end}`
  } else {
    // 右侧分支的路径计算
    xMid = pL + pW
    x1 = xMid - GAP // 父节点曲线的起点
    x2 = xMid + GAP // 子节点曲线的终点
    end = cL + cW - GAP // 子节点的最终水平线连接处
    return `M ${x1} ${y1} C ${xMid} ${y1} ${xMid - offset} ${y2} ${x2} ${y2} H ${end}`
  }
}