/**
 * 文件：LinkDragMoveHelper.ts
 * 功能描述：
 * 提供一个用于处理 HTML 元素拖动操作的辅助工具。通过监听鼠标事件，支持区分点击和拖动行为，
 * 并在拖动时处理具体的拖动逻辑和回调函数。
 * 使用场景：
 * 适用于需要通过鼠标拖动交互的功能模块，例如图形界面布局调整、连线编辑等。
 */

const create = function (dom: HTMLElement) {
  return {
    // 绑定的 HTML 元素
    dom,

    // 标志用于区分点击与拖动操作
    moved: false,

    // 标志鼠标按下状态
    mousedown: false,

    /**
     * 鼠标移动事件处理器
     * 功能：检测鼠标是否在按下状态，并处理拖动逻辑。
     * @param e - 鼠标事件对象
     */
    handleMouseMove(e: MouseEvent) {
      if (this.mousedown) {
        this.moved = true // 表示发生了拖动操作
        this.cb && this.cb(e.movementX, e.movementY) // 执行回调函数，传入鼠标移动的偏移值
      }
    },

    /**
     * 鼠标按下事件处理器
     * 功能：标记鼠标已按下，并限制只响应左键操作。
     * @param e - 鼠标事件对象
     */
    handleMouseDown(e: MouseEvent) {
      // 仅在鼠标左键按下时生效
      if (e.button !== 0) return
      this.mousedown = true
    },

    /**
     * 清理事件处理器
     * 功能：重置状态标志（例如鼠标按下状态和拖动状态）。
     * @param e - 鼠标事件对象
     */
    handleClear(e: MouseEvent) {
      this.mousedown = false
    },

    // 拖动时的回调函数，用于接收鼠标移动的偏移值
    cb: null as ((deltaX: number, deltaY: number) => void) | null,

    /**
     * 初始化事件监听
     * 功能：绑定必要的事件处理器到指定的 HTML 元素上，以实现拖动功能。
     * @param map - 目标 HTML 元素
     * @param cb - 拖动时的回调函数，接收横纵方向的偏移量
     */
    init(map: HTMLElement, cb: (deltaX: number, deltaY: number) => void) {
      this.cb = cb

      // 确保事件处理器内部的 `this` 始终指向当前实例
      this.handleClear = this.handleClear.bind(this)
      this.handleMouseMove = this.handleMouseMove.bind(this)
      this.handleMouseDown = this.handleMouseDown.bind(this)

      // 绑定鼠标相关事件
      map.addEventListener('mousemove', this.handleMouseMove)
      map.addEventListener('mouseleave', this.handleClear)
      map.addEventListener('mouseup', this.handleClear)
      this.dom.addEventListener('mousedown', this.handleMouseDown)
    },

    /**
     * 销毁事件监听
     * 功能：移除初始化时绑定的事件监听器，释放资源。
     * @param map - 目标 HTML 元素
     */
    destory(map: HTMLElement) {
      map.removeEventListener('mousemove', this.handleMouseMove)
      map.removeEventListener('mouseleave', this.handleClear)
      map.removeEventListener('mouseup', this.handleClear)
      this.dom.removeEventListener('mousedown', this.handleMouseDown)
    },

    /**
     * 清理状态
     * 功能：重置实例的内部状态（例如拖动状态和鼠标按下状态）。
     */
    clear() {
      this.moved = false
      this.mousedown = false
    },
  }
}

/**
 * LinkDragMoveHelper
 * 核心功能：提供一种便捷的拖动交互工具，以便在应用中创建拖动实例。
 */
const LinkDragMoveHelper = {
  create, // 工厂方法，用于生成拖动辅助实例
}

// 类型定义：LinkDragMoveHelper 实例的返回类型
export type LinkDragMoveHelperInstance = ReturnType<typeof create>

// 默认导出 LinkDragMoveHelper，以供外部模块使用
export default LinkDragMoveHelper