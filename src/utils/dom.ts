import { LEFT } from '../const'
import type { Topic, Wrapper, Parent, Children, Expander } from '../types/dom'
import type { MindElixirInstance, NodeObj } from '../types/index'
import { encodeHTML } from '../utils/index'
import { layoutChildren } from './layout'
/**
 * @fileoverview 提供DOM操作相关的工具函数，用于创建、查找和修改思维导图中的节点元素。
 * 主要包括节点的查找、样式设置、内容填充、子节点布局等功能。
 * 适用于MindElixir思维导图库的核心功能实现。
 */

// DOM manipulation
const $d = document;

/**
 * 查找指定ID的节点元素。
 * 
 * @param {string} id 节点ID
 * @param {MindElixirInstance} [instance] MindElixir实例，用于限定查询范围
 * @returns {Topic} 返回匹配的节点元素
 * @throws 当节点未找到时抛出错误
 */
export const findEle = (id: string, instance?: MindElixirInstance) => {
  const scope = instance ? instance.mindElixirBox : $d;
  const ele = scope.querySelector<Topic>(`[data-nodeid=me${id}]`);
  if (!ele) throw new Error(`FindEle: Node ${id} not found, maybe it's collapsed.`);
  return ele;
};

/**
 * 根据NodeObj对象设置Topic节点的内容和样式。
 * 
 * @param {Topic} tpc Topic节点元素
 * @param {NodeObj} nodeObj 包含节点数据的对象
 * 功能描述：
 * - 设置节点文字颜色、背景色、字体大小等样式
 * - 支持插入图片、超链接、图标、标签等内容
 * - 清理不存在于nodeObj中的旧内容
 */
export const shapeTpc = function (tpc: Topic, nodeObj: NodeObj) {
  tpc.innerHTML = '';

  if (nodeObj.style) {
    // 设置节点样式
    tpc.style.color = nodeObj.style.color || '';
    tpc.style.background = nodeObj.style.background || '';
    tpc.style.fontSize = nodeObj.style.fontSize + 'px';
    tpc.style.fontWeight = nodeObj.style.fontWeight || 'normal';
  }

  if (nodeObj.dangerouslySetInnerHTML) {
    // 直接插入HTML内容
    tpc.innerHTML = nodeObj.dangerouslySetInnerHTML;
    return;
  }

  if (nodeObj.image) {
    const img = nodeObj.image;
    if (img.url && img.width && img.height) {
      // 创建并插入图片元素
      const imgEl = $d.createElement('img');
      imgEl.src = img.url;
      imgEl.style.width = img.width + 'px';
      imgEl.style.height = img.height + 'px';
      if (img.fit) imgEl.style.objectFit = img.fit;
      tpc.appendChild(imgEl);
      tpc.image = imgEl;
    } else {
      console.warn('Image url/width/height are required');
    }
  } else if (tpc.image) {
    // 清除旧图片
    tpc.image = undefined;
  }

  {
    // 创建并插入文字内容
    const textEl = $d.createElement('span');
    textEl.className = 'text';
    textEl.textContent = nodeObj.topic;
    tpc.appendChild(textEl);
    tpc.text = textEl;
  }

  if (nodeObj.hyperLink) {
    // 创建并插入超链接图标
    const linkEl = $d.createElement('a');
    linkEl.className = 'hyper-link';
    linkEl.target = '_blank';
    linkEl.innerText = '🔗';
    linkEl.href = nodeObj.hyperLink;
    tpc.appendChild(linkEl);
    tpc.link = linkEl;
  } else if (tpc.link) {
    tpc.link = undefined;
  }

  if (nodeObj.icons && nodeObj.icons.length) {
    // 创建并插入图标组
    const iconsEl = $d.createElement('span');
    iconsEl.className = 'icons';
    iconsEl.innerHTML = nodeObj.icons.map(icon => `<span>${encodeHTML(icon)}</span>`).join('');
    tpc.appendChild(iconsEl);
    tpc.icons = iconsEl;
  } else if (tpc.icons) {
    tpc.icons = undefined;
  }

  if (nodeObj.tags && nodeObj.tags.length) {
    // 创建并插入标签组
    const tagsEl = $d.createElement('div');
    tagsEl.className = 'tags';
    tagsEl.innerHTML = nodeObj.tags.map(tag => `<span>${encodeHTML(tag)}</span>`).join('');
    tpc.appendChild(tagsEl);
    tpc.tags = tagsEl;
  } else if (tpc.tags) {
    tpc.tags = undefined;
  }
};

/**
 * 创建Wrapper节点及其子节点结构。
 * 
 * @this {MindElixirInstance} MindElixir实例
 * @param {NodeObj} nodeObj 节点数据对象
 * @param {boolean} [omitChildren] 是否忽略子节点
 * @returns {{ grp: Wrapper; top: Parent; tpc: Topic }} 返回包含Wrapper、Parent和Topic的结构
 */
export const createWrapper = function (this: MindElixirInstance, nodeObj: NodeObj, omitChildren?: boolean) {
  const grp = $d.createElement('me-wrapper') as Wrapper;
  const { p, tpc } = this.createParent(nodeObj);
  grp.appendChild(p);
  if (!omitChildren && nodeObj.children && nodeObj.children.length > 0) {
    const expander = createExpander(nodeObj.expanded);
    p.appendChild(expander);
    if (nodeObj.expanded !== false) {
      const children = layoutChildren(this, nodeObj.children);
      grp.appendChild(children);
    }
  }
  return { grp, top: p, tpc };
};

/**
 * 创建Parent节点及其Topic子节点。
 * 
 * @this {MindElixirInstance} MindElixir实例
 * @param {NodeObj} nodeObj 节点数据对象
 * @returns {{ p: Parent; tpc: Topic }} 返回Parent和Topic节点
 */
export const createParent = function (this: MindElixirInstance, nodeObj: NodeObj) {
  const p = $d.createElement('me-parent') as Parent;
  const tpc = this.createTopic(nodeObj);
  shapeTpc(tpc, nodeObj);
  p.appendChild(tpc);
  return { p, tpc };
};

/**
 * 创建Children节点并添加多个Wrapper子节点。
 * 
 * @this {MindElixirInstance} MindElixir实例
 * @param {Wrapper[]} wrappers 多个Wrapper节点
 * @returns {Children} 返回Children节点
 */
export const createChildren = function (this: MindElixirInstance, wrappers: Wrapper[]) {
  const children = $d.createElement('me-children') as Children;
  children.append(...wrappers);
  return children;
};

/**
 * 创建Topic节点并初始化其基本属性。
 * 
 * @this {MindElixirInstance} MindElixir实例
 * @param {NodeObj} nodeObj 节点数据对象
 * @returns {Topic} 返回Topic节点
 */
export const createTopic = function (this: MindElixirInstance, nodeObj: NodeObj) {
  const topic = $d.createElement('me-tpc') as Topic;
  topic.nodeObj = nodeObj;
  topic.dataset.nodeid = 'me' + nodeObj.id;
  topic.draggable = this.draggable;
  return topic;
};

/**
 * 选中指定元素内的文本内容。
 * 
 * @param {HTMLElement} div 目标元素
 */
export function selectText(div: HTMLElement) {
  const range = $d.createRange();
  range.selectNodeContents(div);
  const getSelection = window.getSelection();
  if (getSelection) {
    getSelection.removeAllRanges();
    getSelection.addRange(range);
  }
}

/**
 * 编辑指定Topic节点的文字内容。
 * 
 * @this {MindElixirInstance} MindElixir实例
 * @param {Topic} el 目标Topic节点
 * 功能描述：
 * - 创建可编辑的输入框，允许用户修改节点文字
 * - 支持Enter/Tab快捷键提交修改
 * - 修改完成后触发相关事件并更新节点内容
 */
export const editTopic = function (this: MindElixirInstance, el: Topic) {
  console.time('editTopic');
  if (!el) return;
  const div = $d.createElement('div');
  const origin = el.text.textContent as string;
  el.appendChild(div);
  div.id = 'input-box';
  div.textContent = origin;
  div.contentEditable = 'true';
  div.spellcheck = false;
  const style = getComputedStyle(el);
  div.style.cssText = `min-width:${el.offsetWidth - 8}px;
  color:${style.color};
  padding:${style.padding};
  margin:${style.margin};
  font:${style.font};
  background-color:${style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor};
  border-radius:${style.borderRadius};`;
  if (this.direction === LEFT) div.style.right = '0';
  div.focus();

  selectText(div);

  this.bus.fire('operation', {
    name: 'beginEdit',
    obj: el.nodeObj,
  });

  div.addEventListener('keydown', e => {
    e.stopPropagation();
    const key = e.key;

    if (key === 'Enter' || key === 'Tab') {
      if (e.shiftKey) return;
      e.preventDefault();
      div.blur();
      this.map.focus();
    }
  });
  div.addEventListener('blur', () => {
    if (!div) return;
    const node = el.nodeObj;
    const topic = div.textContent?.trim() || '';
    if (topic === '') node.topic = origin;
    else node.topic = topic;
    div.remove();
    if (topic === origin) return;
    el.text.textContent = node.topic;
    this.linkDiv();
    this.bus.fire('operation', {
      name: 'finishEdit',
      obj: node,
      origin,
    });
  });
  console.timeEnd('editTopic');
};

/**
 * 创建Expander节点用于控制子节点的展开/折叠状态。
 * 
 * @param {boolean | undefined} expanded 初始展开状态
 * @returns {Expander} 返回Expander节点
 */
export const createExpander = function (expanded: boolean | undefined): Expander {
  const expander = $d.createElement('me-epd') as Expander;
  expander.expanded = expanded !== false;
  expander.className = expanded !== false ? 'minus' : '';
  return expander;
};