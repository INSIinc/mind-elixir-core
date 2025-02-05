/**
 * @文件功能描述
 * 该模块用于处理思维导图的鼠标事件，包括单击、双击、拖动等操作。
 * 通过监听鼠标事件对思维导图的节点进行操作，例如选择、展开、编辑、拖动等。
 * 
 * @使用场景
 * 适用于需要通过鼠标交互操作思维导图的场景。
 */

import type { SummarySvgGroup } from './summary'
import type { Expander, CustomSvg } from './types/dom'
import type { MindElixirInstance } from './types/index'
import { isTopic } from './utils'
import dragMoveHelper from './utils/dragMoveHelper'

export default function (mind: MindElixirInstance) {
  // 监听鼠标的单击事件
  mind.map.addEventListener('click', e => {
    if (e.button !== 0) return // 仅处理左键点击事件
    if (mind.helper1?.moved) { // 如果helper1已被移动，则清除其状态
      mind.helper1.clear()
      return
    }
    if (mind.helper2?.moved) { // 如果helper2已被移动，则清除其状态
      mind.helper2.clear()
      return
    }
    if (dragMoveHelper.moved) { // 如果拖动助手已被移动，则清除其状态
      dragMoveHelper.clear()
      return
    }
    mind.clearSelection() // 清楚当前选择
    // e.preventDefault() // 可以导致<a />标签失效
    const target = e.target as HTMLElement
    if (target.tagName === 'ME-EPD') { // 如果点击的是展开按钮
      mind.expandNode((target as Expander).previousSibling)
    } else if (isTopic(target)) { // 如果点击的是主题
      mind.selectNode(target, false, e)
    } else if (!mind.editable) { // 如果思维导图不可编辑，则返回
      return
    } else if (target.tagName === 'text') {
      if (target.dataset.type === 'custom-link') { // 如果点击的是自定义链接
        mind.selectArrow(target.parentElement as unknown as CustomSvg)
      } else { // 如果点击的是总结
        mind.selectSummary(target.parentElement as unknown as SummarySvgGroup)
      }
    } else if (target.className === 'circle') {
      // 忽略点击圆圈的事件
    }
  })

  // 监听鼠标的双击事件
  mind.map.addEventListener('dblclick', e => {
    if (!mind.editable) return // 如果思维导图不可编辑，则返回
    const target = e.target as HTMLElement
    if (isTopic(target)) { // 如果双击的是主题
      mind.beginEdit(target)
    } else if (target.tagName === 'text') {
      if (target.dataset.type === 'custom-link') {  // 如果双击的是自定义链接
        mind.editArrowLabel(target.parentElement as unknown as CustomSvg)
      } else { // 如果双击的是总结
        mind.editSummary(target.parentElement as unknown as SummarySvgGroup)
      }
    }
  })

  /**
   * 监听鼠标的移动事件，用于拖动地图
   */
  mind.map.addEventListener('mousemove', e => {
    // 在Windows的Chrome中，单击事件会触发mousemove
    if ((e.target as HTMLElement).contentEditable !== 'true') {
      dragMoveHelper.onMove(e, mind.container) // 调用拖动助手的移动方法
    }
  })
  mind.map.addEventListener('mousedown', e => {
    const mouseMoveButton = mind.mouseSelectionButton === 0 ? 2 : 0 // 确定用于鼠标移动的按钮
    if (e.button !== mouseMoveButton) return
    if ((e.target as HTMLElement).contentEditable !== 'true') {
      dragMoveHelper.moved = false // 重置移动状态
      dragMoveHelper.mousedown = true // 设置鼠标按下状态
    }
  })
  mind.map.addEventListener('mouseleave', e => {
    const mouseMoveButton = mind.mouseSelectionButton === 0 ? 2 : 0
    if (e.button !== mouseMoveButton) return
    dragMoveHelper.clear() // 清除拖动状态
  })
  mind.map.addEventListener('mouseup', e => {
    const mouseMoveButton = mind.mouseSelectionButton === 0 ? 2 : 0
    if (e.button !== mouseMoveButton) return
    dragMoveHelper.clear() // 清除拖动状态
  })
}
