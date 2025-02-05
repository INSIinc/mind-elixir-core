import i18n from '../i18n'
import type { Topic } from '../types/dom'
import type { MindElixirInstance } from '../types/index'
import { encodeHTML, isTopic } from '../utils/index'
import dragMoveHelper from '../utils/dragMoveHelper'
import './contextMenu.less'

export type ContextMenuOption = {
  // 是否聚焦选项
  focus?: boolean
  // 是否链接选项
  link?: boolean
  // 扩展选项数组，每个选项具有名称、快捷键和点击事件
  extend?: {
    name: string
    key?: string
    onclick: (e: MouseEvent) => void
  }[]
}

// 默认导出函数，负责创建右键菜单，并将其添加到指定的思维导图实例中
export default function (mind: MindElixirInstance, option?: ContextMenuOption) {
  // 创建提示信息的DOM元素
  const createTips = (words: string) => {
    const div = document.createElement('div')
    div.innerText = words // 设置提示文本
    div.className = 'tips' // 赋予类名
    return div
  }
  // 创建菜单项的DOM元素，包括ID、名称和快捷键显示
  const createLi = (id: string, name: string, keyname: string) => {
    const li = document.createElement('li')
    li.id = id
    // 使用HTML模板字符串设置内部HTML
    li.innerHTML = `<span>${encodeHTML(name)}</span><span ${keyname ? 'class="key"' : ''}>${encodeHTML(keyname)}</span>`
    return li
  }
  // 获取当前语言设置的翻译文本，如果找不到则使用英文
  const locale = i18n[mind.locale] ? mind.locale : 'en'
  const lang = i18n[locale]

  // 初始化各种菜单项
  const add_child = createLi('cm-add_child', lang.addChild, 'Tab')
  const add_parent = createLi('cm-add_parent', lang.addParent, 'Ctrl + Enter')
  const add_sibling = createLi('cm-add_sibling', lang.addSibling, 'Enter')
  const remove_child = createLi('cm-remove_child', lang.removeNode, 'Delete')
  const focus = createLi('cm-fucus', lang.focus, '')
  const unfocus = createLi('cm-unfucus', lang.cancelFocus, '')
  const up = createLi('cm-up', lang.moveUp, 'PgUp')
  const down = createLi('cm-down', lang.moveDown, 'Pgdn')
  const link = createLi('cm-link', lang.link, '')
  const summary = createLi('cm-summary', lang.summary, '')

  // 创建菜单列表容器并添加子菜单项
  const menuUl = document.createElement('ul')
  menuUl.className = 'menu-list'
  menuUl.appendChild(add_child)
  menuUl.appendChild(add_parent)
  menuUl.appendChild(add_sibling)
  menuUl.appendChild(remove_child)
  if (!option || option.focus) {
    menuUl.appendChild(focus)
    menuUl.appendChild(unfocus)
  }
  menuUl.appendChild(up)
  menuUl.appendChild(down)
  menuUl.appendChild(summary)
  if (!option || option.link) {
    menuUl.appendChild(link)
  }
  if (option && option.extend) {
    for (let i = 0; i < option.extend.length; i++) {
      const item = option.extend[i]
      const dom = createLi(item.name, item.name, item.key || '')
      menuUl.appendChild(dom)
      dom.onclick = e => {
        item.onclick(e) // 绑定自定义点击事件
      }
    }
  }

  // 创建上下文菜单的容器并隐藏，初始化为不可见
  const menuContainer = document.createElement('div')
  menuContainer.className = 'context-menu'
  menuContainer.appendChild(menuUl)
  menuContainer.hidden = true

  mind.container.append(menuContainer) // 将菜单容器添加到思维导图的DOM中
  let isRoot = true

  // 绑定右键菜单事件
  mind.container.oncontextmenu = function (e) {
    e.preventDefault() // 阻止默认右键菜单
    if (!mind.editable) return // 检查思维导图是否可编辑
    if (dragMoveHelper.moved) return // 如果正在拖动中，则不显示菜单
    const target = e.target as HTMLElement
    if (isTopic(target)) { // 检查事件目标是否为主题节点
      if (target.parentElement.tagName === 'ME-ROOT') {
        isRoot = true
      } else {
        isRoot = false
      }
      // 根据节点是否为根节点禁用或启用相关菜单项
      if (isRoot) {
        focus.className = 'disabled'
        up.className = 'disabled'
        down.className = 'disabled'
        add_parent.className = 'disabled'
        add_sibling.className = 'disabled'
        remove_child.className = 'disabled'
      } else {
        focus.className = ''
        up.className = ''
        down.className = ''
        add_parent.className = ''
        add_sibling.className = ''
        remove_child.className = ''
      }
      // 如果当前没有选中的节点，则选中事件目标的节点
      if (!mind.currentNodes) mind.selectNode(target)
      menuContainer.hidden = false // 使菜单容器可见

      // 如果正在拖动中则重置为初始状态
      if (dragMoveHelper.mousedown) {
        dragMoveHelper.mousedown = false
      }

      // 重置菜单位置的样式
      menuUl.style.top = ''
      menuUl.style.bottom = ''
      menuUl.style.left = ''
      menuUl.style.right = ''
      const rect = menuUl.getBoundingClientRect()
      const height = menuUl.offsetHeight
      const width = menuUl.offsetWidth

      // 根据窗口大小调整菜单显示位置
      const relativeY = e.clientY - rect.top
      const relativeX = e.clientX - rect.left

      if (height + relativeY > window.innerHeight) {
        menuUl.style.top = ''
        menuUl.style.bottom = '0px'
      } else {
        menuUl.style.bottom = ''
        menuUl.style.top = relativeY + 15 + 'px'
      }

      if (width + relativeX > window.innerWidth) {
        menuUl.style.left = ''
        menuUl.style.right = '0px'
      } else {
        menuUl.style.right = ''
        menuUl.style.left = relativeX + 10 + 'px'
      }
    }
  }

  // 处理菜单容器的点击事件，点击容器时隐藏菜单
  menuContainer.onclick = e => {
    if (e.target === menuContainer) menuContainer.hidden = true
  }

  // 点击添加子节点的事件处理
  add_child.onclick = () => {
    mind.addChild()
    menuContainer.hidden = true
  }

  // 点击插入父节点的事件处理
  add_parent.onclick = () => {
    mind.insertParent()
    menuContainer.hidden = true
  }

  // 点击插入兄弟节点的事件处理
  add_sibling.onclick = () => {
    if (isRoot) return // 如果是根节点则不响应
    mind.insertSibling('after')
    menuContainer.hidden = true
  }
  // 为右键菜单项的各种功能项绑定事件，提供思维导图节点的增删、移动、聚焦、链接等交互功能
  remove_child.onclick = () => {
    // 如果当前节点为根节点，不允许删除，直接返回
    if (isRoot) return
    // 调用 `mind` 对象的 `removeNode` 方法删除当前选中的节点
    mind.removeNode()
    // 隐藏右键菜单
    menuContainer.hidden = true
  }

  focus.onclick = () => {
    // 如果当前节点为根节点，不允许单独聚焦，直接返回
    if (isRoot) return
    // 调用 `mind` 对象的 `focusNode` 方法，将当前选定的非根节点设置为聚焦节点
    mind.focusNode(mind.currentNode as Topic)
    // 隐藏右键菜单
    menuContainer.hidden = true
  }

  unfocus.onclick = () => {
    // 调用 `mind` 对象的 `cancelFocus` 方法，取消当前的节点聚焦状态
    mind.cancelFocus()
    // 隐藏右键菜单
    menuContainer.hidden = true
  }

  up.onclick = () => {
    // 如果当前节点为根节点，不允许上移，直接返回
    if (isRoot) return
    // 调用 `moveUpNode` 方法将当前选中的节点向上移动位置
    mind.moveUpNode()
    // 隐藏右键菜单
    menuContainer.hidden = true
  }

  down.onclick = () => {
    // 如果当前节点为根节点，不允许下移，直接返回
    if (isRoot) return
    // 调用 `moveDownNode` 方法将当前选中的节点向下移动位置
    mind.moveDownNode()
    // 隐藏右键菜单
    menuContainer.hidden = true
  }

  link.onclick = () => {
    // 首先隐藏右键菜单
    menuContainer.hidden = true
    // 获取当前选中的节点，并命名为 `from`
    const from = mind.currentNode as Topic
    // 调用 `createTips` 动态创建交互提示文本，并展示与 `mind.container` 中
    const tips = createTips(lang.clickTips)
    mind.container.appendChild(tips)

    // 监听地图容器的 `click` 事件，仅触发一次（`once: true`）
    mind.map.addEventListener(
      'click',
      e => {
        e.preventDefault() // 阻止默认行为
        tips.remove() // 移除提示文字
        const target = e.target as Topic
        // 检查目标元素是否为节点（需要在 ME-PARENT 或 ME-ROOT 中）
        if (target.parentElement.tagName === 'ME-PARENT' || target.parentElement.tagName === 'ME-ROOT') {
          // 创建从 `from` 到 `target` 的连接箭头
          mind.createArrow(from, target)
        } else {
          console.log('link cancel') // 非法目标，取消链接
        }
      },
      {
        once: true, // 表示事件监听器只触发一次
      }
    )
  }

  summary.onclick = () => {
    // 隐藏右键菜单
    menuContainer.hidden = true
    // 创建总结性节点（如汇总某些节点的大纲功能）
    mind.createSummary()
    // 取消当前选中状态的所有节点
    mind.unselectNodes()
  }

  return () => {
    // 提供清理右键菜单事件的回调函数，解除 DOM 元素绑定的 `onclick` 事件：
    // 此部分代码可能保留后续用途或防止意外事件冲突
    add_child.onclick = null
    add_parent.onclick = null
    add_sibling.onclick = null
    remove_child.onclick = null
    focus.onclick = null
    unfocus.onclick = null
    up.onclick = null
    down.onclick = null
    link.onclick = null
    summary.onclick = null
    menuContainer.onclick = null
    mind.container.oncontextmenu = null
  }
}