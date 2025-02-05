import type { MindElixirInstance } from '../types/index'
import './toolBar.less'

/**
 * 创建一个按钮组件
 * @param id 按钮的唯一标识符
 * @param name 图标的名称，对应 SVG 使用的图标名称
 * @returns 创建的按钮元素 `<span>`
 */
const createButton = (id: string, name: string) => {
  // 创建一个 `<span>` 元素，并为其设定 ID 与内嵌 SVG 图标
  const button = document.createElement('span')
  button.id = id
  button.innerHTML = `<svg class="icon" aria-hidden="true">
    <use xlink:href="#icon-${name}"></use>
  </svg>`
  return button
}

/**
 * 创建右下方工具栏的容器及其功能按钮，支持全屏、居中视图、缩放功能
 * @param mind MindElixir 实例，提供地图操作相关的接口
 * @returns 创建的右下工具栏容器
 */
function createToolBarRBContainer(mind: MindElixirInstance) {
  // 容器的初始化
  const toolBarRBContainer = document.createElement('div')
  // 创建工具栏按钮（全屏、居中、缩小、放大）
  const fc = createButton('fullscreen', 'full') // 全屏按钮
  const gc = createButton('toCenter', 'living') // 居中按钮
  const zo = createButton('zoomout', 'move') // 缩小按钮
  const zi = createButton('zoomin', 'add') // 放大按钮
  const percentage = document.createElement('span') // 可选百分比显示，目前未启用
  percentage.innerText = '100%'

  // 将按钮添加到容器
  toolBarRBContainer.appendChild(fc)
  toolBarRBContainer.appendChild(gc)
  toolBarRBContainer.appendChild(zo)
  toolBarRBContainer.appendChild(zi)
  // toolBarRBContainer.appendChild(percentage) // 被注释掉，未启用

  // 设置容器的样式类名，支持样式挂载
  toolBarRBContainer.className = 'mind-elixir-toolbar rb'

  // 绑定按钮事件
  fc.onclick = () => {
    // 点击全屏按钮，进入全屏模式
    mind.mindElixirBox.requestFullscreen()
  }
  gc.onclick = () => {
    // 点击居中按钮，将思维导图居中显示
    mind.toCenter()
  }
  zo.onclick = () => {
    // 点击缩小按钮，缩小视图，最小比例限制为 0.6
    if (mind.scaleVal < 0.6) return
    mind.scale(mind.scaleVal - 0.2)
  }
  zi.onclick = () => {
    // 点击放大按钮，放大视图，最大比例限制为 1.6
    if (mind.scaleVal > 1.6) return
    mind.scale(mind.scaleVal + 0.2)
  }

  return toolBarRBContainer
}

/**
 * 创建左上方工具栏的容器及其功能按钮，支持调整树图的方向布局（左侧、右侧、混合）
 * @param mind MindElixir 实例，提供地图方向切换接口
 * @returns 创建的左上工具栏容器
 */
function createToolBarLTContainer(mind: MindElixirInstance) {
  // 容器的初始化
  const toolBarLTContainer = document.createElement('div')
  // 创建工具栏按钮（左对齐、右对齐、侧对齐）
  const l = createButton('tbltl', 'left') // 左侧视图按钮
  const r = createButton('tbltr', 'right') // 右侧视图按钮
  const s = createButton('tblts', 'side') // 混合视图按钮

  // 将按钮添加到容器
  toolBarLTContainer.appendChild(l)
  toolBarLTContainer.appendChild(r)
  toolBarLTContainer.appendChild(s)

  // 设置容器的样式类名，支持样式挂载
  toolBarLTContainer.className = 'mind-elixir-toolbar lt'

  // 绑定按钮事件
  l.onclick = () => {
    // 点击左侧视图按钮，将思维导图调整为左侧布局
    mind.initLeft()
  }
  r.onclick = () => {
    // 点击右侧视图按钮，将思维导图调整为右侧布局
    mind.initRight()
  }
  s.onclick = () => {
    // 点击侧视图按钮，将思维导图调整为混合布局（既有左侧，又有右侧）
    mind.initSide()
  }

  return toolBarLTContainer
}

/**
 * 插件入口函数，为目标 MindElixir 实例添加自定义工具栏（右下方工具栏、左上方工具栏）
 * @param mind MindElixir 实例，用于挂载工具栏并操作地图视图
 */
export default function (mind: MindElixirInstance) {
  // 将右下角工具栏添加到目标容器中
  mind.container.append(createToolBarRBContainer(mind))
  // 将左上角工具栏添加到目标容器中
  mind.container.append(createToolBarLTContainer(mind))
}
