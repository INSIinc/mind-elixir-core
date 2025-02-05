import { LEFT, RIGHT, SIDE } from '../const'
import type { Children } from '../types/dom'
import { DirectionClass, type MindElixirInstance, type NodeObj } from '../types/index'
import { shapeTpc } from './dom'

const $d = document

/**
 * 布局相关的工具函数模块
 * 功能描述:
 * - 负责思维导图节点的布局与排版
 * - 包括根节点和子节点的方向与位置计算
 * 使用场景:
 * - 自动生成思维导图时调用
 * - 在修改节点数据后重新计算布局
 */

/**
 * 设置根节点的主要分支方向，并对每个主节点调用子节点布局函数
 * 
 * @this {MindElixirInstance} - MindElixir 实例上下文
 */
export const layout = function (this: MindElixirInstance) {
  console.time('layout') // [调试] 开始计时以分析布局方法耗时
  this.nodes.innerHTML = '' // 清空节点容器以重新布局

  const tpc = this.createTopic(this.nodeData) // 创建根节点的主题元素
  shapeTpc(tpc, this.nodeData) // 为根节点主题元素设置样式
  tpc.draggable = false // 禁用根节点的拖拽操作
  const root = $d.createElement('me-root') // 创建根节点容器
  root.appendChild(tpc) // 将根节点的主题元素添加到容器中

  const mainNodes = this.nodeData.children || [] // 获取根节点的主分支
  if (this.direction === SIDE) {
    // 侧向布局时，初始化主节点的方向
    let lcount = 0 // 左侧节点计数
    let rcount = 0 // 右侧节点计数
    mainNodes.map(node => {
      if (node.direction === LEFT) {
        lcount += 1
      } else if (node.direction === RIGHT) {
        rcount += 1
      } else {
        // 动态分配方向以保持左右平衡
        if (lcount <= rcount) {
          node.direction = LEFT
          lcount += 1
        } else {
          node.direction = RIGHT
          rcount += 1
        }
      }
    })
  }
  layoutMainNode(this, mainNodes, root) // 调用 layoutMainNode 进行主节点布局
  console.timeEnd('layout') // [调试] 输出布局方法耗时
}

/**
 * 布局根节点的主节点
 * 
 * 根据方向将主节点分配到左侧或右侧
 * 
 * @param mei {MindElixirInstance} - MindElixir 实例
 * @param data {NodeObj[]} - 主节点数据数组
 * @param root {HTMLElement} - 根节点 DOM 容器
 */
const layoutMainNode = function (mei: MindElixirInstance, data: NodeObj[], root: HTMLElement) {
  const leftPart = $d.createElement('me-main') // 左侧容器
  leftPart.className = DirectionClass.LHS // 设置左侧容器方向的样式
  const rightPart = $d.createElement('me-main') // 右侧容器
  rightPart.className = DirectionClass.RHS // 设置右侧容器方向的样式
  console.log(root)
  for (let i = 0; i < data.length; i++) {
    const nodeObj = data[i] // 当前主节点数据
    const { grp: w } = mei.createWrapper(nodeObj) // 创建主节点包装元素
    if (mei.direction === SIDE) {
      // 侧向布局时根据方向添加到左右对应容器
      if (nodeObj.direction === LEFT) {
        leftPart.appendChild(w)
      } else {
        rightPart.appendChild(w)
      }
    } else if (mei.direction === LEFT) {
      // 整体向左布局
      leftPart.appendChild(w)
    } else {
      // 整体向右布局
      rightPart.appendChild(w)
    }
  }

  // 将左右容器和根节点容器插入到最终的节点 DOM 中
  mei.nodes.appendChild(leftPart)
  mei.nodes.appendChild(root)
  mei.nodes.appendChild(rightPart)

  // 添加连线图层用于绘制节点间的连接线
  mei.nodes.appendChild(mei.lines)
}

/**
 * 布局子节点
 * 
 * @param mei {MindElixirInstance} - MindElixir 实例
 * @param data {NodeObj[]} - 子节点数据数组
 * @returns {Children} - 包含子节点 DOM 元素的容器
 */
export const layoutChildren = function (mei: MindElixirInstance, data: NodeObj[]) {
  const chldr = $d.createElement('me-children') as Children // 创建子节点容器
  for (let i = 0; i < data.length; i++) {
    const nodeObj = data[i] // 当前子节点数据
    const { grp } = mei.createWrapper(nodeObj) // 创建子节点包装元素
    chldr.appendChild(grp) // 将子节点添加到容器中
  }
  return chldr // 返回子节点容器
}