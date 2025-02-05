// import type { Trigger } from '@viselect/vanilla'
import SelectionArea from '@viselect/vanilla'
import type { MindElixirInstance, Topic } from '..'
import dragMoveHelper from '../utils/dragMoveHelper'
import { Trigger } from '@viselect/vanilla/dist/src/utils/matchesTrigger' //monorepo compatibility

/**
 * 通过此方法为 MindElixirInstance 实例添加鼠标框选功能。
 * 核心功能包括：
 * 1. 使用 @viselect/vanilla 库实现鼠标选择区域功能
 * 2. 自定义选择行为及视觉样式
 * 3. 处理选择事件并与 MindElixir 的节点选择功能联动
 *
 * @param mei {MindElixirInstance} - MindElixir 脑图实例
 */
export default function (mei: MindElixirInstance) {
  // 配置鼠标触发方式，默认左键 (0)，右键触发时值为 2
  const triggers: Trigger[] = mei.mouseSelectionButton === 2 ? [2] : [0]

  // 配置 SelectionArea 实例，绑定选择器和行为
  const selection = new SelectionArea({
    selectables: ['.map-container me-tpc'], // 允许被选择的节点
    boundaries: [mei.container],           // 限定选择范围的边界
    container: mei.selectionContainer,     // 用于展示选择框的容器
    behaviour: {
      triggers,
      // 滚动行为的配置
      scrolling: {
        speedDivider: 10, // 滚动速度分割因子，值越高速度越慢
        manualSpeed: 750, // 手动滚动速度的分子值，用于计算像素移动量
        startScrollMargins: { x: 10, y: 10 }, // 滚动触发的虚拟边缘
      },
    },
  })
    // 事件：选择开始前
    .on('beforestart', ({ event }) => {
      /**
       * 如果鼠标事件的目标为特定元素，则禁止框选操作：
       * 1. 节点本身（ME-TPC 元素）
       * 2. 输入框（id 为 input-box 的元素）
       * 3. 圆形（class 为 circle 的元素）
       */
      if (((event as MouseEvent).target as Topic).tagName === 'ME-TPC') return false
      if (((event as MouseEvent).target as HTMLElement).id === 'input-box') return false
      if (((event as MouseEvent).target as HTMLElement).className === 'circle') return false

      // 设置选择框的样式
      const selectionAreaElement = selection.getSelectionArea()
      selectionAreaElement.style.background = '#4f90f22d' // 半透明蓝色背景
      selectionAreaElement.style.border = '1px solid #4f90f2' // 描边为蓝色实线
      if (selectionAreaElement.parentElement) {
        selectionAreaElement.parentElement.style.zIndex = '9999' // 提高选择框容器的显示优先级
      }
      return true
    })
    // 事件：选择开始
    .on('start', ({ event }) => {
      // 如果未按下 'Ctrl' 或 'Meta' 键，清除当前选择状态
      if (!(event as MouseEvent).ctrlKey && !(event as MouseEvent).metaKey) {
        mei.clearSelection()           // 清除脑图实例中的选择状态
        selection.clearSelection(true, true) // 清除选择框的选择状态
      }
    })
    // 事件：选择框移动
    .on(
      'move',
      ({
        store: {
          changed: { added, removed }, // 新增和移除的选择项
        },
      }) => {
        dragMoveHelper.moved = true // 标记当前为拖动操作
        for (const el of added) {
          el.classList.add('selected') // 为新增项添加 'selected' 样式
        }
        for (const el of removed) {
          el.classList.remove('selected') // 从移除项中删除 'selected' 样式
        }
      }
    )
    // 事件：选择结束
    .on('stop', ({ store: { stored } }) => {
      // 将存储的已选元素同步到脑图实例的选择状态
      mei.selectNodes(stored as Topic[])
    })

  // 将 SelectionArea 实例赋值回 MindElixir 实例中，以支持后续操作
  mei.selection = selection
}