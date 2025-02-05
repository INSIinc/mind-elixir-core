// 导入 Playwright 测试框架的配置函数和设备预设
import { defineConfig, devices } from '@playwright/test'

/**
 * 从文件中读取环境变量。
 * 使用 dotenv 库加载 .env 文件中的配置项到 process.env 中。
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * Playwright 测试框架的配置文件。
 * 此文件用于定义测试运行时的各种设置，包括超时时间、测试目录、并行执行等。
 * 官方文档: https://playwright.dev/docs/test-configuration.
 */

// 使用 defineConfig 函数定义 Playwright 的配置对象，并导出默认配置
export default defineConfig({
  // 设置全局超时时间为 10 秒（单位为毫秒）
  timeout: 10000,

  // 指定测试文件存放的目录
  testDir: './tests',

  /* 
   * 启用完全并行运行测试文件。
   * 这意味着多个测试文件可以在不同的工作线程中同时运行。
   */
  fullyParallel: true,

  /* 
   * 在 CI 环境下，如果代码中意外留下了 test.only，则会导致构建失败。
   * 禁止使用 test.only 是为了防止部分测试被忽略。
   */
  forbidOnly: !!process.env.CI,

  /* 
   * 在 CI 环境下启用重试机制。
   * 如果测试失败，将在 CI 中重试最多 2 次；本地环境下不重试。
   */
  retries: process.env.CI ? 2 : 0,

  /* 
   * 在 CI 环境下禁用并行测试。
   * 如果未指定 workers，则会根据 CPU 核心数自动分配工作线程。
   */
  workers: process.env.CI ? 1 : undefined,

  /* 
   * 配置测试报告工具。
   * 'html' 报告器会生成一个可视化的 HTML 报告，便于查看测试结果。
   * 更多信息: https://playwright.dev/docs/test-reporters
   */
  reporter: 'html',

  /* 
   * 全局共享的测试选项。
   * 这些选项会被应用到所有项目中。
   * 文档参考: https://playwright.dev/docs/api/class-testoptions
   */
  use: {
    /* 
     * 设置基础 URL，用于导航操作（如 `await page.goto('/')`）。
     * 如果未注释，所有相对路径将基于此 URL。
     */
    // baseURL: 'http://127.0.0.1:3000',

    /* 
     * 收集失败测试的追踪信息。
     * 'on-first-retry' 表示仅在首次重试时收集追踪信息。
     * 跟踪查看器文档: https://playwright.dev/docs/trace-viewer
     */
    trace: 'on-first-retry',
  },

  /* 
   * 定义测试项目及其配置。
   * 每个项目可以针对不同的浏览器或设备进行测试。
   */
  projects: [
    {
      name: 'chromium', // 项目名称：Chromium 浏览器
      use: { ...devices['Desktop Chrome'] }, // 使用桌面版 Chrome 的预设配置
    },

    // {
    //   name: 'firefox', // 项目名称：Firefox 浏览器
    //   use: { ...devices['Desktop Firefox'] }, // 使用桌面版 Firefox 的预设配置
    // },

    // {
    //   name: 'webkit', // 项目名称：WebKit 浏览器
    //   use: { ...devices['Desktop Safari'] }, // 使用桌面版 Safari 的预设配置
    // },

    /* 
     * 针对移动设备视口的测试项目。
     * 示例包括 Pixel 5 和 iPhone 12。
     */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* 
     * 针对品牌浏览器的测试项目。
     * 示例包括 Microsoft Edge 和 Google Chrome。
     */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* 
   * 在启动测试前运行本地开发服务器。
   * 可以通过命令启动服务，并等待其监听指定的 URL。
   */
  // webServer: {
  //   command: 'npm run start', // 启动开发服务器的命令
  //   url: 'http://127.0.0.1:3000', // 开发服务器的地址
  //   reuseExistingServer: !process.env.CI, // 是否复用已有的服务器实例
  // },
})