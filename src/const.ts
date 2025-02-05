// 本模块为常量配置模块，定义了应用程序中的一些基础方向常量值及主题配置。
// 使用场景：应用于设置界面方向以及主题样式，方便在应用中进行统一调用和管理。

import type { Theme } from '.'

// 定义方向常量值，表示具体的方向。
// LEFT 表示左侧方向
export const LEFT = 0
// RIGHT 表示右侧方向
export const RIGHT = 1
// SIDE 表示侧向，具体用途可根据上下文使用
export const SIDE = 2
// DOWN 表示向下方向
export const DOWN = 3

// 定义亮色主题配置，主题名称为 Latte
export const THEME: Theme = {
  name: 'Latte', // 主题名称
  type: 'light', // 主题类型：亮色
  palette: [
    // 配色调色板，主要用于主题中的颜色替换，便于统一管理配色
    '#dd7878', '#ea76cb', '#8839ef', '#e64553', '#fe640b',
    '#df8e1d', '#40a02b', '#209fb5', '#1e66f5', '#7287fd'
  ],
  cssVar: {
    // CSS变量，用于动态设置官方规范的主题样式
    '--gap': '30px', // 间距大小
    '--main-color': '#444446', // 主要文字颜色
    '--main-bgcolor': '#ffffff', // 主背景色
    '--color': '#777777', // 通用文字颜色
    '--bgcolor': '#f6f6f6', // 全局背景色
    '--panel-color': '#444446', // 面板文字颜色
    '--panel-bgcolor': '#ffffff', // 面板背景色
    '--panel-border-color': '#eaeaea', // 面板边框颜色
  },
}

// 定义暗色主题配置，主题名称为 Dark
export const DARK_THEME: Theme = {
  name: 'Dark', // 主题名称
  type: 'dark', // 主题类型：暗色
  palette: [
    // 配色调色板，主要用于主题中的颜色替换，与亮色主题区分开
    '#848FA0', '#748BE9', '#D2F9FE', '#4145A5', '#789AFA',
    '#706CF4', '#EF987F', '#775DD5', '#FCEECF', '#DA7FBC'
  ],
  cssVar: {
    // CSS变量，用于动态设置官方规范的主题样式
    '--main-color': '#ffffff', // 主要文字颜色
    '--main-bgcolor': '#4c4f69', // 主背景色
    '--color': '#cccccc', // 通用文字颜色
    '--bgcolor': '#252526', // 全局背景色
    '--panel-color': '#ffffff', // 面板文字颜色
    '--panel-bgcolor': '#2d3748', // 面板背景色
    '--panel-border-color': '#696969', // 面板边框颜色
  },
}