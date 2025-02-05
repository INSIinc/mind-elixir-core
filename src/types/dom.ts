/**
 * @module dom.ts
 * @description 此模块定义了一组与 DOM 元素相关的接口，用于结构化和类型化 DOM 节点及其关系。
 * @usage 用于类型限定，以确保 DOM 操作时的元素具有指定的属性和结构。
 */

import type { Arrow } from '../arrow'
import type { NodeObj } from './index'

/**
 * @interface Wrapper
 * @description 表示一个包装器节点（Wrapper），是自定义 DOM 层次中最外层的元素。
 */
export interface Wrapper extends HTMLElement {
  /**
   * @property firstChild - 表示第一个子节点，其类型为 Parent。
   */
  firstChild: Parent
  /**
   * @property children - 表示子节点集合，包括特定的 Parent 与 Children 类型。
   */
  children: HTMLCollection & [Parent, Children]
  /**
   * @property parentNode - 节点的直接父节点。
   */
  parentNode: Children
  parentElement: Children
  offsetParent: Wrapper
  previousSibling: Wrapper | null
  nextSibling: Wrapper | null
}

/**
 * @interface Parent
 * @description 表示父节点（Parent），它可以包含 Topic 和 Expander 类型的子节点。
 */
export interface Parent extends HTMLElement {
  firstChild: Topic
  /**
   * @property children - 表示子节点集合，包括 Topic 和（可选的）Expander。
   */
  children: HTMLCollection & [Topic, Expander | undefined]
  parentNode: Wrapper
  parentElement: Wrapper
  nextSibling: Children
  offsetParent: Wrapper
}

/**
 * @interface Children
 * @description 表示子节点（Children），用于描述 Wrapper 类型的后代结构。
 */
export interface Children extends HTMLElement {
  parentNode: Wrapper
  /**
   * @property children - 表示子节点集合，其类型为多个 Wrapper。
   */
  children: HTMLCollection & Wrapper[]
  parentElement: Wrapper
  firstChild: Wrapper
  previousSibling: Parent
}

/**
 * @interface Topic
 * @description 表示一个主题节点（Topic），其内可以包含多种内容如文本、图标等。
 */
export interface Topic extends HTMLElement {
  /**
   * @property nodeObj - 与此主题节点关联的对象。
   */
  nodeObj: NodeObj
  parentNode: Parent
  parentElement: Parent
  offsetParent: Parent
  /**
   * @property text - 表示主题的文本内容。
   */
  text: HTMLSpanElement
  /**
   * @property expander - 可选项，表示用于展开/折叠的节点。
   */
  expander?: Expander

  /**
   * @property link - 可选项，用于存储与主题相关的超链接。
   */
  link?: HTMLElement
  image?: HTMLImageElement
  icons?: HTMLSpanElement
  tags?: HTMLDivElement
}

/**
 * @interface Expander
 * @description 表示一个可展开或折叠操作的控件节点（Expander）。
 */
export interface Expander extends HTMLElement {
  /**
   * @property expanded - 可选项，指示当前节点是否处于展开状态。
   */
  expanded?: boolean
  parentNode: Parent
  parentElement: Parent
  previousSibling: Topic
}

/**
 * @type CustomLine
 * @description 表示自定义的 SVG 路径，用于绘制线段。
 */
export type CustomLine = SVGPathElement

/**
 * @type CustomArrow
 * @description 表示自定义的 SVG 路径，用于绘制箭头。
 */
export type CustomArrow = SVGPathElement

/**
 * @interface CustomSvg
 * @description 表示一个自定义的 SVG 组（<g>）元素，用于包含箭头、线条和文本等元素。
 */
export interface CustomSvg extends SVGGElement {
  /**
   * @property arrowObj - 与此 SVG 组关联的箭头对象。
   */
  arrowObj: Arrow
  /**
   * @property children - 此 SVG 组的子元素集合，包括线段、箭头和文本。
   */
  children: HTMLCollection & [CustomLine, CustomArrow, SVGTextElement]
}