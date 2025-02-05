/**
 * 模块/文件功能描述:
 * 本模块提供了更改主题功能的实现，用于动态更新MindElixir实例的主题样式。
 *
 * 使用场景:
 * 当需要在运行时更改MindElixir脑图的主题时，可调用此模块提供的`changeTheme`函数。
 */

import type { MindElixirInstance } from '../types/index'
import type { Theme } from '../types/index'

/**
 * 方法功能详细描述:
 * 用于更改MindElixir实例的主题，动态更新界面所应用的CSS变量。如果指定，应在更改后刷新界面。
 *
 * 输入参数解析:
 * @param {Theme} theme - 要应用的新主题，包含CSS变量配置。
 * @param {boolean} [shouldRefresh=true] - 标记是否在更新主题后立即刷新界面，默认为`true`。
 *
 * 返回值说明:
 * 无返回值，但会直接修改实例的样式。
 *
 * 异常处理机制:
 * 本方法假设调用实例和参数的合法性，未处理实例或参数为`null`或`undefined`等异常情况。
 */
const changeTheme = function (this: MindElixirInstance, theme: Theme, shouldRefresh = true) {
  // 更新MindElixir实例的主题对象
  this.theme = theme

  // 获取主题指定的CSS变量对象
  const cssVar = this.theme.cssVar

  // 提取CSS变量的所有键名
  const keys = Object.keys(cssVar)

  // 清空mindElixirBox的行内样式，以便重新设置
  this.mindElixirBox.style.cssText = ''

  // 遍历CSS变量并动态设置到mindElixirBox的样式中
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i] as keyof typeof cssVar
    // 将CSS变量应用为mindElixirBox的样式属性
    this.mindElixirBox.style.setProperty(key, cssVar[key] as string)
  }

  // 检查是否提供了'--gap'变量，若未提供则设置默认值30px
  if (!theme.cssVar['--gap']) {
    this.mindElixirBox.style.setProperty('--gap', '30px')
  }

  // 根据shouldRefresh参数判断是否需要刷新界面
  shouldRefresh && this.refresh()
}

export default changeTheme