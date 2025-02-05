/**
 * @file linkDiv.ts
 * @description 管理和生成思维导图节点之间的链接的模块，使用 SVG 连线的方式实现节点的连接。
 * @usage 主要用于思维导图渲染场景，包含节点主分支、子分支及自定义链接的绘制功能。模块支持更新特定节点的链接结构。
 */

import { createPath, createLinkSvg } from './utils/svg'
import { getOffsetLT } from './utils/index'
import type { Wrapper, Topic } from './types/dom'
import { DirectionClass, type MindElixirInstance } from './types/index'

/**
 * 根据节点数据生成和更新思维导图的连线结构。
 * 如果指定了 `mainNode`，会只重新生成该节点的分支链接。
 * 
 * 功能流程：
 * 1. 生成主分支链接。
 * 2. 为主节点内的子节点生成链接；如果指定了 `mainNode`，仅为特定节点生成子链接。
 * 3. 生成自定义链接。
 * 4. 生成总结部分的链接。
 *
 * @param {Wrapper} [mainNode] 可选参数，如果传入则重新渲染特定主节点的子链接。
 */
const linkDiv = function (this: MindElixirInstance, mainNode?: Wrapper) {
  console.time('linkDiv') // 计时器，用于衡量性能

  // 获取根节点的位置和尺寸信息
  const root = this.map.querySelector('me-root') as HTMLElement
  const pT = root.offsetTop
  const pL = root.offsetLeft
  const pW = root.offsetWidth
  const pH = root.offsetHeight

  // 设置中心点的位置
  this.nodes.style.top = `${10000 - this.nodes.offsetHeight / 2}px`
  this.nodes.style.left = `${10000 - pL - pW / 2}px`

  const mainNodeList = this.map.querySelectorAll('me-main > me-wrapper') // 获取所有主节点
  this.lines.innerHTML = '' // 清空线条容器的内容

  for (let i = 0; i < mainNodeList.length; i++) {
    const el = mainNodeList[i] as Wrapper
    const tpc = el.querySelector<Topic>('me-tpc') as Topic
    const { offsetLeft: cL, offsetTop: cT } = getOffsetLT(this.nodes, tpc)
    const cW = tpc.offsetWidth
    const cH = tpc.offsetHeight
    const direction = el.parentNode.className as DirectionClass

    // 生成主分支路径
    const mainPath = this.generateMainBranch({ pT, pL, pW, pH, cT, cL, cW, cH, direction, containerHeight: this.nodes.offsetHeight })
    const palette = this.theme.palette
    const branchColor = tpc.nodeObj.branchColor || palette[i % palette.length]
    tpc.style.borderColor = branchColor // 设置节点边框颜色
    this.lines.appendChild(createPath(mainPath, branchColor, '3')) // 添加主分支路径

    // 设置主节点展开按钮的位置
    const expander = el.children[0].children[1]
    if (expander) {
      expander.style.top = (expander.parentNode.offsetHeight - expander.offsetHeight) / 2 + 'px'
      if (direction === DirectionClass.LHS) {
        expander.style.left = -10 + 'px'
      } else {
        expander.style.right = -10 + 'px'
      }
    }

    // 如果指定了 mainNode 且不是当前节点，跳过子节点生成
    if (mainNode && mainNode !== el) {
      continue
    }

    const svg = createLinkSvg('subLines')
    const svgLine = el.lastChild as SVGSVGElement
    if (svgLine.tagName === 'svg') svgLine.remove() // 如果已有子分支连线 SVG，先移除
    el.appendChild(svg) // 添加新的子分支连线 SVG 容器

    // 递归生成子节点连接线
    traverseChildren(this, svg, branchColor, el, direction, true)
  }

  this.renderArrow() // 渲染箭头
  this.renderSummary() // 渲染总结节点
  console.timeEnd('linkDiv') // 结束计时
  this.bus.fire('linkDiv') // 触发事件，告知其他模块连线更新完成
}

/**
 * 递归生成子节点的链接。
 * 
 * @param {MindElixirInstance} mei 当前 MindElixir 实例。
 * @param {SVGSVGElement} svgContainer 用于存放连线的 SVG 容器。
 * @param {string} branchColor 当前分支颜色。
 * @param {Wrapper} wrapper 当前子节点容器。
 * @param {DirectionClass} direction 分支方向，左右分支通过此区分。
 * @param {boolean} [isFirst] 是否为第一个节点，用于分支样式适配。
 */
const traverseChildren = function (
  mei: MindElixirInstance,
  svgContainer: SVGSVGElement,
  branchColor: string,
  wrapper: Wrapper,
  direction: DirectionClass,
  isFirst?: boolean
) {
  const parent = wrapper.firstChild // 获取当前节点的父元素
  const children = wrapper.children[1].children // 获取当前节点的所有子节点
  if (children.length === 0) return // 如果没有子节点，终止递归

  const pT = parent.offsetTop
  const pL = parent.offsetLeft
  const pW = parent.offsetWidth
  const pH = parent.offsetHeight

  // 遍历所有子节点
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const childP = child.firstChild
    const cT = childP.offsetTop
    const cL = childP.offsetLeft
    const cW = childP.offsetWidth
    const cH = childP.offsetHeight

    const bc = childP.firstChild.nodeObj.branchColor || branchColor // 使用自主定义的分支颜色或继承父分支颜色
    const path = mei.generateSubBranch({ pT, pL, pW, pH, cT, cL, cW, cH, direction, isFirst }) // 生成子分支路径
    svgContainer.appendChild(createPath(path, bc, '2')) // 将路径添加到 SVG 容器中

    const expander = childP.children[1]

    if (expander) {
      // 设置展开按钮的位置
      expander.style.bottom = -(expander.offsetHeight / 2) + 'px'
      if (direction === DirectionClass.LHS) {
        expander.style.left = 10 + 'px'
      } else if (direction === DirectionClass.RHS) {
        expander.style.right = 10 + 'px'
      }
      // 如果当前节点未展开，跳过递归
      if (!expander.expanded) continue
    } else {
      // 如果不存在展开按钮，跳过递归
      continue
    }

    // 递归处理当前子节点
    traverseChildren(mei, svgContainer, bc, child, direction)
  }
}

export default linkDiv