// 本模块为 TypeScript 声明文件，负责为全局对象进行类型扩展。
// 使用场景：主要用于扩展浏览器环境下全局的 Element 接口，
// 以支持更多类型化的 setAttribute 方法，确保类型安全性。

export { }

declare global {
  // 为浏览器的全局 Element 接口扩展方法类型
  interface Element {
    /**
     * 重载方法：为元素设置属性，并接收布尔值类型
     * 
     * @param name - 属性名称，表示需要设置的 HTML 属性
     * @param value - 属性值，类型为布尔值
     */
    setAttribute(name: string, value: boolean): void

    /**
     * 重载方法：为元素设置属性，并接收数值类型
     * 
     * @param name - 属性名称，表示需要设置的 HTML 属性
     * @param value - 属性值，类型为数字
     */
    setAttribute(name: string, value: number): void
  }
}