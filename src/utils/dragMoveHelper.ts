/**
 * 模块功能描述:
 * 此模块提供了一个拖动移动的辅助工具，用于捕获鼠标拖拽事件并滚动指定容器。
 * 使用场景:
 * 适用于需要通过拖拽操作来改变容器滚动位置的功能，例如图片查看器、地图控件等。
 */
export default {
  moved: false, // 标识是否发生拖拽移动，用于区分点击和拖动的操作
  mousedown: false, // 标识鼠标是否按下

  /**
   * onMove方法
   * 功能描述:
   * 根据鼠标拖拽操作实时滚动容器内容。
   * 
   * @param e - 捕获的鼠标事件，通过此获取鼠标移动的位移数据。
   * @param container - 目标HTML容器元素，需要对其执行滚动操作。
   * 
   * 注意:
   * - 此方法需在鼠标按下状态（mousedown为true）时执行。
   */
  onMove(e: MouseEvent, container: HTMLElement) {
    if (this.mousedown) { // 检查鼠标是否处于按下状态，只有在按下时允许移动
      this.moved = true // 标记为已发生移动
      const deltaX = e.movementX // 鼠标在X轴上的移动距离
      const deltaY = e.movementY // 鼠标在Y轴上的移动距离
      // 通过offset移动，更新容器的滚动位置
      container.scrollTo(container.scrollLeft - deltaX, container.scrollTop - deltaY)
    }
  },

  /**
   * clear方法
   * 功能描述:
   * 重置内部状态，清除拖动标识。主要适用于操作结束后的清理工作。
   * 
   * 注意:
   * - 采用了setTimeout以确保清理操作不会与其他快速触发的事件（如右键菜单）冲突。
   */
  clear() {
    // 使用延时以避免触发如contextmenu（右键菜单）的事件时干扰当前逻辑
    setTimeout(() => {
      this.moved = false // 重置移动状态
      this.mousedown = false // 重置鼠标按下状态
    }, 0)
  },
}