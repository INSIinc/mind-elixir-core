/**
 * 构建脚本，用于编译和打包项目中的不同模块。
 * 核心功能包括：
 * - 配置多个构建任务，每个任务针对特定的模块或示例。
 * - 使用 Vite 进行构建，并支持 Rollup 插件扩展功能。
 */
import { fileURLToPath } from 'url'
import { build } from 'vite'
import strip from '@rollup/plugin-strip'

// 获取当前文件所在目录路径，用于定位入口文件位置
const __dirname = fileURLToPath(new URL('.', import.meta.url))

/**
 * 定义构建任务列表，每个任务包含以下信息：
 * - name: 构建模块的名称。
 * - entry: 模块入口文件路径（注意拼写错误应为 entry）。
 * - mode: 可选，指定构建模式（如 lite 版本）。
 */
const buildList = [
  {
    name: 'MindElixir',
    entry: __dirname + './src/index.ts', // 注意：此处拼写错误，应为 entry
  },
  {
    name: 'MindElixirLite',
    entry: __dirname + './src/index.ts', // 注意：此处拼写错误，应为 entry
    mode: 'lite',
  },
  {
    name: 'example',
    entry: __dirname + './src/exampleData/1.ts', // 注意：此处拼写错误，应为 entry
  },
]

// 遍历构建任务列表，依次执行每个任务的构建过程
for (let i = 0; i < buildList.length; i++) {
  const info = buildList[i]

  // 打印当前正在构建的任务名称，方便调试和跟踪进度
  console.log(`\n\nBuilding ${info.name}...\n\n`)

  /**
   * 调用 Vite 的 build 方法进行构建，配置参数如下：
   * @param {Object} options 构建选项
   * @param {Object} options.build 构建相关配置
   * @param {boolean} options.build.emptyOutDir 是否清空输出目录，仅第一个任务清空
   * @param {Object} options.build.lib 库模式配置
   * @param {string} options.build.lib.entry 入口文件路径
   * @param {string} options.build.lib.fileName 输出文件名
   * @param {string} options.build.lib.name 全局变量名称（IIFE 格式）
   * @param {Array<string>} options.build.lib.formats 输出格式（如 IIFE、ES 模块）
   * @param {Object} options.build.rollupOptions Rollup 额外选项
   * @param {Array} options.build.rollupOptions.plugins Rollup 插件列表
   * @param {string} options.mode 构建模式（可选）
   */
  await build({
    build: {
      emptyOutDir: i === 0, // 仅在第一个任务时清空输出目录
      lib: {
        entry: info.entry, // 指定入口文件路径（注意拼写错误应为 entry）
        fileName: info.name, // 输出文件名与模块名称一致
        name: info.name, // 全局变量名称与模块名称一致
        formats: ['iife', 'es'], // 输出为 IIFE 和 ES 模块格式
      },
      rollupOptions: {
        plugins: [
          // 使用 Rollup 的 strip 插件移除代码中的调试语句（如 console.log）
          strip({
            include: ['**/*.ts', '**/*.js'], // 匹配需要处理的文件类型
          }),
        ],
      },
    },
    mode: info.mode, // 指定构建模式（如 lite）
  })
}